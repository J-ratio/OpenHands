import { useEffect, useState } from "react";
import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";
import Mermaid from "../../../../shared/Mermaid";
import { createReactInlineContentSpec } from "@blocknote/react";

// The Mermaid inline content.
export const MermaidInlineContent = createReactInlineContentSpec(
  {
    type: "mermaidcontent",
    propSchema: {
      code: {
        default: "",
      },
    },
    content: "none",
  },
  {
    render: (props) => <Mermaid chart={props.inlineContent.props.code} />,
  },
);

export const MermaidBlock = createReactBlockSpec(
  {
    type: "mermaid",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      displayType: {
        default: "text",
        values: ["text", "chart"],
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const [isReady, setIsReady] = useState(false);
      const [isLoading, setIsLoading] = useState(true);

      useEffect(() => {
        const hasContent = props.block.content[0] !== undefined;
        if (hasContent && props.block.props.displayType === "chart") {
          const timer = setTimeout(() => {
            setIsReady(true);
            setIsLoading(false);
          }, 500);
          return () => clearTimeout(timer);
        } else {
          setIsReady(true);
          setIsLoading(false);
        }
      }, [props.block.content]);

      function handleClick() {
        const isSwitchingToChart = props.block.props.displayType === "text";
        if (isSwitchingToChart) {
          setIsLoading(true);
        }

        props.editor.updateBlock(props.block, {
          props: {
            ...props.block.props,
            displayType: isSwitchingToChart ? "chart" : "text",
          },
        });

        if (isSwitchingToChart) {
          setTimeout(() => {
            setIsLoading(false);
          }, 200);
        }
      }

      function handleInput(e) {
        props.editor.updateBlock(props.block, {
          content: [
            {
              type: "mermaidcontent",
              props: {
                code: e.target.value,
              },
            },
          ],
        });
      }

      const content = props.block.content[0];
      const hasContent = content !== undefined;

      const showChart =
        isReady && props.block.props.displayType === "chart" && hasContent;

      const Loader = () => (
        <div className="flex items-center justify-center w-full h-[150px]">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-150"></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-300"></div>
            <span className="ml-2 text-sm text-neutral-400">
              Rendering diagram...
            </span>
          </div>
        </div>
      );

      return (
        <div className="grid w-full grid-cols-4 gap-2 group">
          <div className="col-span-3">
            {isLoading ? (
              <Loader />
            ) : !showChart ? (
              <textarea
                className="bg-neutral-900 border border-neutral-700 p-2 rounded-lg text-sm text-neutral-100 min-h-[150px] max-h-[300px] w-full placeholder:text-neutral-500 focus:ring-0 outline-none transition-colors duration-150"
                value={hasContent ? content.props.code : ""}
                onChange={handleInput}
                spellCheck="false"
                ref={props.contentRef}
              />
            ) : (
              <Mermaid chart={content.props.code} showEditor={false} />
            )}
          </div>
          <button
            onClick={handleClick}
            className="bg-neutral-900 border border-neutral-700 ml-auto h-fit cursor-pointer rounded-lg px-2 py-0 text-neutral-400 transition-colors duration-100 hover:text-neutral-100 hover:bg-neutral-800 select-none opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-0 focus:border-primary"
            disabled={isLoading}
          >
            {props.block.props.displayType === "text"
              ? "Show Chart"
              : "Show Text"}
          </button>
        </div>
      );
    },

    toExternalHTML: (props) => {
      const content = props.block.content[0];
      return (
        <div className="grid w-full grid-cols-4 gap-2 group">
          <div className="col-span-3">
            {content && (
              <Mermaid chart={content.props.code} displayEditor={false} />
            )}
          </div>
        </div>
      );
    },
  },
);
