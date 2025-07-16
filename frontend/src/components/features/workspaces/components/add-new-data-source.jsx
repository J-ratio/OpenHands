"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import FileUpload from "./file-input";
import NewCodebaseInput from "./new-codebase-input";

const AddNewDataSource = ({ workspace, repoCount, fileCount }) => {
  return (
    <div className="min-h-[240px] flex flex-col gap-2">
      <Tabs defaultValue="codebase">
        <TabsList className="flex w-full justify-start">
          <TabsTrigger value="codebase" className="w-[50%]">
            Codebase
          </TabsTrigger>
          <TabsTrigger value="file" className="w-[50%]">
            File
          </TabsTrigger>
        </TabsList>
        <TabsContent value="codebase">
          <NewCodebaseInput
            isAdding={true}
            workspace={workspace}
            canAdd={
              repoCount <
              Number(import.meta.env.VITE_PUBLIC_MAX_REPOSITORY_PER_WORKSPACE)
            }
          />
        </TabsContent>
        <TabsContent value="file">
          <FileUpload
            workspace={workspace}
            canAdd={
              fileCount <
              Number(import.meta.env.VITE_PUBLIC_MAX_FILE_PER_WORKSPACE)
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddNewDataSource;
