import { useTranslation } from "react-i18next";
import { ConnectToProviderMessage } from "./connect-to-provider-message";
import { RepositorySelectionForm } from "./repo-selection-form";
import { useConfig } from "#/hooks/query/use-config";
import { RepoProviderLinks } from "./repo-provider-links";
import { useUserProviders } from "#/hooks/use-user-providers";
import { GitRepository } from "#/types/git";
import React, { useEffect, useState } from "react";
import { getAllDataSourcesByWorkspaceId } from "#/api/data-sources";
import { useWorkspace } from "#/context/WorkspaceContext";
import NewCodebaseInput from "../workspaces/components/new-codebase-input";

function dataSourceToGitRepository(ds: DataSource): GitRepository {
  // TODO: make it dynamic here
  return {
    id: ds.id.toString(),
    full_name: ds.name || ds.url || "",
    git_provider: "github",
    is_public: true,
  };
}
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
  const { selectedWorkspaceId } = useWorkspace();
  const [linkedRepo, setLinkedRepo] = useState<DataSource | undefined>(
    undefined,
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTab, setSelectedTab] = useState<"private" | "public">(
    "private",
  );

  useEffect(() => {
    if (!selectedWorkspaceId) {
      setLinkedRepo(undefined);
      return;
    }
    async function fetchLinkedRepo() {
      const res = await getAllDataSourcesByWorkspaceId(selectedWorkspaceId);
      if (res.success && Array.isArray(res.data)) {
        const repo = res.data.find(
          (ds: DataSource) => ds.type === "GIT_REPOSITORY",
        );
        setLinkedRepo(repo);
      } else {
        setLinkedRepo(undefined);
      }
    }
    fetchLinkedRepo();
  }, [selectedWorkspaceId, refreshKey]);

  const handleRefreshLinkedRepo = () => setRefreshKey((k) => k + 1);

  const isSaaS = config?.APP_MODE === "saas";
  const providersAreSet = providers.length > 0;

  return (
    <section
      data-testid="repo-connector"
      className="w-full flex flex-col gap-6"
    >
      <h2 className="heading">{heading ?? t("HOME$CONNECT_TO_REPOSITORY")}</h2>

      {/* Tab Bar */}
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

      {selectedTab === "private" && (
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
