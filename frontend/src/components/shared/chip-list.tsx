import React from "react";

type ChipListProps<T> = {
  items: T[];
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  onRemove: (key: string) => void;
  icon?: React.ReactNode;
};

function ChipList<T>({
  items,
  getKey,
  getLabel,
  onRemove,
  icon,
}: ChipListProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const key = getKey(item);
        return (
          <div
            key={key}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-xs text-blue-200"
          >
            {icon}
            <span className="truncate max-w-48">{getLabel(item)}</span>
            <button
              onClick={() => onRemove(key)}
              className="ml-1 hover:bg-blue-500/30 rounded-full p-0.5 transition-colors"
              type="button"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0
                     111.414 1.414L11.414 10l4.293 4.293a1 1 0
                     01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0
                     01-1.414-1.414L8.586 10 4.293 5.707a1 1 0
                     010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ChipList;
