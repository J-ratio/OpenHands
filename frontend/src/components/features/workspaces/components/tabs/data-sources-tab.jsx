import React from "react";
import AttachedCodebases from "../attached-codebases";
import AttachedDocuments from "../attached-documents";
import AddNewDataSource from "../add-new-data-source";

const DataSourcesTab = ({ workspace, repositories, files, showAddSource }) => {
  return (
    <div className="min-h-[240px]">
      <div className="grid grid-cols-2 space-x-2 min-h-[210px]">
        <AttachedCodebases
          workspace={workspace}
          attachedCodebases={repositories}
        />
        <AttachedDocuments workspace={workspace} attachedDocs={files} />
      </div>

      {showAddSource && (
        <AddNewDataSource
          workspace={workspace}
          repoCount={repositories.length || 0}
          fileCount={files.length || 0}
        />
      )}
    </div>
  );
};

export default DataSourcesTab;
