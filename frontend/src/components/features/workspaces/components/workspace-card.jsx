"use client";
import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import ViewWorkspaceButton from "./view-workspace-button";
import { Button } from "../../../ui/button";
import { deleteWorkspace } from "../../../../api/workspaces";
import { ConfirmationModal } from "../../../shared/modals/confirmation-modal";
import {
  displayErrorToast,
  displaySuccessToast,
} from "../../../../utils/custom-toast-handlers";
import { getColorFromName } from "../../../../utils/basic-utils";

const WorkspaceCard = ({
  workspace,
  dataSources,
  isDeletable = true,
  onDeleteWorkspace,
}) => {
  const [showAddSource, setShowAddSource] = useState(false);

  const repositories = dataSources?.filter(
    (source) => source.type === "GIT_REPOSITORY",
  );
  const files = dataSources?.filter((source) => source.type === "FILE");

  const truncatedDescription =
    workspace?.description?.length > 100
      ? `${workspace.description.slice(0, 100)}...`
      : workspace?.description || null;

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState(null);

  const handleDelete = async (id) => {
    const { success, errorMessage } = await deleteWorkspace(id);
    if (success) {
      if (onDeleteWorkspace) onDeleteWorkspace();
      displaySuccessToast("Workspace deleted successfully");
    } else {
      displayErrorToast(errorMessage || "Failed to delete a workspace");
    }
  };

  const handleDeleteClick = (id, name) => {
    setConfirmDeleteId(id);
    setConfirmDeleteName(name);
  };

  const handleConfirmDelete = async () => {
    if (confirmDeleteId) {
      await handleDelete(confirmDeleteId);
      setConfirmDeleteId(null);
      setConfirmDeleteName("");
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
    setConfirmDeleteName("");
  };

  return (
    <Card className="flex flex-col justify-between space-y-0 gap-0 h-fit">
      <CardHeader className=" inline-flex">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getColorFromName(workspace.name) }}
          ></div>
          <CardTitle className="font-bold w-fit">{workspace.name}</CardTitle>
        </div>
        <CardDescription className="h-10">
          {truncatedDescription ?? "No description available"}
        </CardDescription>
        <div className="flex items-space-between justify-space-between gap-8">
          <ViewWorkspaceButton
            workspace={workspace}
            truncatedDescription={truncatedDescription}
            repositories={repositories}
            files={files}
            showAddSource={showAddSource}
            setShowAddSource={setShowAddSource}
          />
          {isDeletable && (
            <Button
              variant="outline"
              onClick={() => handleDeleteClick(workspace.id, workspace.name)}
            >
              Delete
            </Button>
          )}
        </div>
      </CardHeader>

      {confirmDeleteId && (
        <ConfirmationModal
          text={`Are you sure you want to delete ${confirmDeleteName}?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </Card>
  );
};

export default WorkspaceCard;
