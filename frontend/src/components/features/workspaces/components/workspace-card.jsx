"use client";
import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import ViewWorkspaceButton from "./view-workspace-button";

const WorkspaceCard = ({ workspace, dataSources }) => {
  const [showAddSource, setShowAddSource] = useState(false);

  const repositories = dataSources?.filter(
    (source) => source.type === "GIT_REPOSITORY",
  );
  const files = dataSources?.filter((source) => source.type === "FILE");

  const truncatedDescription =
    workspace?.description?.length > 100
      ? `${workspace.description.slice(0, 100)}...`
      : workspace?.description || null;

  return (
    <Card className="flex flex-col justify-between space-y-0 gap-0 h-fit">
      <CardHeader className=" inline-flex ">
        <CardTitle className="font-bold w-fit">{workspace.name}</CardTitle>
        <CardDescription className="h-10">
          {truncatedDescription ?? "No description available"}
        </CardDescription>
        <ViewWorkspaceButton
          workspace={workspace}
          truncatedDescription={truncatedDescription}
          repositories={repositories}
          files={files}
          showAddSource={showAddSource}
          setShowAddSource={setShowAddSource}
        />
      </CardHeader>
    </Card>
  );
};

export default WorkspaceCard;
