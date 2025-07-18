"use client";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import { useState } from "react";
import FileUpload from "./FileUpload";
import { cn } from "../../../../utils/utils";
import FileDetails from "../../../../components/shared/file-details";
import { toast } from "sonner";
import {
  createTemplate,
  updateATemplateWithFile,
} from "../../../../api/templates";
import { NEW_TEMPLATE_DATA } from "../../../../constants/data/data";
import { useNavigate } from "react-router";

const CreateTemplateUsingFile = () => {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  async function createTemplateFn() {
    const res = await createTemplate(
      NEW_TEMPLATE_DATA.title,
      NEW_TEMPLATE_DATA.description,
      NEW_TEMPLATE_DATA.content,
    );

    if (res.success && res.data) {
      return {
        success: true,
        data: res.data,
      };
    } else {
      toast.error("Failed to create a template");
      return {
        success: false,
        error: res.errorMessage,
      };
    }
  }

  async function updateTemplateWithFileContentFn(templateId) {
    const res = await updateATemplateWithFile({ file, templateId });
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

  async function handleSubmit() {
    const response = await createTemplateFn();

    if (response.success) {
      const updateResponse = await updateTemplateWithFileContentFn(
        response?.data?.id,
      );
      if (updateResponse.success) {
        toast.success("Template created successfully");
        // router.refresh();
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Upload a Doc to Create a Template</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription>
            Drag and drop your files here or click to browse.
          </DialogDescription>
        </DialogHeader>

        <FileUpload setFile={setFile} />

        {file && <FileDetails file={file} />}

        <Button
          disabled={!file}
          onClick={handleSubmit}
          className={cn(!file && "disabled")}
        >
          Create Template
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTemplateUsingFile;
