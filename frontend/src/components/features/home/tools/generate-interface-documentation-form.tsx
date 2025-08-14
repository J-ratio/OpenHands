import { getAllDataSourcesByWorkspaceId } from "#/api/data-sources";
import { generateRepoDocumentationForAWorkspace } from "#/api/workspaces";
import { useWorkspace } from "#/context/WorkspaceContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BrandButton } from "../../settings/brand-button";
import { SettingsDropdownInput } from "../../settings/settings-dropdown-input";
import { useNavigate } from "react-router";

export default function GenerateInterfaceDocForm() {
  const navigate = useNavigate();
  const { workspaces } = useWorkspace();

  const workspaceItems = workspaces.map((workspace) => ({
    key: workspace.id,
    label: workspace.name,
  }));

  const [selectedWorkspaceKey, setSelectedWorkspaceKey] = useState<
    string | undefined
  >(undefined);
  const [lastProcessedRepoVersion, setLastProcessedRepoVersion] = useState<
    Record<string, any> | undefined
  >(undefined);

  const generateRepoDocumentation = async () => {
    if (!selectedWorkspaceKey) {
      return;
    }

    const { data, success, errorMessage } =
      await generateRepoDocumentationForAWorkspace(selectedWorkspaceKey);
    if (success) {
      toast.success(data.message || "Documentation generation started");
      setTimeout(() => navigate("/documents"), 100);
    } else {
      toast.error(errorMessage ?? "Documentation generation failed");
    }
  };

  function getLastProcessedVersion(repo: any) {
    const processedVersions =
      repo?.versions?.filter((v: any) => v.status === "PROCESSED") || [];
    return processedVersions.length ? processedVersions.at(-1) : null;
  }

  const getAllDataSourcesForWorkspace = async () => {
    const { data, success, errorMessage } =
      await getAllDataSourcesByWorkspaceId(selectedWorkspaceKey);
    if (success) {
      const repositories = data?.filter(
        (source: any) => source.type === "GIT_REPOSITORY",
      );
      const lastProcessedVersion = getLastProcessedVersion(repositories?.[0]);
      setLastProcessedRepoVersion(lastProcessedVersion);
    } else {
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    getAllDataSourcesForWorkspace();
  }, [selectedWorkspaceKey]);

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <SettingsDropdownInput
        testId="workspace-interface-dropdown"
        name="workspace-interface-dropdown"
        placeholder="Select a workspace"
        items={workspaceItems}
        isDisabled={false}
        wrapperClassName="w-full"
        selectedKey={selectedWorkspaceKey}
        onSelectionChange={(key) => {
          setSelectedWorkspaceKey(key?.toString());
        }}
      />

      {selectedWorkspaceKey &&
        (lastProcessedRepoVersion ? (
          <p className="my-4">
            Last processed Repo Version: ${lastProcessedRepoVersion.name}
          </p>
        ) : (
          <p className="my-4">No repo version found.</p>
        ))}

      <div className="flex flex-col items-center w-full">
        <BrandButton
          testId="tool-interface-diagram-generate-button"
          variant="primary"
          type="button"
          className="mt-4 max-w-md w-full text-lg font-bold"
          isDisabled={!selectedWorkspaceKey || !lastProcessedRepoVersion}
          onClick={generateRepoDocumentation}
        >
          Generate
        </BrandButton>
      </div>
    </div>
  );
}
