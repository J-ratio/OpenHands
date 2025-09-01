import { useMemo } from "react";
import DocumentationButtons from "../documentation-buttons";
import { getLastProcessedVersion } from "../../../../../utils/basic-utils";

const DocumentationTab = ({ repositories, workspace, setOpen }) => {
  if (!Array.isArray(repositories) || repositories.length !== 1) {
    return null;
  }

  const lastProcessedVersion = useMemo(
    () => getLastProcessedVersion(repositories[0]),
    [repositories],
  );

  return (
    <div className="min-h-[240px]">
      <p className="font-medium text-left mt-5 mb-10">
        You can use H2Loop.AI to automatically generate developer documentation
        for the codebase linked to this workspace.
      </p>

      {lastProcessedVersion && lastProcessedVersion.name && (
        <DocumentationButtons
          repoCount={repositories.length || 0}
          workspace={workspace}
          versionName={lastProcessedVersion?.name || ""}
          setOpen={setOpen}
        />
      )}
    </div>
  );
};

export default DocumentationTab;
