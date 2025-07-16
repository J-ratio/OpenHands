"use client";
import { useState } from "react";
import { Button } from "../../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "../../../ui/dialog";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import { Separator } from "../../../ui/separator";
import { createWorkspace } from "../../../../api/workspaces";
import { toast } from "sonner";

const CreateWorkspaceButton = ({ onCreateSuccess }) => {
  const initialData = {
    name: "",
    description: "",
  };
  const [data, setData] = useState(initialData);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.name) {
      toast.error("Workspace Name is required");
    } else {
      const response = await createWorkspace(data.name, data.description);
      if (response.success) {
        toast.success("Workspace created.");
        if (onCreateSuccess) onCreateSuccess();
        setData(initialData);
        setOpen(false);
      } else {
        toast.error(response.errorMessage);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create a Workspace</Button>
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Create a Workspace</DialogTitle>
        </DialogHeader>
        <Separator />

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              label="Name"
              type="text"
              value={data.name}
              onChange={(val) => setData({ ...data, name: val })}
              placeholder="Enter workspace name..."
              className="mt-1 w-full"
              required
              max={100}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={data.description}
              onChange={(e) =>
                setData({ ...data, description: e.target.value })
              }
              placeholder="(Optional) Add a description..."
              className="mt-1 bg-tertiary border border-[#717888] w-full rounded-sm p-2 placeholder:italic placeholder:text-tertiary-alt disabled:bg-[#2D2F36] disabled:border-[#2D2F36] disabled:cursor-not-allowed text-content min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="cancel">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" onClick={handleSubmit}>
              Submit
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspaceButton;
