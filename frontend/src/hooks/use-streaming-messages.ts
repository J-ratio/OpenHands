import { useCallback, useRef } from "react";
import { isStreamingMessage } from "#/types/core/guards";
import { OpenHandsParsedEvent } from "#/types/core";

interface StreamingMessage {
  id: string;
  content: string;
  isComplete: boolean;
  timestamp: string;
}

export const useStreamingMessages = () => {
  const streamingMessagesRef = useRef<Map<string, StreamingMessage>>(new Map());

  const handleStreamingEvent = useCallback((event: OpenHandsParsedEvent) => {
    if (!isStreamingMessage(event)) return null;

    const { stream_id, content, is_complete } = event.args;
    if (!stream_id) return null;

    const currentMessage = streamingMessagesRef.current.get(stream_id) || {
      id: stream_id,
      content: "",
      isComplete: false,
      timestamp: event.timestamp,
    };

    if (is_complete) {
      // Mark as complete and return final message
      const finalMessage = {
        ...currentMessage,
        isComplete: true,
      };
      streamingMessagesRef.current.set(stream_id, finalMessage);
      return finalMessage;
    } else {
      // Append content and update
      const updatedMessage = {
        ...currentMessage,
        content: currentMessage.content + content,
      };
      streamingMessagesRef.current.set(stream_id, updatedMessage);
      return updatedMessage;
    }
  }, []);

  const getStreamingMessage = useCallback((streamId: string) => {
    return streamingMessagesRef.current.get(streamId);
  }, []);

  const clearCompletedMessages = useCallback(() => {
    const messages = streamingMessagesRef.current;
    for (const [id, message] of messages.entries()) {
      if (message.isComplete) {
        messages.delete(id);
      }
    }
  }, []);

  return {
    handleStreamingEvent,
    getStreamingMessage,
    clearCompletedMessages,
  };
};
