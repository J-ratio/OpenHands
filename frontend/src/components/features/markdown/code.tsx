import React, { useState } from "react";
import { ExtraProps } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

/**
 * Component to render code blocks in markdown.
 */
export function code({
  children,
  className,
}: React.ClassAttributes<HTMLElement> &
  React.HTMLAttributes<HTMLElement> &
  ExtraProps) {
  const match = /language-(\w+)/.exec(className || ""); // get the language
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(String(children));
    setCopyStatus("copied");

    setTimeout(() => setCopyStatus("idle"), 2000);
  };

  const RenderCopyButton = () => {
    return (
      <button
        className="text-sm text-gray-400 hover:text-gray-600 mr-2 cursor-pointer"
        onClick={handleCopyToClipboard}
      >
        {copyStatus === "copied" ? "Copied!" : "Copy"}
      </button>
    );
  };

  if (!match) {
    const isMultiline = String(children).includes("\n");

    if (!isMultiline) {
      return (
        <code
          className={className}
          style={{
            backgroundColor: "#2a3038",
            padding: "0.2em 0.4em",
            borderRadius: "4px",
            color: "#e6edf3",
            border: "1px solid #30363d",
          }}
        >
          {children}
        </code>
      );
    }

    return (
      <pre
        style={{
          backgroundColor: "#2a3038",
          padding: "1em",
          borderRadius: "4px",
          color: "#e6edf3",
          border: "1px solid #30363d",
          overflow: "auto",
        }}
      >
        <code className={className}>{String(children).replace(/\n$/, "")}</code>
      </pre>
    );
  }

  const isMermaidCodeBlock =
    match.includes("language-mermaid") || match.includes("mermaid");
  return (
    <div className="relative">
      <SyntaxHighlighter
        className="rounded-lg"
        style={vscDarkPlus}
        language={match?.[1]}
        PreTag="div"
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
      <div className="absolute top-2 right-2 flex items-center gap-4">
        <RenderCopyButton />
        {isMermaidCodeBlock && (
          <button className="text-sm text-gray-400 hover:text-gray-600 mr-2 cursor-pointer">
            Visualize
          </button>
        )}
      </div>
    </div>
  );
}
