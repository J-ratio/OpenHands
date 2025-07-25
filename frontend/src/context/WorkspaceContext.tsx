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

interface WorkspaceContextType {
  selectedWorkspace: any;
  setSelectedWorkspace: (workspace: any) => void;
  selectedWorkspaceId: string | undefined;
  setSelectedWorkspaceId: (id: string | undefined) => void;
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
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [linkedRepo, setLinkedRepo] = useState<DataSource | undefined>(
    undefined,
  );
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const { mutate: saveUserSettings } = useSaveSettings();

  const handleRefreshLinkedRepo = () => setRefreshKey((k) => k + 1);

  async function fetchLinkedRepo(workspaceId?: string) {
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
    if (settings?.ACTIVE_WORKSPACE_ID) {
      setSelectedWorkspaceId(settings.ACTIVE_WORKSPACE_ID);
      fetchLinkedRepo(settings.ACTIVE_WORKSPACE_ID);
    } else {
      setLinkedRepo(undefined);
    }
  }, [settings?.ACTIVE_WORKSPACE_ID]);

  useEffect(() => {
    fetchLinkedRepo();
  }, [refreshKey]);

  useEffect(() => {
    if (!selectedWorkspaceId || !settings?.LLM_MODEL) return;
    saveUserSettings({ ACTIVE_WORKSPACE_ID: selectedWorkspaceId?.toString() });
  }, [selectedWorkspaceId]);

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
