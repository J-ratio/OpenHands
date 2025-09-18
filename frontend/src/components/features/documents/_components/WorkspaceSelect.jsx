"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { getAllWorkspaces } from "../../../../api/workspaces";
import { useEffect, useState } from "react";
import CreateWorkspaceButton from "../../../features/workspaces/components/create-workspace-button";
import { getWorkspaceNameFromId } from "../../../../utils/workspace-utils";
import { getColorFromName } from "../../../../utils/basic-utils";
import { useSettings } from "../../../../hooks/query/use-settings";
import { HorizontalDotsLoader } from "../../../shared/horizontal-dots-loader";
import { useSaveSettings } from "../../../../hooks/mutation/use-save-settings";
import ViewWorkspaceButton from "../../workspaces/components/view-workspace-button";
import { useWorkspace } from "../../../../context/WorkspaceContext";

export const WorkspaceSelect = ({
  workspaces,
  setWorkspaces,
  selectedWorkspace,
  setSelectedWorkspace,
  setSelectedWorkspaceName,
  fullWidth = false,
  label = "Select a Workspace",
}) => {
  const [showAddSource, setShowAddSource] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [isViewWorkspaceDialogOpen, setIsViewWorkspaceDialogOpen] =
    useState(false);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: settings, isLoading: isSettingsLoading } = useSettings();
  const { mutate: saveUserSettings, isPending: isSavingSettings } = useSaveSettings();
  const { isFetchingLinkedRepo } = useWorkspace();

  async function getData() {
    setLoading(true);
    const response = await getAllWorkspaces();
    if (response.success) {
      setData(response.data);
      if (workspaces) workspaces = response.data;
      if (setWorkspaces) setWorkspaces(response.data);
      // if (!selectedWorkspace && workspaces) {
      //   setSelectedWorkspace(workspaces[0].id.toString());
      //   if (setSelectedWorkspace) {
      //     setSelectedWorkspaceName(workspaces[0].name);
      //   }
      // }
    } else {
      setError(response.errorMessage);
    }
    setLoading(false);
  }

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (!selectedWorkspace && workspaces.length > 0) {
      const activeWorkspaceId = settings?.ACTIVE_WORKSPACE_ID;
      if (activeWorkspaceId) {
        setSelectedWorkspace(activeWorkspaceId);
      } else {
        saveUserSettings({
          ACTIVE_WORKSPACE_ID: workspaces[0].id.toString(),
        });
      }
    }
  }, [settings]);

  if (loading) return <div className="text-neutral-400"></div>;
  if (error) {
    return <div className="text-lg text-red-400">{error}</div>;
  }

  return (
    <Select
      open={selectOpen}
      onOpenChange={(open) => {
        if (isViewWorkspaceDialogOpen || isFetchingLinkedRepo || isSavingSettings) return;
        setSelectOpen(open);
      }}
      defaultValue={selectedWorkspace}
      value={selectedWorkspace}
      onValueChange={(value) => {
        setSelectedWorkspace(value.toString());
        saveUserSettings({
          ACTIVE_WORKSPACE_ID: value.toString(),
        });
        if (setSelectedWorkspaceName) {
          setSelectedWorkspaceName(
            getWorkspaceNameFromId(workspaces || data, value),
          );
        }
      }}
      disabled={isFetchingLinkedRepo || isSavingSettings}
      className="bg-neutral-900 text-neutral-100 rounded-md border border-neutral-700"
    >
      {isSettingsLoading ? (
        <HorizontalDotsLoader />
      ) : (
        <>
          <SelectTrigger
            className={
              (fullWidth ? "w-full" : "w-[250px]") +
              " text-lg font-semibold bg-neutral-900 text-neutral-100 border border-neutral-700 placeholder:text-neutral-500 focus:ring-0 outline-none rounded-md transition-colors duration-150"
            }
          >
            {isFetchingLinkedRepo || isSavingSettings ? (
              <HorizontalDotsLoader />
            ) : (
              <SelectValue placeholder={label} className="text-neutral-500" />
            )}
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 text-neutral-100 border border-neutral-700 rounded-md shadow-lg">
            <SelectGroup>
              {(workspaces || data).map((workspace) => (
                <div className="flex items-center" key={workspace.id}>
                  <SelectItem
                    value={workspace.id}
                    key={workspace.id}
                    onClick={() => {
                      setSelectedWorkspace(workspace.id.toString());
                      if (setSelectedWorkspaceName) {
                        setSelectedWorkspaceName(workspace.name);
                      }
                    }}
                    className="hover:bg-neutral-800 focus:bg-neutral-800 text-neutral-100 cursor-pointer transition-colors duration-100 rounded flex items-center"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getColorFromName(workspace.name),
                        }}
                      ></div>
                      <span>
                        {workspace.name.length < 30
                          ? workspace.name
                          : `${workspace.name.substring(0, 30)}...`}
                      </span>
                    </div>
                  </SelectItem>
                  <ViewWorkspaceButton
                    workspace={workspace}
                    useViewWorkspaceIcon={true}
                    showAddSource={showAddSource}
                    setShowAddSource={setShowAddSource}
                    onDialogOpenChange={(isOpen) =>
                      setIsViewWorkspaceDialogOpen(isOpen)
                    }
                  />
                  <div className="mr-2"></div>
                </div>
              ))}
              <div className="my-2 text-center">
                <CreateWorkspaceButton onCreateSuccess={getData} />
              </div>
            </SelectGroup>
          </SelectContent>
        </>
      )}
    </Select>
  );
};
