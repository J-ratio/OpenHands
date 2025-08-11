import atexit
import json
import multiprocessing
import time
import uuid
import asyncio
import html2text
import tenacity

from openhands.core.exceptions import BrowserInitException
from openhands.core.logger import openhands_logger as logger
from openhands.runtime.browser.base64 import image_to_png_base64_url
from openhands.utils.shutdown_listener import should_continue, should_exit
from openhands.utils.tenacity_stop import stop_if_should_exit
from browsergym.utils.obs import flatten_dom_to_str, overlay_som

BROWSER_EVAL_GET_GOAL_ACTION = 'GET_EVAL_GOAL'
BROWSER_EVAL_GET_REWARDS_ACTION = 'GET_EVAL_REWARDS'


class BrowserEnv:
    def __init__(self, browsergym_eval_env: str | None = None):
        self.html_text_converter = self.get_html_text_converter()
        self.eval_mode = bool(browsergym_eval_env)
        self.eval_dir = ''
        self.browsergym_eval_env = browsergym_eval_env

        self.browser_side = None
        self.agent_side = None
        self.process = None

    def get_html_text_converter(self) -> html2text.HTML2Text:
        html_text_converter = html2text.HTML2Text()
        html_text_converter.ignore_links = False
        html_text_converter.ignore_images = True
        html_text_converter.images_to_alt = True
        html_text_converter.body_width = 0
        return html_text_converter

    def _setup_pipes(self):
        self.browser_side, self.agent_side = multiprocessing.Pipe()

    @tenacity.retry(
        wait=tenacity.wait_fixed(1),
        stop=tenacity.stop_after_attempt(5) | stop_if_should_exit(),
        retry=tenacity.retry_if_exception_type(BrowserInitException),
    )
    def init_browser(self) -> None:
        logger.debug('Starting browser env...')
        try:
            multiprocessing.set_start_method('spawn', force=True)
        except RuntimeError:
            pass

        self._setup_pipes()

        self.process = multiprocessing.Process(target=self.browser_process)
        self.process.start()

        if not self.check_alive(timeout=5):
            self.close()
            raise BrowserInitException('Failed to start browser environment.')

        atexit.register(self.close)

    async def init_browser_async(self) -> None:
        """Run init_browser in a background thread so it doesn't block asyncio loop."""
        await asyncio.to_thread(self.init_browser)

    def browser_process(self) -> None:
        logger.info('Started Browser process...')

        # Lazy import heavy modules in child process
        import gymnasium as gym

        if self.eval_mode:
            assert self.browsergym_eval_env is not None
            logger.info('Initializing browser env for web browsing evaluation.')
            if not self.browsergym_eval_env.startswith('browsergym/'):
                self.browsergym_eval_env = 'browsergym/' + self.browsergym_eval_env

            if 'visualwebarena' in self.browsergym_eval_env:
                import browsergym.visualwebarena
                import nltk
                nltk.download('punkt_tab', quiet=True)
            elif 'webarena' in self.browsergym_eval_env:
                import browsergym.webarena
            elif 'miniwob' in self.browsergym_eval_env:
                import browsergym.miniwob
            else:
                raise ValueError(f'Unsupported browsergym eval env: {self.browsergym_eval_env}')

            env = gym.make(self.browsergym_eval_env, tags_to_mark='all', timeout=100000)
        else:
            env = gym.make(
                'browsergym/openended',
                task_kwargs={'start_url': 'about:blank', 'goal': 'PLACEHOLDER_GOAL'},
                wait_for_user_message=False,
                headless=True,
                disable_env_checker=True,
                tags_to_mark='all',
            )

        obs, info = env.reset()
        logger.info('Successfully called env.reset')

        self.eval_goal = None
        self.goal_image_urls = []
        self.eval_rewards: list[float] = []
        if self.eval_mode:
            self.eval_goal = obs.get('goal')
            if 'goal_object' in obs and obs['goal_object']:
                self.eval_goal = obs['goal_object'][0].get('text', self.eval_goal)
                for message in obs['goal_object']:
                    if message['type'] == 'image_url':
                        image_src = message['image_url']
                        if isinstance(image_src, dict):
                            image_src = image_src['url']
                        self.goal_image_urls.append(image_src)
            logger.debug(f'Browsing goal: {self.eval_goal}')

        logger.info('Browser env started.')

        while should_continue():
            try:
                if self.browser_side.poll(timeout=0.01):
                    unique_request_id, action_data = self.browser_side.recv()

                    if unique_request_id == 'SHUTDOWN':
                        logger.debug('SHUTDOWN recv, shutting down browser env...')
                        env.close()
                        return
                    elif unique_request_id == 'IS_ALIVE':
                        self.browser_side.send(('ALIVE', None))
                        continue

                    if action_data['action'] == BROWSER_EVAL_GET_GOAL_ACTION:
                        self.browser_side.send(
                            (
                                unique_request_id,
                                {
                                    'text_content': self.eval_goal,
                                    'image_content': self.goal_image_urls,
                                },
                            )
                        )
                        continue
                    elif action_data['action'] == BROWSER_EVAL_GET_REWARDS_ACTION:
                        self.browser_side.send(
                            (
                                unique_request_id,
                                {'text_content': json.dumps(self.eval_rewards)},
                            )
                        )
                        continue

                    action = action_data['action']
                    obs, reward, terminated, truncated, info = env.step(action)

                    if self.eval_mode:
                        self.eval_rewards.append(reward)

                    html_str = flatten_dom_to_str(obs['dom_object'])
                    obs['text_content'] = self.html_text_converter.handle(html_str)
                    obs['set_of_marks'] = image_to_png_base64_url(
                        overlay_som(
                            obs['screenshot'], obs.get('extra_element_properties', {})
                        ),
                        add_data_prefix=True,
                    )
                    obs['screenshot'] = image_to_png_base64_url(
                        obs['screenshot'], add_data_prefix=True
                    )
                    obs['active_page_index'] = obs['active_page_index'].item()
                    obs['elapsed_time'] = obs['elapsed_time'].item()
                    self.browser_side.send((unique_request_id, obs))
            except KeyboardInterrupt:
                logger.debug('Browser env process interrupted by user.')
                try:
                    env.close()
                except Exception:
                    pass
                return

    def step(self, action_str: str, timeout: float = 100) -> dict:
        unique_request_id = str(uuid.uuid4())
        self.agent_side.send((unique_request_id, {'action': action_str}))
        start_time = time.time()
        while True:
            if should_exit() or time.time() - start_time > timeout:
                raise TimeoutError('Browser environment took too long to respond.')
            if self.agent_side.poll(timeout=0.01):
                response_id, obs = self.agent_side.recv()
                if response_id == unique_request_id:
                    return dict(obs)

    def check_alive(self, timeout: float = 60) -> bool:
        self.agent_side.send(('IS_ALIVE', None))
        if self.agent_side.poll(timeout=timeout):
            response_id, _ = self.agent_side.recv()
            if response_id == 'ALIVE':
                return True
            logger.debug(f'Browser env is not alive. Response ID: {response_id}')
        return False

    def close(self) -> None:
        if not self.process or not self.process.is_alive():
            return
        try:
            self.agent_side.send(('SHUTDOWN', None))
            self.process.join(5)
            if self.process.is_alive():
                logger.error('Browser process did not terminate, forcefully terminating...')
                self.process.terminate()
                self.process.join(5)
                if self.process.is_alive():
                    self.process.kill()
                    self.process.join(5)
            self.agent_side.close()
            self.browser_side.close()
        except Exception as e:
            logger.error(f'Encountered an error when closing browser env: {e}')
