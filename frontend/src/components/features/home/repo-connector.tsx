import { useTranslation } from "react-i18next";
import { ConnectToProviderMessage } from "./connect-to-provider-message";
import { RepositorySelectionForm } from "./repo-selection-form";
import { useConfig } from "#/hooks/query/use-config";
import { RepoProviderLinks } from "./repo-provider-links";
import { useUserProviders } from "#/hooks/use-user-providers";

interface RepoConnectorProps {
  onRepoSelection: (repoTitle: string | null) => void;
  onBranchSelection: (branchName: string | null) => void;
  displayLaunchButton?: boolean;
  heading?: string;
  message?: string;
}

export function RepoConnector({
  onRepoSelection,
  onBranchSelection,
  displayLaunchButton = true,
  heading,
  message,
}: RepoConnectorProps) {
  const { providers } = useUserProviders();
  const { data: config } = useConfig();
  const { t } = useTranslation();

  const isSaaS = config?.APP_MODE === "saas";
  const providersAreSet = providers.length > 0;

  return (
    <section
      data-testid="repo-connector"
      className="w-full flex flex-col gap-6"
    >
      <h2 className="heading">{heading ?? t("HOME$CONNECT_TO_REPOSITORY")}</h2>

      {!providersAreSet && <ConnectToProviderMessage message={message} />}
      {providersAreSet && (
        <RepositorySelectionForm
          onRepoSelection={onRepoSelection}
          onBranchSelection={onBranchSelection}
          displayLaunchButton={displayLaunchButton}
          displayLinkButton={true}
        />
      )}

      {isSaaS && providersAreSet && <RepoProviderLinks />}
    </section>
  );
}
