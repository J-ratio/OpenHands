"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../ui/select";
// import { getAllWorkspaces } from "@/lib/api/workspaces";
import { useEffect, useState } from "react";

export const WorkspaceSelect = ({
  selectedWorkspace,
  setSelectedWorkspace,
  fullWidth = false,
  label = "Select a Workspace",
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // async function getData() {
  // 	setLoading(true);
  // 	const data = await getAllWorkspaces();
  // 	if (data.success) {
  // 		setData(data.data);
  // 	} else {
  // 		setError(data.errorMessage);
  // 	}
  // 	setLoading(false);
  // }

  // useEffect(() => {
  // 	getData();
  // }, []);

  if (loading) return <div className="text-gray-500">Loading Workspaces</div>;
  if (error) {
    return <div className="text-lg text-red-500">{error}</div>;
  }

  return (
    <Select
      defaultValue={selectedWorkspace}
      onValueChange={(value) => setSelectedWorkspace(value)}
    >
      <SelectTrigger className={fullWidth ? "w-full" : "w-[200px]"}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {data.map((workspace) => (
            <SelectItem
              value={workspace.id}
              key={workspace.id}
              onClick={() => setSelectedWorkspace(workspace.id)}
            >
              {workspace.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
