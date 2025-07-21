import React, { useEffect } from "react";
import { PrefetchPageLinks } from "react-router";
import { HomeHeader } from "#/components/features/home/home-header";
import { RepoConnector } from "#/components/features/home/repo-connector";
import { TaskSuggestions } from "#/components/features/home/tasks/task-suggestions";
import { useUserProviders } from "#/hooks/use-user-providers";
import { ToolsSection } from "#/components/features/home/tools/tool-section";
import { getAllDataSourcesByWorkspaceId } from "#/api/data-sources";
import { useWorkspace } from "#/context/WorkspaceContext";
import {
  ConnectedRepoInfo,
  DataSource,
} from "#/components/features/home/connected-repo-info";

<PrefetchPageLinks page="/conversations/:conversationId" />;

function HomeScreen() {
  const { providers } = useUserProviders();
  const [selectedRepoTitle, setSelectedRepoTitle] = React.useState<
    string | null
  >(null);
  const [linkedRepo, setLinkedRepo] = React.useState<DataSource | undefined>(
    undefined,
  );
  const { selectedWorkspaceId } = useWorkspace();

  const providersAreSet = providers.length > 0;

  useEffect(() => {
    const getWorkspaceRepo = async () => {
      const { success, data, errorMessage } =
        await getAllDataSourcesByWorkspaceId(selectedWorkspaceId);
      if (success) {
        const firstLinkedRepo = data.filter(
          (source: any) => source.type === "GIT_REPOSITORY",
        )[0];
        if (firstLinkedRepo) {
          setLinkedRepo(firstLinkedRepo);
        } else {
          setLinkedRepo(undefined);
        }
      }
    };

    getWorkspaceRepo();
  }, [selectedWorkspaceId]);

  return (
    <div
      data-testid="home-screen"
      className="bg-base-secondary h-full flex flex-col rounded-xl px-[42px] pt-[42px] gap-8 overflow-y-auto"
    >
      <HomeHeader />

      <hr className="border-[#717888]" />

      <main className="flex flex-col md:flex-row justify-between gap-8">
        {linkedRepo ? (
          <ConnectedRepoInfo repo={linkedRepo} />
        ) : (
          <RepoConnector
            onRepoSelection={(title) => setSelectedRepoTitle(title)}
            onBranchSelection={(_) => {}}
            heading="Connect a Repository to a Workspace"
          />
        )}
        <hr className="md:hidden border-[#717888]" />
        {providersAreSet && <TaskSuggestions filterFor={selectedRepoTitle} />}
      </main>
      <ToolsSection />
    </div>
  );
}

export default HomeScreen;
