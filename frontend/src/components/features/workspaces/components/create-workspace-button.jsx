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
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Separator } from "../../../ui/separator";
import { Textarea } from "../../../ui/textarea";
import { createWorkspace } from "../../../../api/workspaces";
import { toast } from "sonner";

const CreateWorkspaceButton = () => {
  const [data, setData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.name) {
      toast.error("Workspace Name is required");
    } else {
      await createWorkspace(data.name, data.description);
      window.location.reload();
    }
  };

  return (
    <Dialog>
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

        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            maxLength={100}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
          />
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
