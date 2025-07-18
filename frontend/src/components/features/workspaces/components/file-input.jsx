import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, CloudUploadIcon } from "lucide-react";
import FileDetails from "../../../shared/file-details";
import {
  createADatasource,
  updateADataSourceWithFile,
} from "../../../../api/data-sources";
import { Button } from "../../../ui/button";
import { Tooltip, TooltipProvider } from "../../../ui/tooltip";

const FileUpload = ({ workspace, canAdd }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    validateFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (!canAdd) {
      toast.error(
        "You have reached the limit of documents that can be added to this workspace.",
      );
      return;
    }
    const selectedFile = event.dataTransfer.files[0];
    validateFile(selectedFile);
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return;

    // Validate file type
    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
      return;
    }

    // Validate file size (40MB max)
    const maxSize = 40 * 1024 * 1024; // 40MB in bytes
    if (selectedFile.size > maxSize) {
      setError("File size exceeds 40MB.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  async function createEmptyDocumentFn() {
    const res = await createADatasource({
      name: file.name,
      type: "FILE",
      workspace_ids: [workspace.id],
    });

    if (res.success && res.data) {
      return {
        success: true,
        data: res.data,
      };
    } else {
      toast.error(res.errorMessage || "Failed to add document");
      return {
        success: false,
        errorMessage: res.errorMessage,
      };
    }
  }

  async function updateDocumentWithFile(docId) {
    const res = await updateADataSourceWithFile({ file, docId });
    if (res.success && res.data) {
      return {
        success: true,
        data: res.data,
      };
    } else {
      toast.error("Failed to update the template with file content");
      return {
        success: false,
        error: res.errorMessage,
      };
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file to upload.");
    }
    const response = await createEmptyDocumentFn();

    if (response.success) {
      const updatedResponse = await updateDocumentWithFile(response.data.id);

      if (updatedResponse.success) {
        toast.success("Document added successfully");
        window.location.reload();
      }
    }
  };

  return (
    <div className="flex w-full  flex-col gap-1 text-center mt-2">
      <div
        className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 p-8 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <CloudUploadIcon />
        <div className="group">
          <label
            htmlFor="fileInput"
            className="cursor-pointer font-medium text-black group-focus-within:underline text-white dark:text-white"
          >
            <input
              id="fileInput"
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={handleFileChange}
              disabled={!canAdd}
            />
            Browse
          </label>
          &nbsp;or drag and drop here
        </div>
        <small className="text-neutral-500">PDF - Max 40MB</small>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {file && <FileDetails file={file} />}

      {canAdd ? (
        <Button type="submit" onClick={handleSubmit} disabled={!file}>
          Add Document
          <ArrowRight size={16} strokeWidth={2} className="ml-2" />
        </Button>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <Button disabled type="submit">
              Add Document
              <ArrowRight size={16} strokeWidth={2} className="ml-2" />
            </Button>
            <span className="text-sm text-muted-foreground">
              You have reached the limit of documents that can be added to this
              workspace.
            </span>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default FileUpload;
