import React from "react";
import { OpenHandsAction } from "#/types/core/actions";
import { OpenHandsObservation } from "#/types/core/observations";
import {
  isOpenHandsAction,
  isOpenHandsObservation,
  isUserMessage,
} from "#/types/core/guards";
import { EventMessage } from "./event-message";
import { useOptimisticUserMessage } from "#/hooks/use-optimistic-user-message";
import { CompareChatMessage } from "./compare-chat-message";
import { CompareEventMessage } from "./compare-event-message";
import { parseMessageFromEvent } from "./event-content-helpers/parse-message-from-event";

interface CompareMessagesProps {
  messages: (OpenHandsAction | OpenHandsObservation)[];
  isAwaitingUserConfirmation: boolean;
  sideBySideResponse?: React.ReactNode;
  modelOne: string;
  modelTwo: string;
  modelOneResponse: string;
  modelTwoResponse: string;
  modelHistory: { [content: string]: { modelOne: string; modelTwo: string } };
}

export const CompareMessages: React.FC<CompareMessagesProps> = React.memo(
  ({
    messages,
    isAwaitingUserConfirmation,
    modelOne,
    modelTwo,
    modelOneResponse,
    modelTwoResponse,
    modelHistory,
  }) => {
    const { getOptimisticUserMessage } = useOptimisticUserMessage();

    const optimisticUserMessage = getOptimisticUserMessage();

    const actionHasObservationPair = React.useCallback(
      (event: OpenHandsAction | OpenHandsObservation): boolean => {
        if (isOpenHandsAction(event)) {
          return !!messages.some(
            (msg) => isOpenHandsObservation(msg) && msg.cause === event.id,
          );
        }

        return false;
      },
      [messages],
    );

    const userMessages = messages.filter(isUserMessage);

    // Group messages by conversation turns
    const groups = [];
    for (let i = 0; i < userMessages.length; i++) {
      const userMsg = userMessages[i];
      const userIndex = messages.indexOf(userMsg);
      const nextUserIndex =
        i + 1 < userMessages.length
          ? messages.indexOf(userMessages[i + 1])
          : messages.length;
      const groupMessages = messages
        .slice(userIndex + 1, nextUserIndex)
        .filter((msg) => !isUserMessage(msg));

      // Get the stored models for this message, fallback to current models
      const messageContent = userMsg.args.content;
      const messageModels = modelHistory[messageContent] || {
        modelOne,
        modelTwo,
      };

      groups.push({ userMsg, responses: groupMessages, models: messageModels });
    }

    return (
      <>
        {/* Display each question-response group */}
        {groups.map((group, groupIndex) => (
          <div key={group.userMsg.id} className="mb-8">
            <div className="flex justify-end mb-4">
              <CompareChatMessage
                type="user"
                message={parseMessageFromEvent(group.userMsg)}
              />
            </div>

            <div className="flex gap-16 px-16 py-8 mx-auto justify-center">
              <div className="flex-1 bg-base-secondary rounded-xl p-6 border border-tertiary-light/20 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">AI</span>
                  </div>
                  <h3 className="text-primary-text font-semibold">
                    {group.models.modelOne} Response
                  </h3>
                </div>
                {groupIndex === groups.length - 1 && modelOneResponse ? (
                  <div className="prose prose-invert prose-sm max-w-[35vw] ml-auto mr-auto">
                    <CompareChatMessage
                      type="agent"
                      message={modelOneResponse}
                      enableTypewriter={true}
                      isLatestMessage={true}
                    />
                  </div>
                ) : (
                  group.responses.map((message, index) => (
                    <div key={message.id}>
                      <CompareEventMessage
                        event={message}
                        hasObservationPair={actionHasObservationPair(message)}
                        isAwaitingUserConfirmation={isAwaitingUserConfirmation}
                        isLastMessage={messages.length - 1 === index}
                        isInLast10Actions={messages.length - 1 - index < 10}
                      />
                    </div>
                  ))
                )}
              </div>

              <div className="flex-1 bg-base-secondary rounded-xl p-6 border border-tertiary-light/20 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">AI</span>
                  </div>
                  <h3 className="text-primary-text font-semibold">
                    {group.models.modelTwo} Response
                  </h3>
                </div>
                {groupIndex === groups.length - 1 && modelTwoResponse ? (
                  <div className="prose prose-invert prose-sm max-w-[35vw] ml-auto mr-auto">
                    <CompareChatMessage
                      type="agent"
                      message={modelTwoResponse}
                      enableTypewriter={true}
                      isLatestMessage={true}
                    />
                  </div>
                ) : (
                  group.responses.map((message, index) => (
                    <div key={message.id}>
                      <CompareEventMessage
                        event={message}
                        hasObservationPair={actionHasObservationPair(message)}
                        isAwaitingUserConfirmation={isAwaitingUserConfirmation}
                        isLastMessage={messages.length - 1 === index}
                        isInLast10Actions={messages.length - 1 - index < 10}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Show optimistic user message if it exists and isn't already in messages */}
        {optimisticUserMessage &&
          !userMessages.some(
            (msg) => parseMessageFromEvent(msg) === optimisticUserMessage,
          ) && (
            <div className="mb-8">
              <div className="flex justify-end mb-4">
                <CompareChatMessage
                  type="user"
                  message={optimisticUserMessage}
                />
              </div>
            </div>
          )}
      </>
    );
  },
  (prevProps, nextProps) => {
    // Prevent re-renders if messages are the same length
    if (prevProps.messages.length !== nextProps.messages.length) {
      return false;
    }

    return true;
  },
);

CompareMessages.displayName = "Messages";
