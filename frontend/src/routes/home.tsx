import React, { useEffect } from "react";
import { PrefetchPageLinks } from "react-router";
import { HomeHeader } from "#/components/features/home/home-header";
import {
  DataSource,
  RepoConnector,
} from "#/components/features/home/repo-connector";
import { TaskSuggestions } from "#/components/features/home/tasks/task-suggestions";
import { useUserProviders } from "#/hooks/use-user-providers";
import { ToolsSection } from "#/components/features/home/tools/tool-section";
import { useWorkspace } from "#/context/WorkspaceContext";

<PrefetchPageLinks page="/conversations/:conversationId" />;

function HomeScreen() {
  const { providers } = useUserProviders();
  const [selectedRepoTitle, setSelectedRepoTitle] = React.useState<
    string | null
  >(null);
  const { linkedRepo } = useWorkspace();

  const { linkedRepo } = useWorkspace();

  const providersAreSet = providers.length > 0;

  return (
    <div
      data-testid="home-screen"
      className="bg-base-secondary h-full flex flex-col rounded-xl px-[42px] pt-[42px] gap-8 overflow-y-auto"
    >
      <HomeHeader />

      <hr className="border-[#717888]" />

      <main className="flex flex-col md:flex-row justify-between gap-8">
        <RepoConnector
          onRepoSelection={(title) => setSelectedRepoTitle(title)}
          onBranchSelection={(_) => {}}
          heading={
            linkedRepo
              ? "Repository Linked"
              : "Connect a Repository to a Workspace"
          }
        />
        <hr className="md:hidden border-[#717888]" />
        {providersAreSet && <TaskSuggestions filterFor={selectedRepoTitle} />}
      </main>
      <ToolsSection />
    </div>
  );
}

export default HomeScreen;
