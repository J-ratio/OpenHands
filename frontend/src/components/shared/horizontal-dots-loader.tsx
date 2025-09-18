export const HorizontalDotsLoader = () => {
  return (
    <div
      className="flex items-center gap-1"
      aria-live="polite"
      aria-label="Loading data"
    >
      <div
        className="w-1 h-1 bg-neutral-400 rounded-full animate-pulse"
        style={{ animationDelay: "0ms" }}
      ></div>
      <div
        className="w-1 h-1 bg-neutral-400 rounded-full animate-pulse"
        style={{ animationDelay: "150ms" }}
      ></div>
      <div
        className="w-1 h-1 bg-neutral-400 rounded-full animate-pulse"
        style={{ animationDelay: "300ms" }}
      ></div>
    </div>
  );
};
