import { Button } from "../../../ui/button";
import { generateRepoDocumentationForAWorkspace } from "../../../../api/workspaces";
import { toast } from "sonner";
import { Link } from "react-router";

const DocumentationButtons = ({
  repoCount,
  workspace,
  versionName,
  setOpen,
}) => {
  const showAutoGenButton = repoCount === 1;
  const showVisitStaticSiteButton = !!workspace?.url;

  if (repoCount > 1) {
    return null;
  }

  const handleAutoGenClick = async () => {
    if (!workspace || !workspace.id) {
      return;
    }

    const { data, success } = await generateRepoDocumentationForAWorkspace(
      workspace.id,
    );
    if (success) {
      toast.success(data.message || "Documentation generation started");
    } else {
      toast.error("Documentation generation failed");
    }
    setOpen(false);
  };

  return (
    <div className="flex flex-col w-full gap-y-2">
      {showAutoGenButton && (
        <Button
          variant="outline"
          className="mx-auto w-[50%]"
          onClick={handleAutoGenClick}
        >
          Auto-Gen Docs for version {versionName}
        </Button>
      )}

      {showVisitStaticSiteButton && (
        <Link
          href={`${import.meta.env.VITE_PUBLIC_STATIC_SITE_BASE_URL || ""}${
            workspace.url
          }`}
          className="mx-auto w-[50%]"
        >
          <Button variant="outline" className="w-full">
            View Static site
          </Button>
        </Link>
      )}
    </div>
  );
};

export default DocumentationButtons;
