import { useTranslation } from "react-i18next";
import { Suggestions } from "#/components/features/suggestions/suggestions";
import { I18nKey } from "#/i18n/declaration";
import H2LoopLogo from "#/assets/branding/h2loop-logo.svg?react";
import { SUGGESTIONS } from "#/utils/suggestions";

interface ChatSuggestionsProps {
  onSuggestionsClick: (value: string) => void;
}

export function CompareChatSuggestions({
  onSuggestionsClick,
}: ChatSuggestionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6 h-full px-4 items-center justify-center">
      <div className="flex flex-col items-center p-4 bg-tertiary rounded-xl w-full">
        <H2LoopLogo width={45} height={54} />
        <span className="mt-2 font-semibold text-[20px] leading-6 -tracking-[0.01em] gap-1">
          {t(I18nKey.LANDING$TITLE)}
        </span>
      </div>
      {/* <Suggestions
        suggestions={Object.entries(SUGGESTIONS.repo)
          .slice(0, 4)
          .map(([label, value]) => ({
            label,
            value,
          }))}
        onSuggestionClick={onSuggestionsClick}
      /> */}
    </div>
  );
}
