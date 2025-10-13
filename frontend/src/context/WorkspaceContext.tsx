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

const ACTIVE_WORKSPACE_ID_SESSION_STORAGEKEY = 'active_workspace_id';

const LINKED_REPO_SESSION_STORAGE_KEY = "linked_repo";

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
  >(getCurrentWorkspaceId(settings?.ACTIVE_WORKSPACE_ID));
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

  // Helper function to get current workspace ID with tab-specific priority
  function getCurrentWorkspaceId(globalWorkspaceId?: string): string | undefined {
    const tabWorkspaceId = sessionStorage.getItem(ACTIVE_WORKSPACE_ID_SESSION_STORAGEKEY);
    if (tabWorkspaceId) {
      return tabWorkspaceId;
    }
    return globalWorkspaceId;
  }

  const setTabWorkspaceId = (workspaceId: string | undefined) => {
    if (workspaceId) {
      sessionStorage.setItem(ACTIVE_WORKSPACE_ID_SESSION_STORAGEKEY, workspaceId);
    } else {
      sessionStorage.removeItem(ACTIVE_WORKSPACE_ID_SESSION_STORAGEKEY);
    }
    setSelectedWorkspaceId(workspaceId);
  };

  const handleRefreshLinkedRepo = () => setRefreshKey((k) => k + 1);

  async function fetchLinkedRepo(workspaceId: string) {
    setIsFetchingLinkedRepo(true);
    try {
      if (!workspaceId) {
        setLinkedRepo(undefined);
        sessionStorage.removeItem(LINKED_REPO_SESSION_STORAGE_KEY);
        return;
      }
      const res = await getAllDataSourcesByWorkspaceId(workspaceId);
      if (res.success && Array.isArray(res.data)) {
        const repo = res.data.find(
          (ds: DataSource) => ds.type === "GIT_REPOSITORY",
        );
        if (repo) {
          setLinkedRepo(repo);
          sessionStorage.setItem(LINKED_REPO_SESSION_STORAGE_KEY, repo.url);
        } else {
          setLinkedRepo(undefined);
          sessionStorage.removeItem(LINKED_REPO_SESSION_STORAGE_KEY);
        }
      } else {
        setLinkedRepo(undefined);
        sessionStorage.removeItem(LINKED_REPO_SESSION_STORAGE_KEY);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingLinkedRepo(false);
    }
  }

  useEffect(() => {
    const globalWorkspaceId = settings?.ACTIVE_WORKSPACE_ID;
    const currentWorkspaceId = getCurrentWorkspaceId(globalWorkspaceId);

    if (currentWorkspaceId && currentWorkspaceId !== selectedWorkspaceId) {
      setSelectedWorkspaceId(currentWorkspaceId);
      if (location.pathname === "/") {
        fetchLinkedRepo(currentWorkspaceId);
      }

      setSelectedWorkspaceName(
        getWorkspaceNameFromId(workspaces, Number(currentWorkspaceId)),
      );
    } else if (!currentWorkspaceId) {
      setLinkedRepo(undefined);
      sessionStorage.removeItem(LINKED_REPO_SESSION_STORAGE_KEY);
    }

    if (globalWorkspaceId === null) {
      saveUserSettings({
        ACTIVE_WORKSPACE_ID: selectedWorkspaceId?.toString(),
      });
    }
  }, [settings?.ACTIVE_WORKSPACE_ID]);

  useEffect(() => {
    fetchLinkedRepo(selectedWorkspaceId ?? "");
  }, [refreshKey, selectedWorkspaceId]);

  useEffect(() => {
    if (settings?.ACTIVE_WORKSPACE_ID) return;
    if (!selectedWorkspaceId || !settings?.LLM_MODEL) return;
    setSelectedWorkspaceId(selectedWorkspaceId);
    saveUserSettings({ ACTIVE_WORKSPACE_ID: selectedWorkspaceId?.toString() });
  }, [settings, selectedWorkspaceId]);

  // Initialize tab workspace from global settings if not set
  useEffect(() => {
    const tabWorkspaceId = sessionStorage.getItem(ACTIVE_WORKSPACE_ID_SESSION_STORAGEKEY);
    if (!tabWorkspaceId && settings?.ACTIVE_WORKSPACE_ID) {
      sessionStorage.setItem(ACTIVE_WORKSPACE_ID_SESSION_STORAGEKEY, settings.ACTIVE_WORKSPACE_ID);
      setSelectedWorkspaceId(settings.ACTIVE_WORKSPACE_ID);
    }
  }, [settings?.ACTIVE_WORKSPACE_ID]);

  return (
    <WorkspaceContext.Provider
      value={{
        selectedWorkspace,
        setSelectedWorkspace,
        selectedWorkspaceId,
        setSelectedWorkspaceId: setTabWorkspaceId,
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
