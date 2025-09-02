import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import PlusIcon from "#/icons/plus.svg?react";
import { TooltipButton } from "./tooltip-button";
import { useCreateConversation } from "#/hooks/mutation/use-create-conversation";
import { GrCompare } from "react-icons/gr";

interface NewProjectButtonProps {
  disabled?: boolean;
  comparision?: boolean;
  useH2LoopModel?: boolean;
}

export function NewProjectButton({
  disabled = false,
  comparision = false,
  useH2LoopModel = false,
}: NewProjectButtonProps) {
  const { t } = useTranslation();
  const startNewProject = !comparision
    ? t(I18nKey.CONVERSATION$START_NEW)
    : "Start new conversation (comparision)";

  const { mutate: createConversation } = useCreateConversation(comparision);

  return (
    <TooltipButton
      tooltip={startNewProject}
      ariaLabel={startNewProject}
      navLinkTo="/"
      testId="new-project-button"
      onClick={() => createConversation({ use_h2loop_model: useH2LoopModel })}
      disabled={disabled}
    >
      {!comparision ? (
        <PlusIcon width={28} height={28} />
      ) : (
        <GrCompare width={28} height={28} />
      )}
    </TooltipButton>
  );
}
