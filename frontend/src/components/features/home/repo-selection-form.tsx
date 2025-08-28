import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useCreateConversation } from "#/hooks/mutation/use-create-conversation";
import { useRepositoryBranches } from "#/hooks/query/use-repository-branches";
import { useIsCreatingConversation } from "#/hooks/use-is-creating-conversation";
import { Branch, GitRepository } from "#/types/git";
import { BrandButton } from "../settings/brand-button";
import { useSearchRepositories } from "#/hooks/query/use-search-repositories";
import { useDebounce } from "#/hooks/use-debounce";
import { sanitizeQuery } from "#/utils/sanitize-query";
import {
  BranchDropdown,
  BranchLoadingState,
  BranchErrorState,
} from "./repository-selection";
import { createADatasource, deleteADataSource } from "#/api/data-sources";
import { toast } from "sonner";
import { useWorkspace } from "#/context/WorkspaceContext";
import { composeRepoUrl } from "#/utils/map-provider";
import { useUserProviders } from "#/hooks/use-user-providers";
import { Provider } from "#/types/settings";
import { GitProviderDropdown } from "../../common/git-provider-dropdown";
import { GitRepositoryDropdown } from "../../common/git-repository-dropdown";
import { GitBranchDropdown } from "../../common/git-branch-dropdown";
import { dataSourceToGitRepository } from "#/utils/utils";

interface RepositorySelectionFormProps {
  onRepoSelection: (repo: GitRepository | null) => void;
  onBranchSelection: (branchName: string | null) => void;
  displayLaunchButton?: boolean;
  displayLinkUnlinkButton?: boolean;
  linkedRepo?: GitRepository | null;
  onLinkedRepoChanged?: () => void;
  displayRepoSelector?: boolean;
}

