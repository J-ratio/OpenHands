from dataclasses import dataclass, field

from openhands.core.schema import ObservationType
from openhands.events.event import RecallType
from openhands.events.observation.observation import Observation


@dataclass
class AgentStateChangedObservation(Observation):
    """This data class represents the result from delegating to another agent"""

    agent_state: str
    reason: str = ''
    observation: str = ObservationType.AGENT_STATE_CHANGED

    @property
    def message(self) -> str:
        return ''


@dataclass
class AgentCondensationObservation(Observation):
    """The output of a condensation action."""

    observation: str = ObservationType.CONDENSE

    @property
    def message(self) -> str:
        return self.content


@dataclass
class AgentThinkObservation(Observation):
    """The output of a think action.

    In practice, this is a no-op, since it will just reply a static message to the agent
    acknowledging that the thought has been logged.
    """

    observation: str = ObservationType.THINK

    @property
    def message(self) -> str:
        return self.content


@dataclass
class MicroagentKnowledge:
    """Represents knowledge from a triggered microagent.

    Attributes:
        name: The name of the microagent that was triggered
        trigger: The word that triggered this microagent
        content: The actual content/knowledge from the microagent
    """

    name: str
    trigger: str
    content: str


@dataclass
class RecallObservation(Observation):
    """The retrieval of content from a microagent or more microagents."""

    recall_type: RecallType
    observation: str = ObservationType.RECALL

    # workspace context
    repo_name: str = ''
    repo_directory: str = ''
    repo_branch: str = ''
    repo_instructions: str = ''
    runtime_hosts: dict[str, int] = field(default_factory=dict)
    additional_agent_instructions: str = ''
    date: str = ''
    custom_secrets_descriptions: dict[str, str] = field(default_factory=dict)
    conversation_instructions: str = ''
    working_dir: str = ''

    # knowledge
    microagent_knowledge: list[MicroagentKnowledge] = field(default_factory=list)
    """
    A list of MicroagentKnowledge objects, each containing information from a triggered microagent.

    Example:
    [
        MicroagentKnowledge(
            name="python_best_practices",
            trigger="python",
            content="Always use virtual environments for Python projects."
        ),
        MicroagentKnowledge(
            name="git_workflow",
            trigger="git",
            content="Create a new branch for each feature or bugfix."
        )
    ]
    """

    # h2loop backend recall - file data chunks
    chunked_files: dict[str, list[str]] = field(default_factory=dict)
    """
    Dictionary mapping file paths to their chunked content.
    Used for H2LOOP_BACKEND_RECALL to store file chunks retrieved from backend API
    without bloating the message body.

    Example:
    {
        "/workspace/test.txt": ["chunk1 content", "chunk2 content", "chunk3 content"],
        "/workspace/code.py": ["def hello():", "    print('world')", "    return True"]
    }
    """

    @property
    def message(self) -> str:
        if self.recall_type == RecallType.WORKSPACE_CONTEXT:
            return 'Added workspace context'
        elif self.recall_type == RecallType.KNOWLEDGE:
            return 'Added microagent knowledge'
        elif self.recall_type == RecallType.H2LOOP_BACKEND_RECALL:
            return f'Added chunked file data for {len(self.chunked_files)} file(s)'

    def __str__(self) -> str:
        # Build a string representation
        fields = []
        if self.recall_type == RecallType.WORKSPACE_CONTEXT:
            fields.extend(
                [
                    f'recall_type={self.recall_type}',
                    f'repo_name={self.repo_name}',
                    f'repo_instructions={self.repo_instructions[:20]}...',
                    f'runtime_hosts={self.runtime_hosts}',
                    f'additional_agent_instructions={self.additional_agent_instructions[:20]}...',
                    f'date={self.date}'
                    f'custom_secrets_descriptions={self.custom_secrets_descriptions}',
                    f'conversation_instructions={self.conversation_instructions[0:20]}...',
                ]
            )
        elif self.recall_type == RecallType.H2LOOP_BACKEND_RECALL:
            fields.extend(
                [
                    f'recall_type={self.recall_type}',
                    f'chunked_files={list(self.chunked_files.keys())}',
                ]
            )
        else:
            fields.extend(
                [
                    f'recall_type={self.recall_type}',
                ]
            )
        if self.microagent_knowledge:
            fields.extend(
                [
                    f'microagent_knowledge={", ".join([m.name for m in self.microagent_knowledge])}',
                ]
            )

        return f'**RecallObservation**\n{", ".join(fields)}'
