import React, { lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router";
import { LoadingSpinner } from "../shared/loading-spinner";

// Lazy load all tab components
const EditorTab = lazy(() => import("#/routes/changes-tab"));
const BrowserTab = lazy(() => import("#/routes/browser-tab"));
const JupyterTab = lazy(() => import("#/routes/jupyter-tab"));
const ServedTab = lazy(() => import("#/routes/served-tab"));
const TerminalTab = lazy(() => import("#/routes/terminal-tab"));
const VSCodeTab = lazy(() => import("#/routes/vscode-tab"));
const MermaidTab = lazy(() =>
  import("#/routes/mermaid-tab").then((module) => ({
    default: module.MermaidTab,
  })),
);

interface TabContentProps {
  conversationPath: string;
  mermaidCode?: string;
}

export function TabContent({ conversationPath }: TabContentProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine which tab is active based on the current path
  const isEditorActive = currentPath === conversationPath;
  const isBrowserActive = currentPath === `${conversationPath}/browser`;
  const isJupyterActive = currentPath === `${conversationPath}/jupyter`;
  const isServedActive = currentPath === `${conversationPath}/served`;
  const isTerminalActive = currentPath === `${conversationPath}/terminal`;
  const isVSCodeActive = currentPath === `${conversationPath}/vscode`;
  const isMermaidActive = currentPath === `${conversationPath}/mermaid`;

  const mermaidCodeFromState = location.state?.mermaidCode;

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === "addToChat") {
        // setInputValue(event.data.text); // plug directly into your input box
        console.log(event.data.text);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <div className="h-full w-full relative">
      {/* Each tab content is always loaded but only visible when active */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="large" />
          </div>
        }
      >
        <div
          className={`absolute inset-0 ${isEditorActive ? "block" : "hidden"}`}
        >
          <EditorTab />
        </div>
        <div
          className={`absolute inset-0 ${isBrowserActive ? "block" : "hidden"}`}
        >
          <BrowserTab />
        </div>
        <div
          className={`absolute inset-0 ${isJupyterActive ? "block" : "hidden"}`}
        >
          <JupyterTab />
        </div>
        <div
          className={`absolute inset-0 ${isServedActive ? "block" : "hidden"}`}
        >
          <ServedTab />
        </div>
        <div
          className={`absolute inset-0 ${isTerminalActive ? "block" : "hidden"}`}
        >
          <TerminalTab />
        </div>
        <div
          className={`absolute inset-0 ${isVSCodeActive ? "block" : "hidden"}`}
        >
          <VSCodeTab />
        </div>
        {isMermaidActive && (
          <div
            className={`absolute inset-0 ${isMermaidActive ? "block" : "hidden"}`}
          >
            <MermaidTab code={mermaidCodeFromState} />
          </div>
        )}
      </Suspense>
    </div>
  );
}
