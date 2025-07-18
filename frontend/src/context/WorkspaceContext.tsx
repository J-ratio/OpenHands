import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useSettings } from "#/hooks/query/use-settings";

interface WorkspaceContextType {
  selectedWorkspaceId: string | undefined;
  setSelectedWorkspaceId: (id: string | undefined) => void;
  workspaces: any[];
  setWorkspaces: (workspaces: any[]) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { data: settings } = useSettings();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<
    string | undefined
  >(settings?.ACTIVE_WORKSPACE_ID || undefined);
  const [workspaces, setWorkspaces] = useState<any[]>([]);

  useEffect(() => {
    if (settings?.ACTIVE_WORKSPACE_ID) {
      setSelectedWorkspaceId(settings.ACTIVE_WORKSPACE_ID);
    }
  }, [settings?.ACTIVE_WORKSPACE_ID]);

  return (
    <WorkspaceContext.Provider
      value={{
        selectedWorkspaceId,
        setSelectedWorkspaceId,
        workspaces,
        setWorkspaces,
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
