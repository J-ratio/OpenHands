import { useTranslation } from "react-i18next";
import { useCreateConversation } from "#/hooks/mutation/use-create-conversation";
import { useIsCreatingConversation } from "#/hooks/use-is-creating-conversation";
import { BrandButton } from "../settings/brand-button";
import H2LoopLogo from "#/assets/branding/h2loop-logo.svg?react";
import { useWorkspace } from "#/context/WorkspaceContext";
import { useSaveSettings } from "#/hooks/mutation/use-save-settings";
import { useEffect } from "react";
import { useSettings } from "#/hooks/query/use-settings";

export function HomeHeader() {
  const {
    mutate: createConversation,
    isPending,
    isSuccess,
  } = useCreateConversation();
  const isCreatingConversationElsewhere = useIsCreatingConversation();
  const { t } = useTranslation();
  const { data: settings } = useSettings();

  // We check for isSuccess because the app might require time to render
  // into the new conversation screen after the conversation is created.
  const isCreatingConversation =
    isPending || isSuccess || isCreatingConversationElsewhere;

  const {
    selectedWorkspaceId,
  } = useWorkspace();

  const { mutate: saveUserSettings } = useSaveSettings();

  useEffect(() => {
    if (!selectedWorkspaceId || !settings?.LLM_MODEL) return;
    saveUserSettings({ ACTIVE_WORKSPACE_ID: selectedWorkspaceId?.toString() });
  }, [selectedWorkspaceId]);

  return (
    <header className="flex flex-col gap-5">
      <H2LoopLogo width={100} height={100} />

      <div className="flex items-center justify-between">
        <h1 className="heading">{t("HOME$LETS_START_BUILDING")}</h1>
        <BrandButton
          testId="header-launch-button"
          variant="primary"
          type="button"
          onClick={() => createConversation({})}
          isDisabled={isCreatingConversation}
        >
          {!isCreatingConversation && t("HOME$LAUNCH_FROM_SCRATCH")}
          {isCreatingConversation && t("HOME$LOADING")}
        </BrandButton>
      </div>

      {/* <div className="flex items-center justify-between">
        <p className="text-sm max-w-[424px]">{t("HOME$H2LOOP_DESCRIPTION")}</p>
        <p className="text-sm">
          {t("HOME$NOT_SURE_HOW_TO_START")}{" "}
          <a
            href="https://h2loop.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            {t("HOME$READ_THIS")}
          </a>
        </p>
      </div> */}
    </header>
  );
}
