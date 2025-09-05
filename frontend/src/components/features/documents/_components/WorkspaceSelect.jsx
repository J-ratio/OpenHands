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

export const WorkspaceSelect = ({
  workspaces,
  setWorkspaces,
  selectedWorkspace,
  setSelectedWorkspace,
  setSelectedWorkspaceName,
  fullWidth = false,
  label = "Select a Workspace",
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: settings, isLoading: isSettingsLoading } = useSettings();

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
    if (!selectedWorkspace && workspaces) {
      const activeWorkspaceId = settings?.ACTIVE_WORKSPACE_ID;
      setSelectedWorkspace(activeWorkspaceId);
    }
  }, [settings]);

  if (loading) return <div className="text-neutral-400"></div>;
  if (error) {
    return <div className="text-lg text-red-400">{error}</div>;
  }

  return (
    <Select
      defaultValue={selectedWorkspace}
      value={selectedWorkspace}
      onValueChange={(value) => {
        setSelectedWorkspace(value.toString());
        if (setSelectedWorkspaceName) {
          setSelectedWorkspaceName(
            getWorkspaceNameFromId(workspaces || data, value),
          );
        }
      }}
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
            <SelectValue placeholder={label} className="text-neutral-500" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 text-neutral-100 border border-neutral-700 rounded-md shadow-lg">
            <SelectGroup>
              {(workspaces || data).map((workspace) => (
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
