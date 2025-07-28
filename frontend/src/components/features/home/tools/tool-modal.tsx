import React from "react";
import {
  Dialog,
  DialogTitle as RawDialogTitle,
  DialogContent as RawDialogContent,
} from "#/components/ui/dialog";
import styles from "./ToolCard.module.css";
import { BrandButton } from "../../settings/brand-button";
import { VisuallyHidden } from "@heroui/react";
import { SettingsInput } from "../../settings/settings-input";
import { useUserProviders } from "#/hooks/use-user-providers";
import toast from "#/utils/toast";
import { useTranslation } from "react-i18next";
import { useWorkspace } from "#/context/WorkspaceContext";
import { RepositorySelectionForm } from "../repo-selection-form";
import { dataSourceToGitRepository } from "#/utils/utils.ts";

const DialogContent = RawDialogContent as React.FC<
  React.PropsWithChildren<any>
>;

export type ToolModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  image: string;
  description: string;
};

export function ToolModal({
  open,
  onOpenChange,
  title,
  image,
  description,
}: ToolModalProps) {
  const { providers } = useUserProviders();
  const { t } = useTranslation();

  const { linkedRepo } = useWorkspace();
  const [selectedRepoTitle, setSelectedRepoTitle] = React.useState<
    string | null
  >(linkedRepo?.name ?? "");
  const [selectedBranchName, setSelectedBranchName] = React.useState<
    string | null
  >(null);
  const [className, setClassName] = React.useState<string>("");

  const DialogTitle = RawDialogTitle as React.FC<{ children: React.ReactNode }>;

  const providersAreSet = providers.length > 0;

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
            {!linkedRepo && (
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

            {linkedRepo && (
              <>
                <div className="flex flex-col items-center w-full max-w-md mx-auto mt-4 gap-8">
                  <RepositorySelectionForm
                    onRepoSelection={setSelectedRepoTitle}
                    onBranchSelection={setSelectedBranchName}
                    displayLaunchButton={false}
                    displayLinkUnlinkButton={false}
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
                      (title === "Generate Class Diagram" && !className.trim())
                    }
                    onClick={() => {
                      toast.info(
                        `${selectedRepoTitle}, ${selectedBranchName}, ${className}`,
                      );
                    }}
                  >
                    Create / Generate
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
