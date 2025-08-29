import { useSelector } from "react-redux";
import React from "react";
import posthog from "posthog-js";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { convertImageToBase64 } from "#/utils/convert-image-to-base-64";
import { TrajectoryActions } from "../trajectory/trajectory-actions";
import { createChatMessage } from "#/services/chat-service";
import { InteractiveChatBox } from "./interactive-chat-box";
import { RootState } from "#/store";
import { AgentState } from "#/types/agent-state";
import { generateAgentStateChangeEvent } from "#/services/agent-state-service";
import { FeedbackModal } from "../feedback/feedback-modal";
import { useScrollToBottom } from "#/hooks/use-scroll-to-bottom";
import { TypingIndicator } from "./typing-indicator";
import { useWsClient } from "#/context/ws-client-provider";
import { Messages } from "./messages";
import { ChatSuggestions } from "./chat-suggestions";
import { ActionSuggestions } from "./action-suggestions";
import { ScrollProvider } from "#/context/scroll-context";

import { ScrollToBottomButton } from "#/components/shared/buttons/scroll-to-bottom-button";
import { LoadingSpinner } from "#/components/shared/loading-spinner";
import { useGetTrajectory } from "#/hooks/mutation/use-get-trajectory";
import { downloadTrajectory } from "#/utils/download-trajectory";
import { displayErrorToast } from "#/utils/custom-toast-handlers";
import { useOptimisticUserMessage } from "#/hooks/use-optimistic-user-message";
import { useWSErrorMessage } from "#/hooks/use-ws-error-message";
import { ErrorMessageBanner } from "./error-message-banner";
import { shouldRenderEvent } from "./event-content-helpers/should-render-event";
import { useUploadFiles } from "#/hooks/mutation/use-upload-files";
import { useConfig } from "#/hooks/query/use-config";
import { useActiveConversation } from "#/hooks/query/use-active-conversation";
import { getIndicatorColor, getStatusCode } from "#/utils/status";
import { ChatSimulator } from "./chat-simulator";
import { GENERATE_CLASS_DIAGRAM_MESSAGES } from "#/fake_scripts/generate_class_diagram_data";
import { useSimulationMode } from "#/fake_scripts/simulation_context";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { PiInfinityLight } from "react-icons/pi";
import { UserQuerySuggestions } from "./user-query-suggestions";
import { OpenHandsAction } from "#/types/core/actions";
import { OpenHandsObservation } from "#/types/core/observations";
import { CompareChatMessage } from "./compare-chat-message";
import { CompareMessages } from "./compare-messages";
import { CompareChatSuggestions } from "./compare-chat-suggestions";

function getEntryPoint(
  hasRepository: boolean | null,
  hasReplayJson: boolean | null,
): string {
  if (hasRepository) return "github";
  if (hasReplayJson) return "replay";
  return "direct";
}

const llmModels = ["h2loop", "gpt-4o", "Claude", "Grok-4"];

const modelOneResponse: string = `
\`\`\`c
#include <stdint.h>

static int adc_read_channel(struct adc * const a, int ch, uint16_t * const val) {
    if (a == NULL || val == NULL) {
        return -1;
    }

    if (a->ops.start(ch) < 0) {
        return -1;
    }

    a->ops.delay_ms(1U);

    if (a->ops.read(ch, val) < 0) {
        return -1;
    }

    return 0;
}
\`\`\`
`;

const modelTwoResponse: string = `
\`\`\`c
#include <stdint.h>
#include <stddef.h>

/* Forward declaration of the ADC device structure. */
struct adc;

/* Forward declaration of the operations structure, used by the ADC device. */
struct adc_ops;

/* Externally declared ADC operations structure, assumed to be defined elsewhere. */
extern struct adc_ops ops;

/* ADC device structure expected to contain an operations pointer. */
struct adc {
    struct adc_ops *ops;
};

/* Operations functions, assumed to be defined elsewhere. */
struct adc_ops {
    int (*start)(int);
    void (*delay_ms)(unsigned int);
    int (*read)(int, uint16_t *);
};

/*
 * Read a single ADC channel value.
 *
 * @param a  Pointer to the ADC device (cannot be NULL).
 * @param ch ADC channel number (non-negative value assumed).
 * @param val Pointer to a uint16_t variable where the result is stored (cannot be NULL).
 * @return 0 on success, -1 on error.
 */
static int adc_read_channel(struct adc * const a, int ch, uint16_t * const val)
{
    /* Check for NULL pointers. */
    if ((a == NULL) || (val == NULL)) {
        return -1;
    }

    /* Validate channel number range: ADC channels are assumed to be >= 0. */
    if (ch < 0) {
        return -1;
    }

    /* Start conversion. */
    if ((a->ops->start)(ch) < 0) {
        return -1;
    }

    /* Delay for at least 1 ms. */
    (a->ops->delay_ms)((unsigned int)1U);

    /* Read conversion result. */
    if ((a->ops->read)(ch, val) < 0) {
        return -1;
    }

    return 0;
}
\`\`\`
`;

