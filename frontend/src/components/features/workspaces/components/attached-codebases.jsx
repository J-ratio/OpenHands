"use client";
import { ScrollArea } from "../../../ui/scroll-area";
import { IconBrandGithub, IconRefresh, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import NewCodebaseInput from "./new-codebase-input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../ui/tooltip";
import { Button } from "../../../ui/button";
import { deleteADataSource, syncCodebase } from "../../../../api/data-sources";
import { toast } from "sonner";

const AttachedCodebases = ({ workspace, attachedCodebases }) => {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="border-r pr-2">
      <div className="py-2 flex items-center justify-between">
        <h3 className="text-md">Codebases</h3>
        {attachedCodebases.length > 0 && (
          <p className="text-muted-foreground text-xs">
            {attachedCodebases?.length} Codebase
            {attachedCodebases?.length > 1 && "s"}
          </p>
        )}
      </div>
      <div className="mt-2">
        <Codebases attachedCodebases={attachedCodebases} />
      </div>
      {isAdding && <NewCodebaseInput isAdding={isAdding} />}
    </div>
  );
};

export default AttachedCodebases;

const Codebases = ({ attachedCodebases }) => {
  const handleSync = async (codebase) => {
    toast.promise(syncCodebase(codebase.id), {
      loading: "Syncing codebase...",
      success:
        "Codebase synced successfully, starting to build Knowledge Graph",
      error: (err) => {
        return "Failed to sync codebase";
      },
    });
  };

  const handleDelete = async (codebase) => {
    const mainPromise = async () => await deleteADataSource(codebase.id);

    const promise = mainPromise();

    toast.promise(promise, {
      loading: "Loading...",
      success: (data) => "Codebase has been deleted successfully",
      error: "Failed to delete codebase",
    });

    await promise;

    setTimeout(() => {
      toast.dismiss();
      window.location.reload();
    }, 1000);
  };

  if (!attachedCodebases || attachedCodebases?.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No codebases attached to this workspace.
      </p>
    );
  }

  const codebaseGrid = (
    <div className="grid gap-2 overflow-scroll max-h-44">
      {attachedCodebases.map((codebase, _idx) => (
        <div
          className="rounded-md border px-4 py-2 font-mono text-xs shadow-sm cursor-pointer flex items-center justify-between"
          key={_idx}
        >
          <div className="flex flex-col">
            <IconBrandGithub className="mt-1 shrink-0" />
            <span className="break-all whitespace-normal leading-tight">
              {codebase.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => handleSync(codebase)}
                  >
                    <IconRefresh />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Fetch Latest Commit</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 bg-destructive hover:bg-destructive/80"
                    onClick={() => handleDelete(codebase)}
                  >
                    <IconTrash className="text-destructive-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove Codebase</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      ))}
    </div>
  );

  return attachedCodebases.length > 3 ? (
    <ScrollArea className="w-full rounded-md h-44">{codebaseGrid}</ScrollArea>
  ) : (
    codebaseGrid
  );
};
