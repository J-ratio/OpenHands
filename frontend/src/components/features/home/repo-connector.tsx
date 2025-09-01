import { useTranslation } from "react-i18next";
import { FaInfoCircle } from "react-icons/fa";
import { ConnectToProviderMessage } from "./connect-to-provider-message";
import { RepositorySelectionForm } from "./repo-selection-form";
import { useConfig } from "#/hooks/query/use-config";
import { RepoProviderLinks } from "./repo-provider-links";
import { useUserProviders } from "#/hooks/use-user-providers";
import { useState } from "react";
import { deleteADataSource } from "#/api/data-sources";
import { useWorkspace } from "#/context/WorkspaceContext";
import NewCodebaseInput from "../workspaces/components/new-codebase-input";
import { BrandButton } from "../settings/brand-button";
import { toast } from "sonner";
import { dataSourceToGitRepository } from "#/utils/utils.ts";
import { GitRepository } from "#/types/git";
import { TooltipButton } from "#/components/shared/buttons/tooltip-button";

export interface DataSource {
  name: string | undefined;
  type: "GIT_REPOSITORY" | "FILE";
  url?: string;
  id: number;
  created_by: number;
  versions: [];
  workspace_ids: Array<number>;
  created_at: string;
  updated_at: string;
}

interface RepoConnectorProps {
  onRepoSelection: (repo: GitRepository | null) => void;
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
  const { selectedWorkspaceId, linkedRepo, handleRefreshLinkedRepo } =
    useWorkspace();
  const [selectedTab, setSelectedTab] = useState<"private" | "public">(
    "private",
  );

  const isSaaS = config?.APP_MODE === "saas";
  const providersAreSet = providers.length > 0;

  async function unlinkRepoFromWorkspace(dataSourceId: string) {
    const { success, errorMessage } = await deleteADataSource(dataSourceId);

    if (!success) {
      toast.error(errorMessage || "Failed to unlink repo");
    } else {
      toast.success("Repo unlinked successfully");
      handleRefreshLinkedRepo();
    }
  }

  return (
    <section
      data-testid="repo-connector"
      className="w-full flex flex-col gap-6"
    >
      <div className="flex items-center gap-2">
        <h2 className="heading">
          {heading ?? t("HOME$CONNECT_TO_REPOSITORY")}
        </h2>
        <TooltipButton
          testId="repo-connector-info"
          tooltip={t("HOME$CONNECT_TO_REPOSITORY_TOOLTIP")}
          ariaLabel={t("HOME$CONNECT_TO_REPOSITORY_TOOLTIP")}
          className="text-[#9099AC] hover:text-white"
          placement="bottom"
          tooltipClassName="max-w-[348px]"
        >
          <FaInfoCircle size={16} />
        </TooltipButton>
      </div>

      {/* Tab Bar */}
      {!linkedRepo && (
        <div className="flex gap-2 max-w-md">
          <button
            className={`px-20 py-2 rounded-t-md border-b-2 transition-colors ${selectedTab === "private" ? "border-blue-500 bg-tertiary" : "border-transparent bg-transparent"}`}
            onClick={() => setSelectedTab("private")}
            type="button"
          >
            Private
          </button>
          <button
            className={`px-20 py-2 rounded-t-md border-b-2 transition-colors ${selectedTab === "public" ? "border-blue-500 bg-tertiary" : "border-transparent bg-transparent"}`}
            onClick={() => setSelectedTab("public")}
            type="button"
          >
            Public
          </button>
        </div>
      )}

      {/* {selectedTab === "private" && (
        <>
          {linkedRepo && (
            <p>
              This workspace is connected to the repo:
              <a
                href={linkedRepo?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors ml-1"
              >
                {linkedRepo?.name}
              </a>
            </p>
          )}

          {linkedRepo && !providersAreSet && (
            <BrandButton
              testId="repo-link-button"
              variant="primary"
              type="button"
              onClick={() =>
                unlinkRepoFromWorkspace(linkedRepo?.id?.toString() ?? "")
              }
              className="ml-2 w-20"
            >
              UnLink
            </BrandButton>
          )} */}

      {selectedTab === "private" && (
        <>
          {linkedRepo && (
            <div className="flex items-center gap-8 flex-wrap">
              <p className="flex items-center">
                This workspace is connected to the repo:
                <a
                  href={linkedRepo?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors ml-1"
                >
                  {linkedRepo?.name}
                </a>
              </p>

              {!providersAreSet && (
                <BrandButton
                  testId="repo-link-button"
                  variant="primary"
                  type="button"
                  onClick={() =>
                    unlinkRepoFromWorkspace(linkedRepo?.id?.toString() ?? "")
                  }
                  className="w-20"
                >
                  Unlink
                </BrandButton>
              )}
            </div>
          )}

          {!providersAreSet && <ConnectToProviderMessage message={message} />}
          {providersAreSet && (
            <RepositorySelectionForm
              onRepoSelection={onRepoSelection}
              onBranchSelection={onBranchSelection}
              displayLaunchButton={displayLaunchButton}
              displayLinkUnlinkButton={true}
              linkedRepo={
                linkedRepo ? dataSourceToGitRepository(linkedRepo) : undefined
              }
              onLinkedRepoChanged={handleRefreshLinkedRepo}
            />
          )}
        </>
      )}
      {selectedTab === "public" && (
        <NewCodebaseInput
          isAdding={true}
          workspace={{
            id: selectedWorkspaceId,
          }}
          canAdd={!linkedRepo}
        />
      )}

      {isSaaS && providersAreSet && <RepoProviderLinks />}
    </section>
  );
}
