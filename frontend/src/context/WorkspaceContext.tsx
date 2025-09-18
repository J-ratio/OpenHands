import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useSettings } from "#/hooks/query/use-settings";
import { DataSource } from "#/components/features/home/repo-connector";
import { getAllDataSourcesByWorkspaceId } from "#/api/data-sources";
import { useSaveSettings } from "#/hooks/mutation/use-save-settings";
import { getWorkspaceNameFromId } from "#/utils/workspace-utils";

interface WorkspaceContextType {
  selectedWorkspace: any;
  setSelectedWorkspace: (workspace: any) => void;
  selectedWorkspaceId: string | undefined;
  setSelectedWorkspaceId: (id: string | undefined) => void;
  selectedWorkspaceName: string | undefined;
  setSelectedWorkspaceName: (name: string | undefined) => void;
  workspaces: any[];
  setWorkspaces: (workspaces: any[]) => void;
  linkedRepo: DataSource | undefined;
  handleRefreshLinkedRepo: () => void;
  isFetchingLinkedRepo: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { data: settings } = useSettings();
  const [selectedWorkspace, setSelectedWorkspace] = useState();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<
    string | undefined
  >(settings?.ACTIVE_WORKSPACE_ID || undefined);
  const [selectedWorkspaceName, setSelectedWorkspaceName] = useState<
    string | undefined
  >();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [linkedRepo, setLinkedRepo] = useState<DataSource | undefined>(
    undefined,
  );
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isFetchingLinkedRepo, setIsFetchingLinkedRepo] = useState<boolean>(false);

  const { mutate: saveUserSettings } = useSaveSettings();

  const handleRefreshLinkedRepo = () => setRefreshKey((k) => k + 1);

  const linkedRepoLocalStorageKey = "linked_repo";

  async function fetchLinkedRepo(workspaceId: string) {
    setIsFetchingLinkedRepo(true);
    try {
      if (!workspaceId) {
        setLinkedRepo(undefined);
        localStorage.removeItem(linkedRepoLocalStorageKey);
        setIsFetchingLinkedRepo(false);
        return;
      }
      const res = await getAllDataSourcesByWorkspaceId(workspaceId);
      if (res.success && Array.isArray(res.data)) {
        const repo = res.data.find(
          (ds: DataSource) => ds.type === "GIT_REPOSITORY",
        );
        if (repo) {
          setLinkedRepo(repo);
          localStorage.setItem(linkedRepoLocalStorageKey, repo.url);
        } else {
          setLinkedRepo(undefined);
          localStorage.removeItem(linkedRepoLocalStorageKey);
        }
      } else {
        setLinkedRepo(undefined);
        localStorage.removeItem(linkedRepoLocalStorageKey);
      }
      setIsFetchingLinkedRepo(false);
    } catch (error) {
      setIsFetchingLinkedRepo(false);
      throw error;
    }
  }

  useEffect(() => {
    const activeWorkspaceId = settings?.ACTIVE_WORKSPACE_ID;
    if (activeWorkspaceId) {
      if (location.pathname === "/") {
        fetchLinkedRepo(activeWorkspaceId);
      }

      setSelectedWorkspaceName(
        getWorkspaceNameFromId(workspaces, Number(activeWorkspaceId)),
      );
    } else {
      setLinkedRepo(undefined);
      localStorage.removeItem(linkedRepoLocalStorageKey);
    }

    if (activeWorkspaceId === null) {
      saveUserSettings({
        ACTIVE_WORKSPACE_ID: selectedWorkspaceId?.toString(),
      });
    }
  }, [settings?.ACTIVE_WORKSPACE_ID]);

  useEffect(() => {
    fetchLinkedRepo(settings?.ACTIVE_WORKSPACE_ID ?? "");
  }, [refreshKey]);

  useEffect(() => {
    if (settings?.ACTIVE_WORKSPACE_ID) return;
    if (!selectedWorkspaceId || !settings?.LLM_MODEL) return;
    setSelectedWorkspaceId(selectedWorkspaceId);
    saveUserSettings({ ACTIVE_WORKSPACE_ID: selectedWorkspaceId?.toString() });
  }, [settings, selectedWorkspaceId]);

  return (
    <WorkspaceContext.Provider
      value={{
        selectedWorkspace,
        setSelectedWorkspace,
        selectedWorkspaceId,
        setSelectedWorkspaceId,
        workspaces,
        setWorkspaces,
        linkedRepo,
        handleRefreshLinkedRepo,
        selectedWorkspaceName,
        setSelectedWorkspaceName,
        isFetchingLinkedRepo,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
