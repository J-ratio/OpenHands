"use client";
import { Button } from "../../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../ui/dialog";
import { useSelection } from "../../../../hooks/useSelection";
import { useNavigate } from "react-router";
import React, { useEffect, useState } from "react";
import { WorkspaceSelect } from "./WorkspaceSelect";
import { createDocument } from "../../../../api/documents";
import { toast } from "sonner";
import { SettingsInput } from "../../settings/settings-input";
import { BrandButton } from "../../settings/brand-button";
import { createWorkspace } from "../../../../api/workspaces";
import { VisuallyHidden } from "@heroui/react";
import { useWorkspace } from "../../../../context/WorkspaceContext";

const CreateNewDocument = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);

  const {
    handleWorkspaceSelect: setSelectedWorkspaceId,
    handleTemplateSelect: setSelectedTemplateId,
  } = useSelection();

  const { selectedWorkspaceId } = useWorkspace();

  const handleCreateBlankDocument = async () => {
    const { success, data, errorMessage } = await createDocument({
      name: "Untitled Document",
      content: "",
      workspace_id: selectedWorkspaceId,
      template_id: null,
    });
    if (success) {
      navigate(`/document/${data.id}`);
    } else {
      toast.error(
        errorMessage || "An error occured while creating the document",
      );
      console.log(errorMessage);
    }
  };

  const handleWorkspaceCreated = (newWorkspace) => {
    setWorkspaces((prev) => [...prev, newWorkspace]);
    setSelectedWorkspaceId(newWorkspace.id);
    setShowCreateWorkspace(false);
  };

  useEffect(() => {
    if (!isDialogOpen) {
      setSelectedTemplateId(null);
      setSelectedWorkspaceId(undefined);
      setIsOpen(false);
    }
  }, [isDialogOpen]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create New Document</Button>
      </DialogTrigger>
      <DialogContent className="sm:min-w-[650px] max-w-xl w-full px-0 py-0 flex flex-col items-center justify-center bg-[#181b20] rounded-2xl border-1 border-[#0072FF] shadow-2xl">
        <DialogHeader className="w-full flex flex-col items-center justify-center pt-8 pb-3">
          <DialogTitle className="text-center text-2xl font-bold">
            Create New Document
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-5 w-full px-10 pb-10">
          <div className="flex items-center justify-center gap-5 w-full">
            {/* <WorkspaceSelect
              selectedWorkspace={selectedWorkspaceId}
              setSelectedWorkspace={setSelectedWorkspaceId}
              workspaces={workspaces}
              setWorkspaces={setWorkspaces}
            /> */}
            <Button
              variant="outline"
              onClick={handleCreateBlankDocument}
              disabled={!selectedWorkspaceId}
            >
              Create Blank Document
            </Button>
          </div>
          <div className="flex flex-col items-center w-full mt-2 mb-0">
            <div className="flex items-center w-full justify-center gap-2 my-2">
              <div className="h-px flex-1 bg-neutral-700" />
              <span className="text-neutral-400 text-xs font-semibold">OR</span>
              <div className="h-px flex-1 bg-neutral-700" />
            </div>
            <Button
              variant="whiteblack"
              onClick={() => setShowCreateWorkspace(true)}
              className="w-[250px] mx-auto mt-2"
            >
              + Create new workspace
            </Button>
          </div>
        </div>
        <CreateWorkspaceModal
          open={showCreateWorkspace}
          onOpenChange={setShowCreateWorkspace}
          onWorkspaceCreated={handleWorkspaceCreated}
        />
      </DialogContent>
    </Dialog>
  );
};

function CreateWorkspaceModal({ open, onOpenChange, onWorkspaceCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCreateWorkspaceSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!name.trim()) {
      setError("Workspace name is required.");
      return;
    }
    setLoading(true);
    const result = await createWorkspace(name.trim(), description.trim());
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setName("");
      setDescription("");
      if (onWorkspaceCreated) onWorkspaceCreated(result.data);
      onOpenChange(false);
      setSuccess(false);
    } else {
      setError(result.errorMessage || "Failed to create workspace.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md w-full rounded-2xl bg-[#181b20] border-0 shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>Create New Workspace</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col items-center p-8 gap-4 w-full">
          <h2 className="text-xl font-bold mb-2 text-white">
            Create New Workspace
          </h2>
          <form
            onSubmit={handleCreateWorkspaceSubmit}
            className="w-full flex flex-col gap-4"
          >
            <SettingsInput
              label="Workspace Name"
              type="text"
              value={name}
              onChange={setName}
              placeholder="Enter workspace name..."
              className="w-full"
              required
            />
            <SettingsInput
              label="Description"
              type="text"
              value={description}
              onChange={setDescription}
              placeholder="(Optional) Add a description..."
              className="w-full"
            />
            {error && (
              <div className="text-red-400 text-sm font-medium">{error}</div>
            )}
            {success && (
              <div className="text-green-400 text-sm font-medium">
                Workspace created!
              </div>
            )}
            <BrandButton
              type="submit"
              variant="primary"
              className="w-full mt-2 font-bold transition-all duration-150 hover:scale-[1.03] shadow-lg"
              isDisabled={loading || !name.trim()}
            >
              {loading ? "Creating..." : "Create Workspace"}
            </BrandButton>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateNewDocument;
