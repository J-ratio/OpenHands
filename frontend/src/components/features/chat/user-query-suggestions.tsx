import React from "react";
import { TbMessage2Question } from "react-icons/tb";
import { cn } from "#/utils/utils";

const suggestions = [
  "Generate driver code from these hardware specs.",
  "Explain this register map in simple terms.",
  "Suggest test cases for this communication protocol.",
  "Find integration issues in this system design document.",
  "Translate this hardware spec into configuration code.",
];

interface UserQuerySuggestionsProps {
  onSelect: (query: string) => void;
}

export function UserQuerySuggestions({ onSelect }: UserQuerySuggestionsProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 hover:bg-neutral-700 rounded-md transition-colors"
        type="button"
      >
        <TbMessage2Question size={20} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute bottom-full right-0 mb-2 min-w-100 max-w-md",
            "bg-neutral-800 border border-neutral-600 rounded-md shadow-lg z-50",
          )}
        >
          <div className="text-neutral-200 px-3 py-2 bg-neutral-700 font-semibold">
            Suggested questions
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, idx) => (
              <li
                key={idx}
                onClick={() => {
                  onSelect(suggestion);
                  setOpen(false);
                }}
                className="px-3 py-2 cursor-pointer text-neutral-200 hover:bg-neutral-600 hover:text-white"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
