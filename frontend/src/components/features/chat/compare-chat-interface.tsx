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
import { UserQuerySuggestions, UserSuggestion } from "./user-query-suggestions";
import { OpenHandsAction } from "#/types/core/actions";
import { OpenHandsObservation } from "#/types/core/observations";
import { CompareChatMessage } from "./compare-chat-message";
import { CompareMessages } from "./compare-messages";
import { CompareChatSuggestions } from "./compare-chat-suggestions";
import { AttachedCodeBlock, AttachedFile } from "./chat-input";
import { OpenAI } from "openai";

function getEntryPoint(
  hasRepository: boolean | null,
  hasReplayJson: boolean | null,
): string {
  if (hasRepository) return "github";
  if (hasReplayJson) return "replay";
  return "direct";
}

const llmModels = ["h2loop", "gpt-4o", "claude-sonnet-4-20250514", "grok-3"];

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

  const [userSuggestion, setUserSuggestion] = React.useState<UserSuggestion>();
  const [isStaticResponseMode, setIsStaticResponseMode] = React.useState(false);
  const [staticModelOneResponse, setStaticModelOneResponse] =
    React.useState<string>("");
  const [staticModelTwoResponse, setStaticModelTwoResponse] =
    React.useState<string>("");

  const requiresStaticResponse = userSuggestion && userSuggestion?.isStatic;

  const [modelOne, setModelOne] = React.useState<string>(llmModels[0]);
  const [modelTwo, setModelTwo] = React.useState<string>(llmModels[1]);
  const [modelOneResponse, setModelOneResponse] = React.useState<string>("");
  const [modelTwoResponse, setModelTwoResponse] = React.useState<string>("");
  const [modelHistory, setModelHistory] = React.useState<{
    [messageId: string]: { modelOne: string; modelTwo: string };
  }>({});

  // const [events, setEvents] = React.useState<
  //   Array<OpenHandsAction | OpenHandsObservation>
  // >([]);

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

  const [localEvents, setLocalEvents] = React.useState<
    (OpenHandsAction | OpenHandsObservation)[]
  >([]);
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const [comparisonLoadTimestamp, setComparisonLoadTimestamp] = React.useState<string | null>(getLocalISOString(new Date()));

  const getLocalISOString = (date: Date) => {
    const pad = (num: number, size: number) => String(num).padStart(size, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}T${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}:${pad(date.getSeconds(), 2)}.${pad(date.getMilliseconds(), 3)}`;
  };

  React.useEffect(() => {
    setIsInitialLoad(true);
    setComparisonLoadTimestamp(getLocalISOString(new Date()));
    console.log(`Comparison load timestamp: ${comparisonLoadTimestamp}`)
  }, [params.conversationId]);

  let events = [
    ...parsedEvents.filter((event) =>
      shouldRenderEvent(event) &&
      (!comparisonLoadTimestamp || event.timestamp >= comparisonLoadTimestamp)
    ),
    ...localEvents
  ];
  console.log(`Events: ${events}`);
  // const events = localEvents;

  const { curStatusMessage } = useSelector((state: RootState) => state.status);
  const { webSocketStatus } = useWsClient();
  const { data: conversation } = useActiveConversation();

  const { isSimulationMode } = useSimulationMode();

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

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
    attachedFiles: AttachedFile[],
    attachedCodeBlocks: AttachedCodeBlock[],
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

    // Store the current models for this message using content as key
    setModelHistory((prev) => ({
      ...prev,
      [content]: { modelOne, modelTwo },
    }));

    const { skipped_files: skippedFiles, uploaded_files: uploadedFiles } =
      files.length > 0
        ? await uploadFiles({ conversationId: params.conversationId!, files })
        : { skipped_files: [], uploaded_files: [] };

    skippedFiles.forEach((f) => displayErrorToast(f.reason));

    const filePrompt = `${t("CHAT_INTERFACE$AUGMENTED_PROMPT_FILES_TITLE")}: ${uploadedFiles.join("\n\n")}`;
    const prompt =
      uploadedFiles.length > 0 ? `${content}\n\n${filePrompt}` : content;

    setOptimisticUserMessage(content);

    if (!requiresStaticResponse) {
      // Clear static response mode for regular messages
      setIsStaticResponseMode(false);
      setStaticModelOneResponse("");
      setStaticModelTwoResponse("");
      // Clear local events for regular messages to avoid conflicts
      setLocalEvents([]);
      try {
        if (modelOne === "h2loop" || modelTwo === "h2loop") {
          send(
            createChatMessage(
              prompt,
              imageUrls,
              uploadedFiles,
              attachedFiles,
              attachedCodeBlocks,
              timestamp,
            ),
          );

          const openAiResponse = await openai.chat.completions.create({
            model: modelOne === "h2loop" ? modelTwo : modelOne,
            messages: [{ role: "user", content: prompt }],
          });
          if (modelOne === "h2loop") {
            setModelTwoResponse(
              openAiResponse.choices[0].message.content || "",
            );
          } else {
            setModelOneResponse(
              openAiResponse.choices[0].message.content || "",
            );
          }
        } else {
          const responseOne = await openai.chat.completions.create({
            model: modelOne,
            messages: [{ role: "user", content: prompt }],
          });
          setModelOneResponse(responseOne.choices[0].message.content || "");

          const responseTwo = await openai.chat.completions.create({
            model: modelTwo,
            messages: [{ role: "user", content: prompt }],
          });
          setModelTwoResponse(responseTwo.choices[0].message.content || "");
        }
      } catch (error) {
        console.error("Error calling OpenAI:", error);
        displayErrorToast("Failed to get response from model");
      }
    }

    setMessageToSend(null);
    setIsInitialLoad(false);

    if (requiresStaticResponse && userSuggestion) {
      const userMessage: OpenHandsAction = {
        id: Date.now(),
        source: "user",
        message: userSuggestion.question,
        timestamp: new Date().toISOString(),
        action: "message",
        args: {
          content: userSuggestion.question,
          image_urls: [],
          file_urls: [],
          attached_files: [],
          attached_codeblocks: [],
        },
      };

      setLocalEvents((prev) => [...prev, userMessage]);
      setStaticModelOneResponse(userSuggestion.modelOneResponse || "");
      setStaticModelTwoResponse(userSuggestion.modelTwoResponse || "");
      setIsStaticResponseMode(true);
      setUserSuggestion(undefined);
    }
    // console.log(events);
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
                    disabled={model === modelTwo}
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
                    disabled={model === modelOne}
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
              onComplete={() => { }}
            />
          )}
          {!isSimulationMode && isLoadingMessages && (
            <div className="flex justify-center">
              <LoadingSpinner size="small" />
            </div>
          )}

          {!isSimulationMode &&
            !isLoadingMessages &&
            !isStaticResponseMode &&
            (events.length > 0 || modelOneResponse || modelTwoResponse) && (
              <div>
                <CompareMessages
                  messages={events}
                  isAwaitingUserConfirmation={
                    curAgentState === AgentState.AWAITING_USER_CONFIRMATION
                  }
                  modelOne={modelOne}
                  modelTwo={modelTwo}
                  modelOneResponse={modelOneResponse}
                  modelTwoResponse={modelTwoResponse}
                  modelHistory={modelHistory}
                // sideBySideResponse={
                //   <div className="flex gap-16 px-16 py-8 max-w-8xl mx-auto">
                //     <div className="flex-1 bg-base-secondary rounded-xl p-6 border border-tertiary-light/20 shadow-lg hover:shadow-xl transition-shadow">
                //       <div className="flex items-center gap-3 mb-4">
                //         <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                //           <span className="text-white text-sm font-medium">
                //             AI
                //           </span>
                //         </div>
                //         <h3 className="text-primary-text font-semibold">
                //           {modelOne} Response
                //         </h3>
                //       </div>
                //       <div className="prose prose-invert prose-sm max-w-none">
                //         <CompareChatMessage
                //           type="agent"
                //           message={modelOneResponse}
                //           enableTypewriter={true}
                //           isLatestMessage={true}
                //         />
                //       </div>
                //     </div>

                //     <div className="flex-1 bg-base-secondary rounded-xl p-6 border border-tertiary-light/20 shadow-lg hover:shadow-xl transition-shadow">
                //       <div className="flex items-center gap-3 mb-4">
                //         <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                //           <span className="text-white text-sm font-medium">
                //             AI
                //           </span>
                //         </div>
                //         <h3 className="text-primary-text font-semibold">
                //           {modelTwo} Response
                //         </h3>
                //       </div>
                //       <div className="prose prose-invert prose-sm max-w-none">
                //         <CompareChatMessage
                //           type="agent"
                //           message={modelTwoResponse}
                //           enableTypewriter={true}
                //           isLatestMessage={true}
                //         />
                //       </div>
                //     </div>
                //   </div>
                // }
                />
              </div>
            )}

          {!isSimulationMode && !isLoadingMessages && isStaticResponseMode && (
            <CompareMessages
              messages={events}
              isAwaitingUserConfirmation={
                curAgentState === AgentState.AWAITING_USER_CONFIRMATION
              }
              modelOne={modelOne}
              modelTwo={modelTwo}
              modelOneResponse={staticModelOneResponse}
              modelTwoResponse={staticModelTwoResponse}
              modelHistory={modelHistory}
            />
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
                onSuggestionsClick={(value) =>
                  handleSendMessage(value, [], [], [], [])
                }
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
              <UserQuerySuggestions
                onSelect={(suggestion) => {
                  setUserSuggestion(suggestion);
                  setMessageToSend(suggestion.question);
                }}
              />
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
