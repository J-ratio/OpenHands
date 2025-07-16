"use client";
import { IconFileText, IconTrash } from "@tabler/icons-react";
import { ScrollArea } from "../../../ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../ui/tooltip";
import { Button } from "../../../ui/button";
import { deleteADataSource } from "../../../../api/data-sources";
import { toast } from "sonner";

const AttachedDocuments = ({ workspace, attachedDocs }) => {
  return (
    <div>
      <div className="py-2 flex items-center justify-between">
        <h3 className="text-md">Files</h3>
        {attachedDocs.length > 0 && (
          <p className="text-muted-foreground text-xs">
            {attachedDocs?.length} File
            {attachedDocs?.length > 1 && "s"}
          </p>
        )}
      </div>
      <div className="mt-2">
        <Documents attachedDocs={attachedDocs} />
      </div>
    </div>
  );
};

export default AttachedDocuments;

const Documents = ({ attachedDocs }) => {
  const handleDelete = async (doc) => {
    const mainPromise = async () => await deleteADataSource(doc.id);
    const promise = mainPromise();

    toast.promise(promise, {
      loading: "Loading...",
      success: (data) => "Document has been deleted successfully",
      error: "Failed to delete document",
    });

    await promise;

    setTimeout(() => {
      toast.dismiss();
      window.location.reload();
    }, 1000);
  };

  if (!attachedDocs || attachedDocs?.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No files attached to this workspace.
      </p>
    );
  } else
    return (
      <ScrollArea className={"w-full rounded-md h-44"}>
        <div className="grid gap-2">
          {attachedDocs?.map((doc) => (
            <div key={doc.id}>
              <div className="rounded-md border px-4 py-2 font-mono text-xs shadow-sm cursor-pointer flex items-center justify-between">
                <div className="flex flex-col">
                  <IconFileText />
                  {doc.name}
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 bg-destructive hover:bg-destructive/80"
                          onClick={() => handleDelete(doc)}
                        >
                          <IconTrash className="text-destructive-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Remove Document</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
};
