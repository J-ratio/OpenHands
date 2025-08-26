import React from "react";
import { OpenHandsAction } from "#/types/core/actions";
import { OpenHandsObservation } from "#/types/core/observations";
import { isOpenHandsAction, isOpenHandsObservation } from "#/types/core/guards";
import { EventMessage } from "./event-message";
import { useOptimisticUserMessage } from "#/hooks/use-optimistic-user-message";

interface MessagesProps {
  messages: (OpenHandsAction | OpenHandsObservation)[];
  isAwaitingUserConfirmation: boolean;
  sideBySideResponse?: React.ReactNode;
}

export const CompareMessages: React.FC<MessagesProps> = React.memo(
  ({ messages, isAwaitingUserConfirmation, sideBySideResponse }) => {
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
        {messages.map((message, index) => (
          <div>
            <div className="flex justify-end">
              <EventMessage
                key={index}
                event={message}
                hasObservationPair={actionHasObservationPair(message)}
                isAwaitingUserConfirmation={isAwaitingUserConfirmation}
                isLastMessage={messages.length - 1 === index}
              />
            </div>
            {
              <DelayedSideBySideResponse
                sideBySideResponse={sideBySideResponse}
              />
            }
          </div>
        ))}

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
