import { useEffect } from "react";
import mermaid from "mermaid";
import Mermaid from "#/components/shared/Mermaid";
import { initializeMermaid } from "#/utils/initialize-mermaid";

export interface MermaidTabProps {
  code?: string;
}

export function MermaidTab({ code }: MermaidTabProps) {
  const hasCode = Boolean(code?.trim());

  useEffect(() => {
    initializeMermaid();
  }, []);

  useEffect(() => {
    // Find the container and remove Mermaid's marker attribute
    const element = document.getElementById("mermaid");
    element?.removeAttribute("data-processed");
    // Re-run Mermaid to re-render the chart
    mermaid.contentLoaded();
  }, [code]);

  return (
    <div className="w-full h-full p-6 bg-base-secondary text-white overflow-auto">
      {hasCode ? (
        <div className="w-full h-full flex items-center justify-center">
          <Mermaid chart={code!} showEditor={true} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center text-neutral-400">
          <div className="text-xl font-semibold mb-2">No diagram to show</div>
          <p className="max-w-md">
            To visualize a diagram, locate a Mermaid code block and tap the{" "}
            <span className="font-medium text-purple-400">Visualize</span>{" "}
            button.
          </p>
        </div>
      )}
    </div>
  );
}
