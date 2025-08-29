import clsx from "clsx";
import React, { useState, useEffect, useRef } from "react";
import { NavTab } from "./nav-tab";
import { ChevronDownIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { useConversationId } from "#/hooks/use-conversation-id";

interface ContainerProps {
  label?: React.ReactNode;
  labels?: {
    label: string | React.ReactNode;
    to: string;
    icon?: React.ReactNode;
    isBeta?: boolean;
    isLoading?: boolean;
    rightContent?: React.ReactNode;
  }[];
  children: React.ReactNode;
  className?: React.HTMLAttributes<HTMLDivElement>["className"];
}

export function Container({
  label,
  labels,
  children,
  className,
}: ContainerProps) {
  const [showOthersDropdown, setShowOthersDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { conversationId } = useConversationId();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showOthersDropdown &&
        !dropdownRef.current?.contains(event.target as Node)
      ) {
        setShowOthersDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOthersDropdown]);

  const handleMermaidVisualizerMenuClick = () => {
    const baseMermaidPath = `/conversations/${conversationId}/mermaid`;
    const isAlreadyOnMermaid = location.pathname === baseMermaidPath;

    if (isAlreadyOnMermaid) return;
    console.log(children);

    navigate(baseMermaidPath, {
      replace: isAlreadyOnMermaid,
      state: {
        mermaidCode: "",
      },
    });
  };

  return (
    <div
      className={clsx(
        "bg-base-secondary border border-neutral-600 rounded-xl flex flex-col h-full",
        className,
      )}
    >
      {labels && (
        <div className="flex text-xs h-[36px] items-center">
          {...[
            labels.map(
              ({ label: l, to, icon, isBeta, isLoading, rightContent }) => (
                <NavTab
                  key={to}
                  to={to}
                  label={l}
                  icon={icon}
                  isBeta={isBeta}
                  isLoading={isLoading}
                  rightContent={rightContent}
                />
              ),
            ),
            <div
              key="mermaid-dropdown"
              className="relative"
              ref={dropdownRef}
              data-dropdown="mermaid"
            >
              <button
                onClick={() => setShowOthersDropdown(!showOthersDropdown)}
                className="flex items-center px-3 py-2 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-700 rounded-md transition-colors"
              >
                <span>Others</span>
                <ChevronDownIcon className="w-4 h-4 ml-1" />
              </button>

              {showOthersDropdown && (
                <div className="absolute top-full right-0 mt-1 min-w-48 bg-neutral-800 border border-neutral-600 rounded-md shadow-lg overflow-hidden z-50">
                  <div className="text-neutral-200 px-4 py-2 bg-neutral-700 font-semibold">
                    <span>Other Options</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <div
                      className="text-neutral-200 hover:bg-neutral-700 hover:text-neutral-100 px-4 py-2 cursor-pointer flex items-center"
                      onClick={() => {
                        setShowOthersDropdown(false);
                        handleMermaidVisualizerMenuClick();
                      }}
                    >
                      <span className="truncate">Mermaid Visualizer</span>
                    </div>
                  </div>
                </div>
              )}
            </div>,
          ]}
        </div>
      )}
      {!labels && label && (
        <div className="px-2 h-[36px] border-b border-neutral-600 text-xs flex items-center">
          {label}
        </div>
      )}
      <div className="overflow-hidden flex-grow rounded-b-xl">{children}</div>
    </div>
  );
}
