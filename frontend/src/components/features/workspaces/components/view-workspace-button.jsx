"use client";
import { useState } from "react";
import { Button } from "../../../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../ui/dialog";
import DocumentationTab from "./tabs/documentation-tab";
import DataSourcesTab from "./tabs/data-sources-tab";
import { getTabs } from "../../../../utils/utils";

const ViewWorkspaceButton = ({
  workspace,
  truncatedDescription,
  repositories,
  files,
  showAddSource,
  setShowAddSource,
}) => {
  const tabs = getTabs(repositories.length);
  const [open, setOpen] = useState(false);

  const [selectedTab, setSelectedTab] = useState("DATA_SOURCES");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          View Workspace
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-4xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="mt-8">
          <div className="flex items-center justify-between">
            <DialogTitle>{workspace.name}</DialogTitle>
            {selectedTab === "DATA_SOURCES" ? (
              <Button onClick={() => setShowAddSource(true)} className="mr-4">
                Add a new datasource
              </Button>
            ) : (
              <Button variant="ghost" className="opacity-0"></Button>
            )}
          </div>
          <DialogDescription>{truncatedDescription}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant={selectedTab === tab ? "default" : "outline"}
              onClick={() => setSelectedTab(tab)}
            >
              {tab === "DATA_SOURCES" ? "Data Sources" : "Documentation"}
            </Button>
          ))}
        </div>
        {selectedTab === "DOCUMENTATION" ? (
          <DocumentationTab
            workspace={workspace}
            repositories={repositories}
            setOpen={setOpen}
          />
        ) : (
          <DataSourcesTab
            workspace={workspace}
            repositories={repositories}
            files={files}
            showAddSource={showAddSource}
          />
        )}
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewWorkspaceButton;
