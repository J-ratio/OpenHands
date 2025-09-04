import { CloudUploadIcon } from "lucide-react";
import React, { useState } from "react";

const MAX_SIZE = 40 * 1024 * 1024; // 40MB

const FileUpload = ({
  setFile,
  fileInfo = `PDF - Max ${MAX_SIZE / 1024 / 1024} MB`,
  allowedExtensions = ["pdf"],
}) => {
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    validateFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const selectedFile = event.dataTransfer.files[0];
    validateFile(selectedFile);
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    const fileExtension = fileName.split(".").pop();

    if (!allowedExtensions.includes(fileExtension)) {
      setError(`Only ${allowedExtensions.join(",")} files allowed.`);
      setFile(null);
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_SIZE) {
      setError(`File size exceeds ${MAX_SIZE / 1024 / 1024} MB.`);
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="flex w-full max-w-xl flex-col gap-1 text-center mt-2">
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
              accept={allowedExtensions.map((ext) => `.${ext}`).join(",")}
              className="sr-only"
              onChange={handleFileChange}
            />
            Browse
          </label>
          &nbsp;or drag and drop here
        </div>
        <small className="text-neutral-500">{fileInfo}</small>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default FileUpload;
