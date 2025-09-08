import { useState, useEffect } from "react";
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
import { getAllDataSourcesByWorkspaceId } from "../../../../api/data-sources";
import { HorizontalDotsLoader } from "../../../shared/horizontal-dots-loader";

import { getTabs } from "../../../../utils/basic-utils";

const ViewWorkspaceButton = ({
  workspace,
  truncatedDescription,
  showAddSource,
  setShowAddSource,
}) => {
  const [tabs, setTabs] = useState([]);
  const [open, setOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [selectedTab, setSelectedTab] = useState("DATA_SOURCES");

  const [repositories, setRepositories] = useState();
  const [files, setFiles] = useState();

  const fetchDataSource = async () => {
    setIsLoading(true);
    const { success, data } = await getAllDataSourcesByWorkspaceId(
      workspace.id,
    );

    if (success) {
      const repositories = data?.filter(
        (source) => source.type === "GIT_REPOSITORY",
      );
      const files = data?.filter((source) => source.type === "FILE");

      setRepositories(repositories);
      setFiles(files);
      setTabs(getTabs(repositories.length));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchDataSource();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          View Workspace
        </Button>
      </DialogTrigger>
      {isLoading ? (
        <HorizontalDotsLoader />
      ) : (
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
      )}
    </Dialog>
  );
};

export default ViewWorkspaceButton;
