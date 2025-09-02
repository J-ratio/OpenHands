import React from "react";
import { OpenHandsAction } from "#/types/core/actions";
import { OpenHandsObservation } from "#/types/core/observations";
import { isOpenHandsAction, isOpenHandsObservation } from "#/types/core/guards";
import { EventMessage } from "./event-message";
import { useOptimisticUserMessage } from "#/hooks/use-optimistic-user-message";
import { CompareChatMessage } from "./compare-chat-message";

interface MessagesProps {
  messages: (OpenHandsAction | OpenHandsObservation)[];
  isAwaitingUserConfirmation: boolean;
  sideBySideResponse?: React.ReactNode;
  modelOne: string;
  modelTwo: string;
  modelOneResponse: string;
  modelTwoResponse: string;
}

export const CompareMessages: React.FC<MessagesProps> = React.memo(
  ({
    messages,
    isAwaitingUserConfirmation,
    modelOne,
    modelTwo,
    modelOneResponse,
    modelTwoResponse,
  }) => {
    console.log(modelOneResponse);
    console.log(modelTwoResponse);
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

    return (
      <>
        <div className="flex gap-16 px-16 py-8 max-w-8xl mx-auto">
          <div className="flex-1 bg-base-secondary rounded-xl p-6 border border-tertiary-light/20 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">AI</span>
              </div>
              <h3 className="text-primary-text font-semibold">
                {modelOne} Response
              </h3>
            </div>
            {modelOneResponse ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <CompareChatMessage
                  type="agent"
                  message={modelOneResponse}
                  enableTypewriter={true}
                  isLatestMessage={true}
                />
              </div>
            ) : (
              messages.map((message, index) => (
                <div>
                  <EventMessage
                    key={message.id}
                    event={message}
                    hasObservationPair={actionHasObservationPair(message)}
                    isAwaitingUserConfirmation={isAwaitingUserConfirmation}
                    isLastMessage={messages.length - 1 === index}
                    isInLast10Actions={messages.length - 1 - index < 10}
                  />
                  {/* {
                <DelayedSideBySideResponse
                  sideBySideResponse={sideBySideResponse}
                />
              } */}
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
                {modelTwo} Response
              </h3>
            </div>
            {modelTwoResponse ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <CompareChatMessage
                  type="agent"
                  message={modelTwoResponse}
                  enableTypewriter={true}
                  isLatestMessage={true}
                />
              </div>
            ) : (
              messages.map((message, index) => (
                <div>
                  <EventMessage
                    key={message.id}
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

        {/* {optimisticUserMessage && (
          <ChatMessage type="user" message={optimisticUserMessage} />
        )} */}
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

const DelayedSideBySideResponse = ({
  sideBySideResponse,
  delay = 200,
}: {
  sideBySideResponse: React.ReactNode;
  delay?: number;
}) => {
  const [showResponse, setShowResponse] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowResponse(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      style={{
        opacity: showResponse ? 1 : 0,
        transition: "opacity 0.3s ease-in-out",
      }}
    >
      {sideBySideResponse}
    </div>
  );
};
