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

  const { mutate: saveUserSettings } = useSaveSettings();

  const handleRefreshLinkedRepo = () => setRefreshKey((k) => k + 1);

  async function fetchLinkedRepo(workspaceId: string) {
    if (!workspaceId) {
      setLinkedRepo(undefined);
      return;
    }
    const res = await getAllDataSourcesByWorkspaceId(workspaceId);
    if (res.success && Array.isArray(res.data)) {
      const repo = res.data.find(
        (ds: DataSource) => ds.type === "GIT_REPOSITORY",
      );
      setLinkedRepo(repo);
    } else {
      setLinkedRepo(undefined);
    }
  }

  useEffect(() => {
    const activeWorkspaceId = settings?.ACTIVE_WORKSPACE_ID;
    if (activeWorkspaceId) {
      setSelectedWorkspaceId(activeWorkspaceId);
      if (location.pathname === "/") {
        fetchLinkedRepo(activeWorkspaceId);
      }

      setSelectedWorkspaceName(
        getWorkspaceNameFromId(workspaces, Number(activeWorkspaceId)),
      );
    } else {
      setLinkedRepo(undefined);
    }
  }, [settings?.ACTIVE_WORKSPACE_ID]);

  useEffect(() => {
    fetchLinkedRepo(settings?.ACTIVE_WORKSPACE_ID ?? "");
  }, [refreshKey]);

  useEffect(() => {
    if (settings?.ACTIVE_WORKSPACE_ID) return;
    if (!selectedWorkspaceId || !settings?.LLM_MODEL) return;
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
