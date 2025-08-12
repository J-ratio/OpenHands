import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import React from "react";
import posthog from "posthog-js";
import { I18nKey } from "#/i18n/declaration";
import { organizeModelsAndProviders } from "#/utils/organize-models-and-providers";
import { DangerModal } from "../confirmation-modals/danger-modal";
import { extractSettings } from "#/utils/settings-utils";
import { ModalBackdrop } from "../modal-backdrop";
import { ModelSelector } from "./model-selector";
import { Settings } from "#/types/settings";
import { BrandButton } from "#/components/features/settings/brand-button";
import { KeyStatusIcon } from "#/components/features/settings/key-status-icon";
import { SettingsInput } from "#/components/features/settings/settings-input";
import { useSaveSettings } from "#/hooks/mutation/use-save-settings";
import { extractModelAndProvider } from "#/utils/extract-model-and-provider";
import { useWorkspace } from "#/context/WorkspaceContext";

interface SettingsFormProps {
  settings: Settings;
  models: string[];
  onClose: () => void;
}

const DEFAULT_CUSTOM_PROVIDER = "hosted_vllm";
const DEFAULT_CUSTOM_MODEL = "hosted_vllm/Qwen/Qwen2.5-Coder-32B-Instruct-AWQ";
const DEFAULT_CUSTOM_BASE_URL =
  "https://h2loop--qwen25-coder-32b-serve.modal.run/v1";
const DEFAULT_CUSTOM_API_KEY = "super-secret-key";

export function SettingsForm({ settings, models, onClose }: SettingsFormProps) {
  const { mutate: saveUserSettings } = useSaveSettings();
  const location = useLocation();
  const { t } = useTranslation();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [confirmEndSessionModalOpen, setConfirmEndSessionModalOpen] =
    React.useState(false);
  const { selectedWorkspaceId } = useWorkspace();

  const initialModel = settings.LLM_MODEL;
  const initialProvider = extractModelAndProvider(initialModel).provider;

  const isCustomModelCheck = (provider: string | null, model: string | null) =>
    provider === DEFAULT_CUSTOM_PROVIDER || model === DEFAULT_CUSTOM_MODEL;

  const [selectedProvider, setSelectedProvider] =
    React.useState(initialProvider);
  const [selectedModel, setSelectedModel] = React.useState(initialModel);
  const [isCustomModel, setIsCustomModel] = React.useState(
    isCustomModelCheck(initialProvider, initialModel),
  );
  const [baseUrl, setBaseUrl] = React.useState(
    settings.LLM_BASE_URL || (isCustomModel ? DEFAULT_CUSTOM_BASE_URL : ""),
  );
  const [apiKey, setApiKey] = React.useState(
    isCustomModel ? DEFAULT_CUSTOM_API_KEY : "",
  );

  const handleFormSubmission = async (formData: FormData) => {
    const newSettings = {
      ...extractSettings(formData),
      ACTIVE_WORKSPACE_ID: selectedWorkspaceId?.toString(),
    };
    await saveUserSettings(newSettings, {
      onSuccess: () => {
        onClose();
        posthog.capture("settings_saved", {
          LLM_MODEL: newSettings.LLM_MODEL,
          LLM_API_KEY_SET: newSettings.LLM_API_KEY_SET ? "SET" : "UNSET",
          SEARCH_API_KEY_SET: newSettings.SEARCH_API_KEY ? "SET" : "UNSET",
          REMOTE_RUNTIME_RESOURCE_FACTOR:
            newSettings.REMOTE_RUNTIME_RESOURCE_FACTOR,
        });
      },
    });
  };

  const handleConfirmEndSession = () => {
    const formData = new FormData(formRef.current ?? undefined);
    handleFormSubmission(formData);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (location.pathname.startsWith("/conversations/")) {
      setConfirmEndSessionModalOpen(true);
    } else {
      handleFormSubmission(formData);
    }
  };

  const handleModelChange = (model: string | null) => {
    setSelectedModel(model || "");
    const custom = isCustomModelCheck(selectedProvider, model || "");
    setIsCustomModel(custom);
    if (custom) {
      setBaseUrl(DEFAULT_CUSTOM_BASE_URL);
      setApiKey(DEFAULT_CUSTOM_API_KEY);
    } else {
      setBaseUrl(settings.LLM_BASE_URL || "");
      setApiKey("");
    }
  };

  const handleProviderChange = (provider: string | null) => {
    setSelectedProvider(provider || "");
    const custom = isCustomModelCheck(provider || "", selectedModel);
    setIsCustomModel(custom);
    if (custom) {
      setBaseUrl(DEFAULT_CUSTOM_BASE_URL);
      setApiKey(DEFAULT_CUSTOM_API_KEY);
    } else {
      setBaseUrl(settings.LLM_BASE_URL || "");
      setApiKey("");
    }
  };

  const isLLMKeySet = settings.LLM_API_KEY_SET;

  return (
    <div>
      <form
        ref={formRef}
        data-testid="settings-form"
        className="flex flex-col gap-6"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-4">
          <ModelSelector
            models={organizeModelsAndProviders(models)}
            currentModel={selectedModel}
            onProviderChange={handleProviderChange}
            onModelChange={handleModelChange}
          />

          {isCustomModel && (
            <SettingsInput
              name="base-url-input"
              label={t(I18nKey.SETTINGS$BASE_URL)}
              type="text"
              className="w-full"
              value={baseUrl}
              onChange={setBaseUrl}
            />
          )}

          <SettingsInput
            testId="llm-api-key-input"
            name="llm-api-key-input"
            label={t(I18nKey.SETTINGS_FORM$API_KEY)}
            type="password"
            className="w-full"
            placeholder={isLLMKeySet ? "<hidden>" : ""}
            startContent={isLLMKeySet && <KeyStatusIcon isSet={isLLMKeySet} />}
            value={apiKey}
            onChange={setApiKey}
          />

          {/* <HelpLink
            testId="llm-api-key-help-anchor"
            text={t(I18nKey.SETTINGS$DONT_KNOW_API_KEY)}
            linkText={t(I18nKey.SETTINGS$CLICK_FOR_INSTRUCTIONS)}
            href="https://h2loop.ai/"
          /> */}
        </div>

        <div className="flex flex-col gap-2">
          <BrandButton
            testId="save-settings-button"
            type="submit"
            variant="primary"
            className="w-full"
          >
            {t(I18nKey.BUTTON$SAVE)}
          </BrandButton>
        </div>
      </form>

      {confirmEndSessionModalOpen && (
        <ModalBackdrop>
          <DangerModal
            title={t(I18nKey.MODAL$END_SESSION_TITLE)}
            description={t(I18nKey.MODAL$END_SESSION_MESSAGE)}
            buttons={{
              danger: {
                text: t(I18nKey.BUTTON$END_SESSION),
                onClick: handleConfirmEndSession,
              },
              cancel: {
                text: t(I18nKey.BUTTON$CANCEL),
                onClick: () => setConfirmEndSessionModalOpen(false),
              },
            }}
          />
        </ModalBackdrop>
      )}
    </div>
  );
}
