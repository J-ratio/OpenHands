import React, { useState } from "react";
import {
  Dialog,
  DialogTitle as RawDialogTitle,
  DialogContent as RawDialogContent,
} from "#/components/ui/dialog";
import styles from "./ToolCard.module.css";
import { BrandButton } from "../../settings/brand-button";
import { VisuallyHidden } from "@heroui/react";
import { SettingsInput } from "../../settings/settings-input";
import { useCreateConversation } from "#/hooks/mutation/use-create-conversation";
import { useWorkspace } from "#/context/WorkspaceContext";
import { RepositorySelectionForm } from "../repo-selection-form";
import { dataSourceToGitRepository } from "#/utils/utils.ts";
import GenerateInterfaceDocForm from "./generate-interface-documentation-form";
import { GitRepository } from "#/types/git";
import FileUpload from "../../templates/_components/FileUpload";
import { useSimulationMode } from "#/fake_scripts/simulation_context";
import { useSettings } from "#/hooks/query/use-settings";

const DialogContent = RawDialogContent as React.FC<
  React.PropsWithChildren<any>
>;

export type ToolModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: string;
  title: string;
  image: string;
  description: string;
  linkedRepoRequired?: boolean;
};

export function ToolModal({
  open,
  onOpenChange,
  id,
  title,
  image,
  description,
  linkedRepoRequired,
}: ToolModalProps) {
  const { linkedRepo } = useWorkspace();
  const [selectedRepo, setSelectedRepo] = React.useState<GitRepository | null>(
    linkedRepo ? dataSourceToGitRepository(linkedRepo) : null,
  );
  const [selectedBranchName, setSelectedBranchName] = React.useState<
    string | null
  >(null);
  const [className, setClassName] = React.useState<string>("");
  const {
    mutate: createConversation,
    isPending,
    isSuccess,
  } = useCreateConversation();
  const { setToolId } = useSimulationMode();
  const [crashLogFile, setCrashLogFile] = React.useState();

  const isCreatingConversation = isPending || isSuccess;

  const { isFetching: isFetchingSettings } = useSettings();
  const { isFetchingLinkedRepo } = useWorkspace();

  const DialogTitle = RawDialogTitle as React.FC<{ children: React.ReactNode }>;

  function handleCreateOrGenerate(id: string) {
    setToolId(id);
    switch (id) {
      case "GENERATE_CLASS_DIAGRAM":
        if (linkedRepo) {
          createConversation({
            // selectedRepository: dataSourceToGitRepository(linkedRepo),
            // selected_branch: selectedBranchName ?? "main",
            // q: `/class_diagram CLASS_NAME="${className}" BRANCH_NAME="${selectedBranchName ?? "main"}"`,
            repository: {
              gitProvider: dataSourceToGitRepository(linkedRepo).git_provider,
              name: linkedRepo.name ?? "",
              branch: selectedBranchName ?? "main",
            },
            query: `/class_diagram CLASS_NAME="${className}" BRANCH_NAME="${selectedBranchName ?? "main"}"`,
          });
        }
        break;

      case "GENERATE_ARCHITECTURE_DIAGRAM":
        if (linkedRepo) {
          createConversation({
            // selectedRepository: dataSourceToGitRepository(linkedRepo),
            // selected_branch: selectedBranchName ?? "main",
            // q: `/architecture_diagram BRANCH_NAME="${selectedBranchName ?? "main"}"`,
            repository: {
              gitProvider: dataSourceToGitRepository(linkedRepo).git_provider,
              name: linkedRepo.name ?? "",
              branch: selectedBranchName ?? "main",
            },
            query: `/architecture_diagram BRANCH_NAME="${selectedBranchName ?? "main"}"`,
          });
        }
        break;

      case "FIND_BUGS_ANOMALIES":
        createConversation({
          simulationMode: true,
        });
        break;

      case "DEBUG_USING_CRASHLOGS":
        createConversation({
          simulationMode: true,
        });
        break;

      default:
        break;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-3xl w-full rounded-2xl bg-[#181b20] border-0 shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col items-center p-8 gap-4 w-full max-w-2xl mx-auto">
          <div className="flex flex-col items-center w-full">
            <img
              src={image}
              alt={title}
              className={styles.image}
              style={{ width: 80, height: 80, marginBottom: 16 }}
            />
            <h2
              className={styles.title}
              style={{ fontSize: "1.5rem", marginBottom: 8 }}
            >
              {title}
            </h2>
            <p
              className={styles.description}
              style={{ fontSize: "1.05rem", marginBottom: 16 }}
            >
              {description}
            </p>
          </div>
          <div className="w-full flex flex-col items-center gap-4 mt-2">
            {/* Repo/Branch selection */}
            {linkedRepoRequired && !linkedRepo && (
              <p className="font-semibold">
                Please, Link a repository to a workspace to continue using this
                tool.
              </p>
            )}
            {linkedRepo && (
              <p className="flex items-center">
                This workspace is connected to the repo:
                <a
                  href={linkedRepo?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors ml-1"
                >
                  {linkedRepo?.name}
                </a>
              </p>
            )}
            {/* {linkedRepo && providersAreSet && (
              <div className="flex flex-col items-center w-full max-w-md mx-auto">
                <RepoConnector
                  onRepoSelection={(title) => setSelectedRepoTitle(title)}
                  onBranchSelection={(branchName) =>
                    setSelectedBranchName(branchName)
                  }
                  displayLaunchButton={false}
                  message={t("TODO$CONNECT_PROVIDER_MESSAGE")}
                />
              </div>
            )} */}

            {id === "GENERATE_INTERFACE_DOCUMENTATION" && (
              <GenerateInterfaceDocForm />
            )}

            {id === "FIND_BUGS_ANOMALIES" && (
              <BrandButton
                testId="tool-find-bugs-button"
                variant="primary"
                type="button"
                className="mt-4 max-w-md w-full text-lg font-bold"
                onClick={() => handleCreateOrGenerate("FIND_BUGS_ANOMALIES")}
                isDisabled={isCreatingConversation || isFetchingSettings || isFetchingLinkedRepo}
              >
                Find Bugs
              </BrandButton>
            )}

            {id === "DEBUG_USING_CRASHLOGS" && (
              <div className="w-full text-center">
                <p className="text-start text-sm mt-4">Upload Log File Here</p>
                <FileUpload
                  file={crashLogFile}
                  setFile={setCrashLogFile}
                  fileInfo="Upload .txt or .log file"
                  allowedExtensions={["log", "txt"]}
                />
                <BrandButton
                  testId="tool-debug-crash-logs"
                  variant="primary"
                  type="button"
                  className="mt-4 max-w-md w-full text-lg font-bold"
                  onClick={() =>
                    handleCreateOrGenerate("DEBUG_USING_CRASHLOGS")
                  }
                  isDisabled={!crashLogFile || isCreatingConversation || isFetchingSettings || isFetchingLinkedRepo}
                >
                  Debug Crash Logs
                </BrandButton>
              </div>
            )}

            {linkedRepoRequired && linkedRepo && (
              <>
                <div className="flex flex-col items-center w-full max-w-md mx-auto mt-4 gap-8">
                  <RepositorySelectionForm
                    onRepoSelection={setSelectedRepo}
                    onBranchSelection={setSelectedBranchName}
                    displayLaunchButton={false}
                    displayLinkUnlinkButton={false}
                    displayRepoSelector={false}
                    linkedRepo={
                      linkedRepo
                        ? dataSourceToGitRepository(linkedRepo)
                        : undefined
                    }
                    onLinkedRepoChanged={() => {}}
                  />
                  {linkedRepo && id === "GENERATE_CLASS_DIAGRAM" && (
                    <SettingsInput
                      label="Class Name"
                      type="text"
                      value={className}
                      onChange={setClassName}
                      placeholder="Enter a class name..."
                      className="w-full"
                    />
                  )}
                </div>
                <div className="flex justify-center w-full">
                  <BrandButton
                    testId="tool-generate-button"
                    variant="primary"
                    type="button"
                    className="mt-4 max-w-md w-full text-lg font-bold"
                    isDisabled={
                      !linkedRepo ||
                      !selectedBranchName ||
                      !selectedRepo ||
                      isCreatingConversation ||
                      (id === "GENERATE_CLASS_DIAGRAM" && !className.trim()) ||
                      isFetchingSettings ||
                      isFetchingLinkedRepo
                    }
                    onClick={() => handleCreateOrGenerate(id)}
                  >
                    {isCreatingConversation
                      ? "Creating.."
                      : "Create / Generate"}
                  </BrandButton>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
