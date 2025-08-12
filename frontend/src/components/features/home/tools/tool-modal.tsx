import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle as RawDialogTitle,
  DialogContent as RawDialogContent,
} from "#/components/ui/dialog";
import styles from "./ToolCard.module.css";
import { BrandButton } from "../../settings/brand-button";
import { form, VisuallyHidden } from "@heroui/react";
import { SettingsInput } from "../../settings/settings-input";
import { useUserProviders } from "#/hooks/use-user-providers";
import { useCreateConversation } from "#/hooks/mutation/use-create-conversation";
import { useTranslation } from "react-i18next";
import { useWorkspace } from "#/context/WorkspaceContext";
import { RepositorySelectionForm } from "../repo-selection-form";
import { dataSourceToGitRepository } from "#/utils/utils.ts";
import { SettingsDropdownInput } from "../../settings/settings-dropdown-input";
import { generateRepoDocumentationForAWorkspace } from "#/api/workspaces";
import { toast } from "sonner";
import { getAllDataSourcesByWorkspaceId } from "#/api/data-sources";

const DialogContent = RawDialogContent as React.FC<
  React.PropsWithChildren<any>
>;

export type ToolModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  image: string;
  description: string;
  linkedRepoRequired?: boolean;
};

export function ToolModal({
  open,
  onOpenChange,
  title,
  image,
  description,
  linkedRepoRequired,
}: ToolModalProps) {
  const { linkedRepo } = useWorkspace();
  const [selectedRepoTitle, setSelectedRepoTitle] = React.useState<
    string | null
  >(linkedRepo?.name ?? "");
  const [selectedBranchName, setSelectedBranchName] = React.useState<
    string | null
  >(null);
  const [className, setClassName] = React.useState<string>("");
  const {
    mutate: createConversation,
    isPending,
    isSuccess,
  } = useCreateConversation();

  const isCreatingConversation = isPending || isSuccess;

  const DialogTitle = RawDialogTitle as React.FC<{ children: React.ReactNode }>;

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

            {title === "Generate Interface Documentation" && (
              <GenerateInterfaceDocForm />
            )}

            {linkedRepoRequired && linkedRepo && (
              <>
                <div className="flex flex-col items-center w-full max-w-md mx-auto mt-4 gap-8">
                  <RepositorySelectionForm
                    onRepoSelection={setSelectedRepoTitle}
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
                  {linkedRepo && title === "Generate Class Diagram" && (
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
                      !selectedRepoTitle ||
                      isCreatingConversation ||
                      (title === "Generate Class Diagram" && !className.trim())
                    }
                    onClick={() => {
                      createConversation({
                        selectedRepository:
                          dataSourceToGitRepository(linkedRepo),
                        selected_branch: selectedBranchName ?? "",
                        q: `/class_diagram CLASS_NAME="${className}" BRANCH_NAME="${selectedBranchName ?? "main"}"`,
                      });
                    }}
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

function GenerateInterfaceDocForm() {
  const { workspaces } = useWorkspace();

  const workspaceItems = workspaces.map((workspace) => ({
    key: workspace.id,
    label: workspace.name,
  }));

  const [selectedWorkspaceKey, setSelectedWorkspaceKey] = useState<
    string | undefined
  >(undefined);
  const [lastProcessedRepoVersion, setLastProcessedRepoVersion] = useState<
    Record<string, any> | undefined
  >(undefined);

  const generateRepoDocumentation = async () => {
    if (!selectedWorkspaceKey) {
      return;
    }

    const { data, success, errorMessage } =
      await generateRepoDocumentationForAWorkspace(selectedWorkspaceKey);
    if (success) {
      toast.success(data.message || "Documentation generation started");
    } else {
      toast.error(errorMessage ?? "Documentation generation failed");
    }
  };

  function getLastProcessedVersion(repo: any) {
    const processedVersions =
      repo?.versions?.filter((v: any) => v.status === "PROCESSED") || [];
    return processedVersions.length ? processedVersions.at(-1) : null;
  }

  const getAllDataSourcesForWorkspace = async () => {
    const { data, success, errorMessage } =
      await getAllDataSourcesByWorkspaceId(selectedWorkspaceKey);
    if (success) {
      const repositories = data?.filter(
        (source: any) => source.type === "GIT_REPOSITORY",
      );
      const lastProcessedVersion = getLastProcessedVersion(repositories?.[0]);
      setLastProcessedRepoVersion(lastProcessedVersion);
    } else {
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    getAllDataSourcesForWorkspace();
  }, [selectedWorkspaceKey]);

  return (
    <div className="w-full flex flex-col items-center">
      <SettingsDropdownInput
        testId="workspace-interface-dropdown"
        name="workspace-interface-dropdown"
        placeholder="Select a workspace"
        items={workspaceItems}
        isDisabled={false}
        wrapperClassName="w-full"
        selectedKey={selectedWorkspaceKey}
        onSelectionChange={(key) => {
          setSelectedWorkspaceKey(key?.toString());
        }}
      />

      {selectedWorkspaceKey &&
        (lastProcessedRepoVersion ? (
          <p className="my-4">
            Last processed Repo Version: ${lastProcessedRepoVersion.name}
          </p>
        ) : (
          <p className="my-4">No repo version found.</p>
        ))}

      <div className="flex justify-center w-full">
        <BrandButton
          testId="tool-generate-button"
          variant="primary"
          type="button"
          className="mt-4 max-w-md w-full text-lg font-bold"
          isDisabled={!selectedWorkspaceKey || !lastProcessedRepoVersion}
          onClick={generateRepoDocumentation}
        >
          {false ? "Generating.." : "Generate"}
        </BrandButton>
      </div>
    </div>
  );
}