export function CompareChatInterface() {
  const { getErrorMessage } = useWSErrorMessage();
  const { send, isLoadingMessages, parsedEvents } = useWsClient();
  const { setOptimisticUserMessage, getOptimisticUserMessage } =
    useOptimisticUserMessage();
  const { t } = useTranslation();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const {
    scrollDomToBottom,
    onChatBodyScroll,
    hitBottom,
    autoScroll,
    setAutoScroll,
    setHitBottom,
  } = useScrollToBottom(scrollRef);
  const { data: config } = useConfig();

  const { curAgentState } = useSelector((state: RootState) => state.agent);

  const [modelOne, setModelOne] = React.useState<string>(llmModels[0]);
  const [modelTwo, setModelTwo] = React.useState<string>(llmModels[1]);

  const [events, setEvents] = React.useState<
    Array<OpenHandsAction | OpenHandsObservation>
  >([]);

  const [feedbackPolarity, setFeedbackPolarity] = React.useState<
    "positive" | "negative"
  >("positive");
  const [feedbackModalIsOpen, setFeedbackModalIsOpen] = React.useState(false);
  const [messageToSend, setMessageToSend] = React.useState<string | null>(null);
  const { selectedRepository, replayJson, initialPrompt } = useSelector(
    (state: RootState) => state.initialQuery,
  );
  const params = useParams();
  const { mutate: getTrajectory } = useGetTrajectory();
  const { mutateAsync: uploadFiles } = useUploadFiles();

  const optimisticUserMessage = getOptimisticUserMessage();
  const errorMessage = getErrorMessage();

  // const events = parsedEvents.filter(shouldRenderEvent);

  const { curStatusMessage } = useSelector((state: RootState) => state.status);
  const { webSocketStatus } = useWsClient();
  const { data: conversation } = useActiveConversation();

  const { isSimulationMode } = useSimulationMode();

  const statusCode = getStatusCode(
    curStatusMessage,
    webSocketStatus,
    conversation?.status || null,
    conversation?.runtime_status || null,
    curAgentState,
  );

  const handleSendMessage = async (
    content: string,
    images: File[],
    files: File[],
  ) => {
    if (events.length === 0) {
      posthog.capture("initial_query_submitted", {
        entry_point: getEntryPoint(
          selectedRepository !== null,
          replayJson !== null,
        ),
        query_character_length: content.length,
        replay_json_size: replayJson?.length,
      });
    } else {
      posthog.capture("user_message_sent", {
        session_message_count: events.length,
        current_message_length: content.length,
      });
    }
    const promises = images.map((image) => convertImageToBase64(image));
    const imageUrls = await Promise.all(promises);

    const timestamp = new Date().toISOString();

    const { skipped_files: skippedFiles, uploaded_files: uploadedFiles } =
      files.length > 0
        ? await uploadFiles({ conversationId: params.conversationId!, files })
        : { skipped_files: [], uploaded_files: [] };

    skippedFiles.forEach((f) => displayErrorToast(f.reason));

    const filePrompt = `${t("CHAT_INTERFACE$AUGMENTED_PROMPT_FILES_TITLE")}: ${uploadedFiles.join("\n\n")}`;
    const prompt =
      uploadedFiles.length > 0 ? `${content}\n\n${filePrompt}` : content;

    // send(createChatMessage(prompt, imageUrls, uploadedFiles, timestamp));
    setOptimisticUserMessage(content);
    setEvents((prev) => [
      ...prev,
      {
        id: 4,
        timestamp: "2025-08-26T08:26:20.878137",
        source: "user",
        message: content,
        action: "message",
        args: {
          content: content,
          file_urls: [...files.map((file) => file.name)],
          image_urls: [],
          wait_for_response: false,
          attached_files: [],
          attached_codeblocks: [],
        },
        timeout: 120,
      },
    ]);
    setMessageToSend(null);
    console.log(events);
  };

  const handleStop = () => {
    posthog.capture("stop_button_clicked");
    send(generateAgentStateChangeEvent(AgentState.STOPPED));
  };

  const onClickShareFeedbackActionButton = async (
    polarity: "positive" | "negative",
  ) => {
    setFeedbackModalIsOpen(true);
    setFeedbackPolarity(polarity);
  };

  const onClickExportTrajectoryButton = () => {
    if (!params.conversationId) {
      displayErrorToast(t(I18nKey.CONVERSATION$DOWNLOAD_ERROR));
      return;
    }

    getTrajectory(params.conversationId, {
      onSuccess: async (data) => {
        await downloadTrajectory(
          params.conversationId ?? t(I18nKey.CONVERSATION$UNKNOWN),
          data.trajectory,
        );
      },
      onError: () => {
        displayErrorToast(t(I18nKey.CONVERSATION$DOWNLOAD_ERROR));
      },
    });
  };

  const isWaitingForUserInput =
    curAgentState === AgentState.AWAITING_USER_INPUT ||
    curAgentState === AgentState.FINISHED;

  // Create a ScrollProvider with the scroll hook values
  const scrollProviderValue = {
    scrollRef,
    autoScroll,
    setAutoScroll,
    scrollDomToBottom,
    hitBottom,
    setHitBottom,
    onChatBodyScroll,
  };

  const displayLoaderUntilInitialPromptRun =
    initialPrompt &&
    (statusCode === I18nKey.CHAT_INTERFACE$CONNECTING ||
      statusCode === I18nKey.STATUS$STARTING_RUNTIME ||
      curAgentState === AgentState.INIT ||
      curAgentState === AgentState.LOADING);
  if (!isSimulationMode && displayLoaderUntilInitialPromptRun) {
    return (
      <div className="flex flex-col items-center justify-center h-[85vh] gap-8">
        <LoadingSpinner size="large" />

        <div className="text-center justify-center text-2xl text-tertiary-light">
          {t(statusCode)}
        </div>
      </div>
    );
  }

  return (
    <ScrollProvider value={scrollProviderValue}>
      <div className="h-full flex flex-col justify-between w-full">
        <p className="mb-2 font-light text-sm">Choose Models</p>
        <div className="flex gap-4 items-center">
          <Select
            defaultValue={modelOne}
            onValueChange={(val) => setModelOne(val)}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Version" />
            </SelectTrigger>

            <SelectContent className="bg-neutral-900 text-neutral-100 border border-neutral-700 rounded-md shadow-lg">
              <SelectGroup>
                <SelectLabel>Models</SelectLabel>
                {llmModels.map((model, _idx) => (
                  <SelectItem
                    value={model}
                    key={"version-" + model + "-" + _idx}
                    className="hover:bg-neutral-800 focus:bg-neutral-800 text-neutral-100 cursor-pointer transition-colors duration-100 rounded"
                  >
                    {model}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          vs
          <Select
            defaultValue={modelTwo}
            onValueChange={(val) => setModelTwo(val)}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Version" />
            </SelectTrigger>

            <SelectContent className="bg-neutral-900 text-neutral-100 border border-neutral-700 rounded-md shadow-lg">
              <SelectGroup>
                <SelectLabel>Models</SelectLabel>
                {llmModels.map((model, _idx) => (
                  <SelectItem
                    value={model}
                    key={"version-" + model + "-" + _idx}
                    className="hover:bg-neutral-800 focus:bg-neutral-800 text-neutral-100 cursor-pointer transition-colors duration-100 rounded"
                  >
                    {model}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {!isSimulationMode && events.length === 0 && !optimisticUserMessage && (
          <CompareChatSuggestions onSuggestionsClick={setMessageToSend} />
        )}

        <div
          ref={scrollRef}
          onScroll={(e) => onChatBodyScroll(e.currentTarget)}
          className="scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-track-gray-800 hover:scrollbar-thumb-gray-300 flex flex-col grow overflow-y-auto overflow-x-hidden px-4 pt-4 gap-2 fast-smooth-scroll"
        >
          {isSimulationMode && (
            <ChatSimulator
              messages={GENERATE_CLASS_DIAGRAM_MESSAGES}
              onComplete={() => {}}
            />
          )}
          {!isSimulationMode && isLoadingMessages && (
            <div className="flex justify-center">
              <LoadingSpinner size="small" />
            </div>
          )}

          {!isSimulationMode && !isLoadingMessages && (
            <div>
              <CompareMessages
                messages={events}
                isAwaitingUserConfirmation={
                  curAgentState === AgentState.AWAITING_USER_CONFIRMATION
                }
                sideBySideResponse={
                  <div className="flex gap-16 px-16 py-8 max-w-8xl mx-auto">
                    <div className="flex-1 bg-base-secondary rounded-xl p-6 border border-tertiary-light/20 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            AI
                          </span>
                        </div>
                        <h3 className="text-primary-text font-semibold">
                          {modelOne} Response
                        </h3>
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <CompareChatMessage
                          type="agent"
                          message={modelOneResponse}
                          enableTypewriter={true}
                          isLatestMessage={true}
                        />
                      </div>
                    </div>

                    <div className="flex-1 bg-base-secondary rounded-xl p-6 border border-tertiary-light/20 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            AI
                          </span>
                        </div>
                        <h3 className="text-primary-text font-semibold">
                          {modelTwo} Response
                        </h3>
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <CompareChatMessage
                          type="agent"
                          message={modelTwoResponse}
                          enableTypewriter={true}
                          isLatestMessage={true}
                        />
                      </div>
                    </div>
                  </div>
                }
              />
            </div>
          )}

          {!isSimulationMode && !isLoadingMessages && (
            // userMessages.map((message) => (
            <div>
              {/* <Messages
                messages={events}
                isAwaitingUserConfirmation={
                  curAgentState === AgentState.AWAITING_USER_CONFIRMATION
                }
              /> */}
            </div>
          )}

          {!isSimulationMode &&
            isWaitingForUserInput &&
            events.length > 0 &&
            !optimisticUserMessage && (
              <ActionSuggestions
                onSuggestionsClick={(value) => handleSendMessage(value, [], [])}
              />
            )}
        </div>

        <div className="flex flex-col gap-[6px] px-4 pb-4">
          <div className="flex justify-between relative">
            {/* {config?.APP_MODE !== "saas" && (
              <TrajectoryActions
                onPositiveFeedback={() =>
                  onClickShareFeedbackActionButton("positive")
                }
                onNegativeFeedback={() =>
                  onClickShareFeedbackActionButton("negative")
                }
                onExportTrajectory={() => onClickExportTrajectoryButton()}
              />
            )} */}

            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0">
              {curAgentState === AgentState.RUNNING && <TypingIndicator />}
            </div>

            {!hitBottom && <ScrollToBottomButton onClick={scrollDomToBottom} />}
          </div>
          {errorMessage && <ErrorMessageBanner message={errorMessage} />}
          {modelOne && modelTwo && (
            <div className="flex items-center justify-between bg-logo p-1 rounded-md px-2">
              <div className="flex items-center gap-2">
                <PiInfinityLight />
                <p>
                  Comparision Mode:{" "}
                  <span className="font-bold">{modelOne}</span> vs{" "}
                  <span className="font-bold">{modelTwo}</span>
                </p>
              </div>
              <UserQuerySuggestions onSelect={setMessageToSend} />
            </div>
          )}
          <InteractiveChatBox
            onSubmit={handleSendMessage}
            onStop={handleStop}
            isDisabled={
              curAgentState === AgentState.LOADING ||
              curAgentState === AgentState.AWAITING_USER_CONFIRMATION
            }
            mode={curAgentState === AgentState.RUNNING ? "stop" : "submit"}
            value={messageToSend ?? undefined}
            onChange={setMessageToSend}
          />
        </div>

        {/* {config?.APP_MODE !== "saas" && (
          <FeedbackModal
            isOpen={feedbackModalIsOpen}
            onClose={() => setFeedbackModalIsOpen(false)}
            polarity={feedbackPolarity}
          />
        )} */}
      </div>
    </ScrollProvider>
  );
}
