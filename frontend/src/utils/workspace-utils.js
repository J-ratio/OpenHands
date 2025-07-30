export const getWorkspaceNameFromId = (workspaces, workspaceId) => {
  const workspace = workspaces.find(
    (workspace) => workspace.id === workspaceId,
  );
  return workspace ? workspace.name : null;
};
