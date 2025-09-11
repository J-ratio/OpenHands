import React from "react";
import { useLocation } from "react-router";
import { useGitUser } from "#/hooks/query/use-git-user";
import { UserActions } from "./user-actions";
import { H2LoopLogoButton } from "#/components/shared/buttons/h2loop-logo-button";
import { NewProjectButton } from "#/components/shared/buttons/new-project-button";
import { SettingsButton } from "#/components/shared/buttons/settings-button";
import { ConversationPanelButton } from "#/components/shared/buttons/conversation-panel-button";
import { SettingsModal } from "#/components/shared/modals/settings/settings-modal";
import { useSettings } from "#/hooks/query/use-settings";
import { ConversationPanel } from "../conversation-panel/conversation-panel";
import { ConversationPanelWrapper } from "../conversation-panel/conversation-panel-wrapper";
import { useLogoutToken } from "#/hooks/use-logout-token";
import { useConfig } from "#/hooks/query/use-config";
import { displayErrorToast } from "#/utils/custom-toast-handlers";
import { useIsCreatingConversation } from "#/hooks/use-is-creating-conversation";
import { useCreateConversation } from "#/hooks/mutation/use-create-conversation";
import { TooltipButton } from "#/components/shared/buttons/tooltip-button";
import { I18nKey } from "#/i18n/declaration";
import { t } from "i18next";
import { MdOutlineAddHomeWork } from "react-icons/md";
import { IoDocumentTextSharp } from "react-icons/io5";
import { FaFile } from "react-icons/fa";
import { TbTemplate } from "react-icons/tb";
import { MicroagentManagementButton } from "#/components/shared/buttons/microagent-management-button";

