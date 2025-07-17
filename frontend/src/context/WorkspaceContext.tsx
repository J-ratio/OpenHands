import React, { createContext, useContext, useState, ReactNode } from "react";

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
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<
    string | undefined
  >(undefined);
  const [workspaces, setWorkspaces] = useState<any[]>([]);

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
