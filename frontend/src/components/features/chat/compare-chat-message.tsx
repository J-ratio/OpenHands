import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { code } from "../markdown/code";
import { cn } from "#/utils/utils";
import { ul, ol } from "../markdown/list";
import { CopyToClipboardButton } from "#/components/shared/buttons/copy-to-clipboard-button";
import { anchor } from "../markdown/anchor";
import { OpenHandsSourceType } from "#/types/core/base";
import { paragraph } from "../markdown/paragraph";

interface ChatMessageProps {
  type: OpenHandsSourceType;
  message: string;
  enableTypewriter?: boolean;
  typewriterSpeed?: number;
  isLatestMessage?: boolean;
}

export function CompareChatMessage({
  type,
  message,
  children,
  enableTypewriter = false,
  typewriterSpeed = 0.1,
  isLatestMessage = false,
}: React.PropsWithChildren<ChatMessageProps>) {
  const [isHovering, setIsHovering] = React.useState(false);
  const [isCopy, setIsCopy] = React.useState(false);
  const [displayedMessage, setDisplayedMessage] = React.useState(
    enableTypewriter ? "" : message,
  );
  const [isTypingComplete, setIsTypingComplete] =
    React.useState(!enableTypewriter);

  // Typewriter effect
  React.useEffect(() => {
    if (!enableTypewriter || !isLatestMessage) {
      setDisplayedMessage(message);
      setIsTypingComplete(true);
      return;
    }

    setDisplayedMessage("");
    setIsTypingComplete(false);

    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayedMessage(message.slice(0, currentIndex + 3));
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(timer);
      }
    }, typewriterSpeed);

    return () => clearInterval(timer);
  }, [message, enableTypewriter, typewriterSpeed, isLatestMessage]);

  const handleCopyToClipboard = async () => {
    await navigator.clipboard.writeText(message);
    setIsCopy(true);
  };

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isCopy) {
      timeout = setTimeout(() => {
        setIsCopy(false);
      }, 2000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [isCopy]);

  return (
    <article
      data-testid={`${type}-message`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        "rounded-xl relative",
        "flex flex-col gap-2",
        type === "user" && " max-w-[305px] p-4 bg-tertiary self-end",
        type === "agent" && "mt-6 max-w-full bg-transparent",
      )}
    >
      {/* <CopyToClipboardButton
        isHidden={!isHovering}
        isDisabled={isCopy}
        onClick={handleCopyToClipboard}
        mode={isCopy ? "copied" : "copy"}
      /> */}
      <div className="text-sm break-words">
        <Markdown
          components={{
            code,
            ul,
            ol,
            a: anchor,
            p: paragraph,
          }}
          remarkPlugins={[remarkGfm]}
        >
          {displayedMessage}
        </Markdown>
        {enableTypewriter && !isTypingComplete && isLatestMessage && (
          <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse"></span>
        )}
      </div>
      {children}
    </article>
  );
}