export function Sidebar() {
  const location = useLocation();
  const user = useGitUser();
  const { data: config } = useConfig();
  const {
    data: settings,
    error: settingsError,
    isError: settingsIsError,
    isFetching: isFetchingSettings,
  } = useSettings();
  const { logout } = useLogoutToken();

  // const [settingsModalIsOpen, setSettingsModalIsOpen] = React.useState(false);

  const [conversationPanelIsOpen, setConversationPanelIsOpen] =
    React.useState(false);

  const { isPending, isSuccess } = useCreateConversation();
  const isCreatingConversationElsewhere = useIsCreatingConversation();
  const isCreatingConversation =
    isPending || isSuccess || isCreatingConversationElsewhere;

  // TODO: Remove HIDE_LLM_SETTINGS check once released
  const shouldHideLlmSettings =
    config?.FEATURE_FLAGS.HIDE_LLM_SETTINGS && config?.APP_MODE === "saas";

  const shouldHideMicroagentManagement =
    config?.FEATURE_FLAGS.HIDE_MICROAGENT_MANAGEMENT;

  // React.useEffect(() => {
  //   if (shouldHideLlmSettings) return;

  //   if (location.pathname === "/settings") {
  //     setSettingsModalIsOpen(false);
  //   } else if (
  //     !isFetchingSettings &&
  //     settingsIsError &&
  //     settingsError?.status !== 404
  //   ) {
  //     // We don't show toast errors for settings in the global error handler
  //     // because we have a special case for 404 errors
  //     if (location.pathname === "/settings") {
  //       displayErrorToast(
  //         "Something went wrong while fetching settings. Please reload the page.",
  //       );
  //     }
  //   } else if (config?.APP_MODE === "oss" && settingsError?.status === 404) {
  //     setSettingsModalIsOpen(true);
  //   }
  // }, [
  //   settingsError?.status,
  //   settingsError,
  //   isFetchingSettings,
  //   location.pathname,
  // ]);

  return (
    <>
      <aside className="h-[40px] md:h-auto px-1 flex flex-row md:flex-col gap-1">
        <nav className="flex flex-row md:flex-col items-center justify-between w-full h-auto md:w-auto md:h-full">
          <div className="flex flex-row md:flex-col items-center gap-[26px]">
            <div className="flex items-center justify-center">
              <H2LoopLogoButton />
            </div>
            <NewProjectButton
              disabled={
                settings?.EMAIL_VERIFIED === false || isCreatingConversation
              }
            />

            <ConversationPanelButton
              isOpen={conversationPanelIsOpen}
              onClick={() =>
                settings?.EMAIL_VERIFIED === false
                  ? null
                  : setConversationPanelIsOpen((prev) => !prev)
              }
              disabled={settings?.EMAIL_VERIFIED === false}
            />
            <TooltipButton
              tooltip={t(I18nKey.SIDEBAR$DOCUMENTS)}
              ariaLabel={t(I18nKey.SIDEBAR$DOCUMENTS)}
              navLinkTo="/documents"
              disabled={settings?.EMAIL_VERIFIED === false}
            >
              <IoDocumentTextSharp
                size={24}
                className={`text-[#9099AC] ${settings?.EMAIL_VERIFIED === false ? "opacity-50" : ""}`}
              />
            </TooltipButton>
            <TooltipButton
              tooltip={t(I18nKey.SIDEBAR$TEMPLATES)}
              ariaLabel={t(I18nKey.SIDEBAR$TEMPLATES)}
              navLinkTo="/templates"
              disabled={settings?.EMAIL_VERIFIED === false}
            >
              <TbTemplate
                size={24}
                className={`text-[#9099AC] ${settings?.EMAIL_VERIFIED === false ? "opacity-50" : ""}`}
              />
            </TooltipButton>
            <TooltipButton
              tooltip={t(I18nKey.SIDEBAR$FILE_MANAGER)}
              ariaLabel={t(I18nKey.SIDEBAR$FILE_MANAGER)}
              navLinkTo="/file-manager"
              disabled={settings?.EMAIL_VERIFIED === false}
            >
              <FaFile
                size={24}
                className={`text-[#9099AC] ${settings?.EMAIL_VERIFIED === false ? "opacity-50" : ""}`}
              />
            </TooltipButton>
            <TooltipButton
              tooltip={t(I18nKey.SIDEBAR$WORKSPACES)}
              ariaLabel={t(I18nKey.SIDEBAR$WORKSPACES)}
              navLinkTo="/workspaces"
              disabled={settings?.EMAIL_VERIFIED === false}
            >
              <MdOutlineAddHomeWork
                size={24}
                className={`text-[#9099AC] ${settings?.EMAIL_VERIFIED === false ? "opacity-50" : ""}`}
              />
            </TooltipButton>
            {import.meta.env.VITE_SHOW_CHAT_COMPARISON_MODE && (
              <NewProjectButton
                disabled={
                  settings?.EMAIL_VERIFIED === false || isCreatingConversation
                }
                comparision={true}
                useH2LoopModel={true}
              />
            )}
            {/* {!shouldHideMicroagentManagement && (
              <MicroagentManagementButton
                disabled={settings?.EMAIL_VERIFIED === false}
              />
            )} */}
          </div>

          <div className="flex flex-row md:flex-col md:items-center gap-[26px] md:mb-4">
            {/* <DocsButton disabled={settings?.EMAIL_VERIFIED === false} /> */}
            <SettingsButton disabled={settings?.EMAIL_VERIFIED === false} />
            <UserActions
              user={
                user.data ? { avatar_url: user.data.avatar_url } : undefined
              }
              onLogout={logout}
              isLoading={user.isFetching}
            />
          </div>
        </nav>

        {conversationPanelIsOpen && (
          <ConversationPanelWrapper isOpen={conversationPanelIsOpen}>
            <ConversationPanel
              onClose={() => setConversationPanelIsOpen(false)}
            />
          </ConversationPanelWrapper>
        )}
      </aside>

      {/* {settingsModalIsOpen && (
        <SettingsModal
          settings={settings}
          onClose={() => setSettingsModalIsOpen(false)}
        />
      )} */}
    </>
  );
}
