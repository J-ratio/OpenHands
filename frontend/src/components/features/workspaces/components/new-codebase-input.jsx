"use client";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Switch } from "../../../ui/switch";
import { Tooltip, TooltipProvider } from "../../../ui/tooltip";
import { createADatasource } from "../../../../api/data-sources";
import { checkGithubRepositoryURl } from "../../../../utils/utils";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const NewCodebaseInput = ({ isAdding, workspace, canAdd }) => {
  const [newCodebaseUrl, setNewCodebaseUrl] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // PAT-Token for private repositories
  const [isPrivate, setIsPrivate] = useState(false);
  const [patToken, setPatToken] = useState("");

  async function handleSubmit() {
    if (isLoading) return;

    if (!newCodebaseUrl) {
      setError("Please enter a Github repository URL");
      return;
    }

    if (isPrivate && !patToken) {
      setError("PAT token is required for private repositories");
      return;
    }

    let isValidURL = checkGithubRepositoryURl(newCodebaseUrl);
    if (!isValidURL) {
      setError("Invalid Github repository URL.");
      toast.error("Enter repository URL in this format", {
        description: "https://github.com/username/repoName",
      });
      return;
    }

    setIsLoading(true);

    toast.info("Your codebase is being processed", {
      description: "Please wait while we process your request.",
    });

    const { success, data, errorMessage } = await createADatasource({
      name: null,
      type: "GIT_REPOSITORY",
      url: newCodebaseUrl,
      workspace_ids: [workspace.id],
      PAT_TOKEN: isPrivate ? patToken : "",
    });

    if (!success) {
      toast.error(errorMessage || "Failed to add codebase");
    } else {
      toast.success("Codebase added successfully");
      window.location.reload();
    }
    setIsLoading(false);
  }

  useEffect(() => {
    setError(null);
    setPatToken("");
    setIsPrivate(false);
  }, [isAdding]);

  return (
    <div className="space-y-2 mt-2">
      <div className="space-y-3">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Enter the URL of the Github repository you want to add as a
            codebase.
          </p>
          <Input
            value={newCodebaseUrl}
            onChange={(e) => setNewCodebaseUrl(e.target.value)}
            placeholder="Enter Github repository URL"
            disabled={!canAdd}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="private-repo"
            checked={isPrivate}
            onCheckedChange={setIsPrivate}
            disabled={!canAdd}
            className="bg-basic"
          />
          <label
            htmlFor="private-repo"
            className="text-sm text-muted-foreground"
          >
            Private Repository
          </label>
        </div>

        {isPrivate && (
          <Input
            value={patToken}
            onChange={(e) => setPatToken(e.target.value)}
            type="password"
            placeholder="Enter GitHub Personal Access Token"
            disabled={!canAdd}
          />
        )}

        {canAdd ? (
          <Button
            className="w-full "
            type="submit"
            onClick={handleSubmit}
            disabled={
              isLoading || !newCodebaseUrl.trim() || (isPrivate && !patToken)
            }
          >
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                Add Repository
                <ArrowRight size={16} strokeWidth={2} className="ml-2" />
              </>
            )}
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <Button className="w-full " disabled type="submit">
                Add Repository
                <ArrowRight size={16} strokeWidth={2} className="ml-2" />
              </Button>
              <span className="text-sm text-muted-foreground">
                You have reached the limit of repositories that can be added to
                this workspace.
              </span>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default NewCodebaseInput;
