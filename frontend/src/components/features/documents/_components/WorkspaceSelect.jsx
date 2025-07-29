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

  async function getData() {
    setLoading(true);
    const response = await getAllWorkspaces();
    if (response.success) {
      setData(response.data);
      if (workspaces) workspaces = response.data;
      if (setWorkspaces) setWorkspaces(response.data);
      if (!selectedWorkspace && workspaces)
        setSelectedWorkspace(workspaces[0].id);
      setSelectedWorkspaceName(workspaces[0].name);
    } else {
      setError(response.errorMessage);
    }
    setLoading(false);
  }

  useEffect(() => {
    getData();
  }, []);

  if (loading) return <div className="text-neutral-400"></div>;
  if (error) {
    return <div className="text-lg text-red-400">{error}</div>;
  }

  return (
    <Select
      defaultValue={selectedWorkspace}
      value={selectedWorkspace}
      onValueChange={(value) => {
        setSelectedWorkspace(value);
        const selectedWorkspace = (workspaces || data).find(
          (workspace) => workspace.id === value,
        );
        setSelectedWorkspaceName(selectedWorkspace.name);
      }}
      className="bg-neutral-900 text-neutral-100 rounded-md border border-neutral-700"
    >
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
                setSelectedWorkspace(workspace.id);
                setSelectedWorkspaceName(workspace.name);
              }}
              className="hover:bg-neutral-800 focus:bg-neutral-800 text-neutral-100 cursor-pointer transition-colors duration-100 rounded"
            >
              {workspace.name.length < 30
                ? workspace.name
                : `${workspace.name.substring(0, 30)}...`}
            </SelectItem>
          ))}
          <div className="my-2 text-center">
            <CreateWorkspaceButton onCreateSuccess={getData} />
          </div>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
