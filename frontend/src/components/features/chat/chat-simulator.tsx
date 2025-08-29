import { useEffect, useRef, useState } from "react";

import { ChatMessage } from "./chat-message";
import { FakeMessage } from "#/fake_scripts/fake_message";
import { TypingIndicator } from "./typing-indicator";

interface ChatSimulatorProps {
  messages: Array<FakeMessage>;
  onComplete?: () => void;
}

export const ChatSimulator: React.FC<ChatSimulatorProps> = ({
  messages,
  onComplete,
}) => {
  const [visibleMessages, setVisibleMessages] = useState<Array<FakeMessage>>(
    [],
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (messages.length === 0) return;

    setVisibleMessages([]);
    setIsSimulating(true);

    const scheduleMessage = (index: number) => {
      if (index >= messages.length) {
        timeoutRef.current = setTimeout(() => {
          setIsSimulating(false);
          onComplete?.();
        }, 0);
        return;
      }

      const message = messages[index];
      const delay = message.delay || 0;

      timeoutRef.current = setTimeout(() => {
        setVisibleMessages((prev) => [...prev, message]);
        scheduleMessage(index + 1);
      }, delay);
    };

    scheduleMessage(0);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [messages]);

  return (
    <div className="space-y-4">
      {visibleMessages.map((message, index) => (
        <div
          key={`msg-${index}-${Date.now()}`}
          className={`animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ${index === 0 && "flex justify-end"}`}
        >
          <ChatMessage message={message.message} type={message.type} />
        </div>
      ))}

      {isSimulating && (
        <div className="flex items-center gap-2 p-4 text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
          <span className="text-sm">Generating response...</span>
        </div>
      )}
    </div>
  );
};
