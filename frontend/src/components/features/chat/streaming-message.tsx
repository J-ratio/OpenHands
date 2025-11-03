import React from "react";
import { cn } from "#/utils/utils";

interface StreamingMessageProps {
  content: string;
  isComplete: boolean;
  className?: string;
}

export function StreamingMessage({
  content,
  isComplete,
  className,
}: StreamingMessageProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg bg-neutral-700 px-4 py-3 text-white",
        className,
      )}
    >
      <div className="whitespace-pre-wrap break-words">
        {content}
        {!isComplete && (
          <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-white" />
        )}
      </div>
      {!isComplete && (
        <div className="absolute -bottom-1 -right-1 h-2 w-2 animate-pulse rounded-full bg-blue-500" />
      )}
    </div>
  );
}
