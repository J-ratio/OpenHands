import { useEffect, useState } from "react";
import { getAllDataSourcesByWorkspaceId } from "../api/data-sources";
import { getAllWorkspaces } from "../api/workspaces";
import CreateWorkspaceButton from "../components/features/workspaces/components/create-workspace-button";
import WorkspaceCard from "../components/features/workspaces/components/workspace-card";
import { LoadingSpinner } from "../components/shared/loading-spinner";

const WorkspacePage = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [dataSources, setDataSources] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      setError(null);

      const workspacesRes = await getAllWorkspaces();
      if (!workspacesRes.success) {
        setError(workspacesRes.errorMessage || "Failed to load workspaces");
        setLoading(false);
        return;
      }

      setWorkspaces(workspacesRes.data);

      const sourcesMap = {};
      await Promise.all(
        workspacesRes.data.map(async (workspace) => {
          const { success, data } = await getAllDataSourcesByWorkspaceId(
            workspace.id,
          );
          sourcesMap[workspace.id] = success ? data : [];
        }),
      );

      setDataSources(sourcesMap);
      setLoading(false);
    }

    fetchAllData();
  }, []);

  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-logo dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full py-12 overflow-y-auto">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Your Workspaces</h2>
            <CreateWorkspaceButton />
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <div className="text-lg text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.length === 0 ? (
                <div className="text-lg text-gray-500">No workspaces found</div>
              ) : (
                workspaces.map((workspace) => (
                  <WorkspaceCard
                    key={workspace.id}
                    workspace={workspace}
                    dataSources={dataSources[workspace.id] || []}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;
