"use client";
import Preview from "./Preview";
import { useEffect, useState } from "react";
import { getASingleDocument } from "../../../../../api/documents";
import { getAllDataSourcesByWorkspaceId } from "../../../../../api/data-sources";
import Content from "./Content";
import { useParams } from "react-router";

const DocumentEditor = () => {
  const { documentId } = useParams();
  const [data, setData] = useState({
    workspaceId: "",
    templateId: "",
    dataSources: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState(null);

  const fetchData = async () => {
    if (documentId) {
      setLoading(true);
      const { success, data, errorMessage } =
        await getASingleDocument(documentId);
      if (!success) setError(errorMessage || "An error occurred");
      else {
        setData({
          workspaceId: data.workspace_id,
          templateId: data.template_id,
        });
        const {
          success: dataSourcesSuccess,
          data: fetchedDataSources,
          errorMessage: dataSourcesError,
        } = await getAllDataSourcesByWorkspaceId(data.workspace_id);
        if (!dataSourcesSuccess) {
          setError(dataSourcesError || "Failed to fetch data sources");
        } else {
          setData((prevData) => ({
            ...prevData,
            dataSources: fetchedDataSources,
          }));
        }
      }
      setLoading(false);
    } else {
      setError("Document ID not found");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="w-full">Loading...</div>;
  if (error) return <div className="w-full">{error}</div>;

  return (
    <div className="h-full flex-1 flex-col space-y-8 flex">
      <div className="grid grid-cols-6 gap-4">
        <div className="col-span-5 h-full">
          <Content
            workspacId={data.workspaceId}
            docId={documentId}
            templateId={data.templateId}
            onEditorReady={setEditor}
          />
        </div>
        {/* <Preview editor={editor} dataSources={data.dataSources} /> */}
      </div>
    </div>
  );
};

export default DocumentEditor;