export function RepositorySelectionForm({
  onRepoSelection,
  onBranchSelection,
  displayLaunchButton = true,
  displayLinkUnlinkButton = false,
  linkedRepo = null,
  onLinkedRepoChanged,
  displayRepoSelector = true,
}: RepositorySelectionFormProps) {
  const navigate = useNavigate();
  const { selectedWorkspaceId, linkedRepo: linkedRepoWorkspace } =
    useWorkspace();

  const [selectedRepository, setSelectedRepository] =
    React.useState<GitRepository | null>(
      linkedRepo
        ? linkedRepo
        : linkedRepoWorkspace
          ? dataSourceToGitRepository(linkedRepoWorkspace!)
          : null,
    );
  const [selectedBranch, setSelectedBranch] = React.useState<Branch | null>(
    null,
  );
  const [selectedProvider, setSelectedProvider] =
    React.useState<Provider | null>(null);
  const { providers } = useUserProviders();
  const { data: branches, isLoading: isLoadingBranches } =
    useRepositoryBranches(selectedRepository?.full_name || null);
  const {
    mutate: createConversation,
    isPending,
    isSuccess,
  } = useCreateConversation();
  const isCreatingConversationElsewhere = useIsCreatingConversation();
  const { t } = useTranslation();

  // Auto-select provider if there's only one
  React.useEffect(() => {
    if (providers.length === 1 && !selectedProvider) {
      setSelectedProvider(providers[0]);
    }
  }, [providers, selectedProvider]);

  React.useEffect(() => {
    if (linkedRepo !== null) {
      setSelectedRepository(linkedRepo);
      onRepoSelection(linkedRepo);
    } else {
      setSelectedRepository(null);
      onRepoSelection(null);
      setSelectedBranch(null);
      onBranchSelection(null);
    }
  }, [selectedWorkspaceId]);

  // Auto-select main or master branch if it exists, but only if the branch wasn't manually cleared
  React.useEffect(() => {
    if (
      branches &&
      branches.length > 0 &&
      !selectedBranch &&
      !isLoadingBranches
    ) {
      // Look for main or master branch
      const mainBranch = branches.find((branch) => branch.name === "main");
      const masterBranch = branches.find((branch) => branch.name === "master");

      // Select main if it exists, otherwise select master if it exists
      if (mainBranch) {
        setSelectedBranch(mainBranch);
        onBranchSelection(mainBranch?.name);
      } else if (masterBranch) {
        setSelectedBranch(masterBranch);
        onBranchSelection(masterBranch?.name);
      }
    }
  }, [branches, isLoadingBranches, selectedBranch]);

  // We check for isSuccess because the app might require time to render
  // into the new conversation screen after the conversation is created.
  const isCreatingConversation =
    isPending || isSuccess || isCreatingConversationElsewhere;

  // Check if repository has no branches (empty array after loading completes)
  const hasNoBranches = !isLoadingBranches && branches && branches.length === 0;

  const handleProviderSelection = (provider: Provider | null) => {
    setSelectedProvider(provider);
    setSelectedRepository(null); // Reset repository selection when provider changes
    setSelectedBranch(null); // Reset branch selection when provider changes
    onBranchSelection(null);
    onRepoSelection(null); // Reset parent component's selected repo
  };

  const handleBranchSelection = (branchName: string | null) => {
    const selectedBranchObj = branches?.find(
      (branch) => branch.name === branchName,
    );
    if (selectedBranchObj) {
      setSelectedBranch(selectedBranchObj);
      onBranchSelection(selectedBranchObj.name);
    }
  };

  // Render the provider dropdown
  const renderProviderSelector = () => {
    // Only render if there are multiple providers
    if (providers.length <= 1) {
      return null;
    }

    return (
      <GitProviderDropdown
        providers={providers}
        value={selectedProvider}
        placeholder="Select Provider"
        className="max-w-[500px]"
        onChange={handleProviderSelection}
      />
    );
  };

  // Effect to auto-select main/master branch when branches are loaded
  React.useEffect(() => {
    if (branches?.length) {
      // Look for main or master branch
      const defaultBranch = branches.find(
        (branch) => branch.name === "main" || branch.name === "master",
      );

      // If found, select it, otherwise select the first branch
      setSelectedBranch(defaultBranch || branches[0]);
    }
  }, [branches]);

  // Render the repository selector using our new component
  const renderRepositorySelector = () => {
    async function linkRepoToWorkspace() {
      const repoUrl = selectedRepository
        ? composeRepoUrl(
            selectedRepository.git_provider,
            selectedRepository.full_name,
          )
        : "";
      const { success, errorMessage } = await createADatasource({
        name: null,
        type: "GIT_REPOSITORY",
        url: repoUrl,
        workspace_ids: [selectedWorkspaceId],
        PAT_TOKEN: "",
      });

      if (!success) {
        toast.error(errorMessage || "Failed to link repo");
      } else {
        toast.success("Repo linked successfully");
        if (onLinkedRepoChanged) onLinkedRepoChanged();
      }
    }

    async function unlinkRepoFromWorkspace(dataSourceId: string) {
      const { success, errorMessage } = await deleteADataSource(dataSourceId);

      if (!success) {
        toast.error(errorMessage || "Failed to unlink repo");
      } else {
        toast.success("Repo unlinked successfully");
        if (onLinkedRepoChanged) onLinkedRepoChanged();
      }
    }

    const handleRepoSelection = (repository?: GitRepository) => {
      if (repository) {
        onRepoSelection(repository);
        setSelectedRepository(repository);
      } else {
        setSelectedRepository(null);
        setSelectedBranch(null);
        onBranchSelection(null);
      }
    };

    return (
      <div className="flex items-center w-full">
        <div className="flex-1 max-w-[500px]">
          <GitRepositoryDropdown
            provider={selectedProvider || providers[0]}
            value={selectedRepository?.id || null}
            placeholder="Search repositories..."
            disabled={!selectedProvider || !!linkedRepo}
            onChange={handleRepoSelection}
            className="max-w-[500px]"
          />
        </div>
        {displayLinkUnlinkButton ? (
          !linkedRepo ? (
            <BrandButton
              testId="repo-link-button"
              variant="primary"
              type="button"
              isDisabled={
                !!linkedRepo || !selectedRepository || isCreatingConversation
              }
              onClick={linkRepoToWorkspace}
              className="ml-2 w-20"
            >
              Link
            </BrandButton>
          ) : (
            <BrandButton
              testId="repo-link-button"
              variant="primary"
              type="button"
              onClick={() => unlinkRepoFromWorkspace(linkedRepo.id)}
              className="ml-2 w-20"
            >
              UnLink
            </BrandButton>
          )
        ) : null}
      </div>
    );
  };

  // Render the branch selector
  const renderBranchSelector = () => {
    if (!selectedRepository) {
      return (
        <GitBranchDropdown
          repositoryName={""}
          value={selectedBranch?.name || null}
          placeholder="Select branch..."
          className="max-w-[500px]"
          disabled
          onChange={handleBranchSelection}
        />
      );
    }
    return (
      <GitBranchDropdown
        repositoryName={selectedRepository?.full_name}
        value={selectedBranch?.name || null}
        placeholder="Select branch..."
        className="max-w-[500px]"
        disabled={!selectedRepository}
        onChange={handleBranchSelection}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {renderProviderSelector()}
      {displayRepoSelector && renderRepositorySelector()}

      {
        <div>
          {!displayRepoSelector && <span className="text-sm">Branch Name</span>}
          <div className="mb-2"></div>
          {renderBranchSelector()}
        </div>
      }

      {displayLaunchButton && (
        <BrandButton
          testId="repo-launch-button"
          variant="primary"
          type="button"
          isDisabled={
            !selectedRepository ||
            (!selectedBranch && !hasNoBranches) ||
            isLoadingBranches ||
            isCreatingConversation ||
            (providers.length > 1 && !selectedProvider)
          }
          onClick={() =>
            createConversation(
              {
                repository: {
                  name: selectedRepository?.full_name || "",
                  gitProvider: selectedRepository?.git_provider || "github",
                  branch: selectedBranch?.name || (hasNoBranches ? "" : "main"),
                },
              },
              {
                onSuccess: (data) =>
                  navigate(`/conversations/${data.conversation_id}`),
              },
            )
          }
        >
          {!isCreatingConversation && "Launch"}
          {isCreatingConversation && t("HOME$LOADING")}
        </BrandButton>
      )}
    </div>
  );
}
