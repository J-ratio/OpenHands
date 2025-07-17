import React, { useEffect, useState } from "react";
import {
  getAllDataSourcesByWorkspaceId,
  deleteADataSource,
} from "../../../api/data-sources";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { toast } from "sonner";
import { formatDateTime } from "../../../utils/datetime-utils";
import { ConfirmationModal } from "../../shared/modals/confirmation-modal";

function FileManagerPage({ workspaceId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState("");

  async function fetchData() {
    setLoading(true);
    const res = await getAllDataSourcesByWorkspaceId(workspaceId);
    if (res.success) {
      setData(res.data);
      setError(null);
    } else {
      setError(res.errorMessage);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  const handleDelete = async (id) => {
    const { success, errorMessage } = await deleteADataSource(id);
    if (success) {
      toast.success("File deleted successfully");
      fetchData();
    } else {
      toast.error(errorMessage || "Failed to delete file");
    }
  };

  const handleDeleteClick = (id, name) => {
    setConfirmDeleteId(id);
    setConfirmDeleteName(name);
  };

  const handleConfirmDelete = async () => {
    if (confirmDeleteId) {
      await handleDelete(confirmDeleteId);
      setConfirmDeleteId(null);
      setConfirmDeleteName("");
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
    setConfirmDeleteName("");
  };

  const filteredData = data.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-4 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-800 dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full py-12">
      <div className="container mx-auto space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neutral-100">
              File Manager
            </h1>
            <Input
              placeholder="Search files by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm bg-neutral-900 text-neutral-100 border border-neutral-700 placeholder:text-neutral-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none rounded-md transition-colors duration-150"
            />
          </div>
          <div className="rounded-md border h-[70vh] overflow-y-scroll mt-4">
            <table className="min-w-full divide-y divide-neutral-700">
              <thead className="bg-neutral-900">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Updated At
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-neutral-800 divide-y divide-neutral-700">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-neutral-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-red-400">
                      {error}
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-neutral-400"
                    >
                      No files found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-neutral-100">
                        {item.name}
                      </td>
                      <td className="px-4 py-2 text-neutral-100">
                        {item.type}
                      </td>
                      <td className="px-4 py-2 text-neutral-100">
                        {formatDateTime(item.created_at)}
                      </td>
                      <td className="px-4 py-2 text-neutral-100">
                        {formatDateTime(item.updated_at)}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          {/* Update action can be added here */}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleDeleteClick(item.id, item.name)
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {confirmDeleteId && (
        <ConfirmationModal
          text={`Are you sure you want to delete "${confirmDeleteName}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

export default FileManagerPage;
