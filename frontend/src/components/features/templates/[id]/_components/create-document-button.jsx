"use client";
import { Button } from "../../../../ui/button";
import { createDocument } from "../../../../../api/documents";
import { useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../ui/dialog";
import { WorkspaceSelect } from "../../../../features/documents/_components/WorkspaceSelect";

const CreateDocumentButton = ({ templateId }) => {
  const navigate = useNavigate();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = async () => {
    try {
      if (!selectedWorkspaceId) {
        toast.error("Please select a workspace");
        return;
      }

      const { success, data, errorMessage } = await createDocument({
        name: "Untitled Document",
        content: "",
        workspace_id: selectedWorkspaceId,
        template_id: templateId,
      });

      if (success) {
        navigate(`/document/${data.id}`);
      } else {
        console.log(errorMessage);
        toast.error(errorMessage || "Failed to create document");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to create document with this template");
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>Create Document with this Template</Button>
      </DialogTrigger>
      <DialogContent className="px-3 py-5 space-y-0">
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <WorkspaceSelect
              selectedWorkspace={selectedWorkspaceId}
              setSelectedWorkspace={setSelectedWorkspaceId}
              fullWidth
            />
            <p className="text-sm text-muted-foreground">
              Select a workspace to create a new document with this template.
            </p>
          </div>

          <Button onClick={handleSave} disabled={!selectedWorkspaceId}>
            Create Document
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDocumentButton;
