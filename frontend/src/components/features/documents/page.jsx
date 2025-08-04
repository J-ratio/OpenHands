"use client";
import { useEffect, useState } from "react";
import { columns } from "./_components/data-table/columns";
import { DataTable } from "./_components/data-table/data-table";
import Header from "./_components/Header";
import { getAllDocuments } from "../../../api/documents";
import { useWorkspace } from "../../../context/WorkspaceContext";

const GenerateDocPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { selectedWorkspaceId } = useWorkspace();

  useEffect(() => {
    async function getData() {
      setLoading(true);
      const data = await getAllDocuments(selectedWorkspaceId);
      if (data.success) {
        setData(data.data);
      } else {
        setError(data.errorMessage);
      }
      setLoading(false);
    }

    getData();
  }, [selectedWorkspaceId]);

  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-800 dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full py-12 ">
        <div className="container mx-auto space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-neutral-100">
                List of Documents
              </h1>
              <Header />
            </div>
            <DataTable
              columns={columns}
              data={data}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateDocPage;
