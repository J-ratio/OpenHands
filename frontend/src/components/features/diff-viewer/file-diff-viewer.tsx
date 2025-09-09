import { DiffEditor, Monaco } from "@monaco-editor/react";
import React from "react";
import { editor as editor_t } from "monaco-editor";
import { LuFileDiff, LuFileMinus, LuFilePlus } from "react-icons/lu";
import { IconType } from "react-icons/lib";
import { GitChangeStatus } from "#/api/open-hands.types";
import { getLanguageFromPath } from "#/utils/get-language-from-path";
import { cn } from "#/utils/utils";
import ChevronUp from "#/icons/chveron-up.svg?react";
import { useGitDiff } from "#/hooks/query/use-get-diff";
import { useNavigate } from "react-router";
import { useConversationId } from "#/hooks/use-conversation-id";
import { useSimulationMode } from "#/fake_scripts/simulation_context";

interface LoadingSpinnerProps {
  className?: string;
}

// TODO: Move out of this file and replace the current spinner with this one
function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full border-4 border-gray-200 border-t-blue-500",
          className,
        )}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

const STATUS_MAP: Record<GitChangeStatus, string | IconType> = {
  A: LuFilePlus,
  D: LuFileMinus,
  M: LuFileDiff,
  R: "Renamed",
  U: "Untracked",
};

export interface FileDiffViewerProps {
  path: string;
  type: GitChangeStatus;
}

export function FileDiffViewer({ path, type }: FileDiffViewerProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const [editorHeight, setEditorHeight] = React.useState(400);
  const diffEditorRef = React.useRef<editor_t.IStandaloneDiffEditor>(null);

  const isAdded = type === "A" || type === "U";
  const isDeleted = type === "D";

  const filePath = React.useMemo(() => {
    if (type === "R") {
      const parts = path.split(/\s+/).slice(1);
      return parts[parts.length - 1];
    }

    return path;
  }, [path, type]);

  const {
    data: diff,
    isLoading,
    isSuccess,
    isRefetching,
  } = useGitDiff({
    filePath,
    type,
    enabled: true,
  });

  const { isSimulationMode, toolId } = useSimulationMode();

  // Function to update editor height based on content
  const updateEditorHeight = React.useCallback(() => {
    if (diffEditorRef.current) {
      const originalEditor = diffEditorRef.current.getOriginalEditor();
      const modifiedEditor = diffEditorRef.current.getModifiedEditor();

      if (originalEditor && modifiedEditor) {
        // Get the content height from both editors and use the larger one
        const originalHeight = originalEditor.getContentHeight();
        const modifiedHeight = modifiedEditor.getContentHeight();
        const contentHeight = Math.max(originalHeight, modifiedHeight);

        // Add a small buffer to avoid scrollbar
        setEditorHeight(contentHeight + 20);
      }
    }
  }, []);

  const beforeMount = (monaco: Monaco) => {
    monaco.editor.defineTheme("custom-diff-theme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6a9955" },
        { token: "keyword", foreground: "569cd6" },
        { token: "string", foreground: "ce9178" },
        { token: "number", foreground: "b5cea8" },
      ],
      colors: {
        "diffEditor.insertedTextBackground": "#014b01AA", // Stronger green background
        "diffEditor.removedTextBackground": "#750000AA", // Stronger red background
        "diffEditor.insertedLineBackground": "#003f00AA", // Dark green for added lines
        "diffEditor.removedLineBackground": "#5a0000AA", // Dark red for removed lines
        "diffEditor.border": "#444444", // Border between diff editors

        "editorUnnecessaryCode.border": "#00000000", // No border for unnecessary code
        "editorUnnecessaryCode.opacity": "#00000077", // Slightly faded
      },
    });
  };

  const handleEditorDidMount = (editor: editor_t.IStandaloneDiffEditor) => {
    diffEditorRef.current = editor;
    updateEditorHeight();

    const originalEditor = editor.getOriginalEditor();
    const modifiedEditor = editor.getModifiedEditor();

    originalEditor.onDidContentSizeChange(updateEditorHeight);
    modifiedEditor.onDidContentSizeChange(updateEditorHeight);
  };

  const status = (type === "U" ? STATUS_MAP.A : STATUS_MAP[type]) || "?";

  let statusIcon: React.ReactNode;
  if (typeof status === "string") {
    statusIcon = <span>{status}</span>;
  } else {
    const StatusIcon = status; // now it's recognized as a component
    statusIcon = <StatusIcon className="w-5 h-5" />;
  }

  const isFetchingData = isLoading || isRefetching;

  const isMermaidFile = filePath.endsWith(".mmd");
  const navigate = useNavigate();
  const { conversationId } = useConversationId();

  const handleMermaidVisualizeClick = () => {
    const baseMermaidPath = `/conversations/${conversationId}/mermaid`;
    const isAlreadyOnMermaid = location.pathname === baseMermaidPath;

    navigate(baseMermaidPath, {
      replace: isAlreadyOnMermaid,
      state: {
        mermaidCode: String(diff?.modified),
      },
    });
  };

  const originalCode = `
  static int imx219_power_on(struct device *dev)
{
	struct v4l2_subdev *sd = dev_get_drvdata(dev);
	struct imx219 *imx219 = to_imx219(sd);
	int ret;

	ret = regulator_bulk_enable(IMX219_NUM_SUPPLIES,
				    imx219->supplies);
	if (ret) {
		dev_err(dev, "%s: failed to enable regulators\n",
			__func__);
		return ret;
	}

	ret = clk_prepare_enable(imx219->xclk);
	if (ret) {
		dev_err(dev, "%s: failed to enable clock\n",
			__func__);
		goto reg_off;
	}

	gpiod_set_value_cansleep(imx219->reset_gpio, 1);
	usleep_range(IMX219_XCLR_MIN_DELAY_US,
		     IMX219_XCLR_MIN_DELAY_US + IMX219_XCLR_DELAY_RANGE_US);

	return 0;
  `;

  const modifiedCode = `
  static int imx219_power_on(struct device *dev)\n{\n\tstruct v4l2_subdev *sd = dev_get_drvdata(dev);\n\tstruct imx219 *imx219 = to_imx219(sd);\n\tint ret;\n\n\t/* Enable supplies in correct datasheet order: VDDL -> VANA -> VDIG */\n\tret = regulator_enable(imx219->supplies[IMX219_VDDL].consumer);\n\tif (ret)\n\t\tgoto err_vddl;\n\tusleep_range(2000, 2500); /* allow rail to settle */\n\n\tret = regulator_enable(imx219->supplies[IMX219_VANA].consumer);\n\tif (ret)\n\t\tgoto err_vana;\n\tusleep_range(2000, 2500);\n\n\tret = regulator_enable(imx219->supplies[IMX219_VDIG].consumer);\n\tif (ret)\n\t\tgoto err_vdig;\n\tusleep_range(5000, 6000);\n\n\t/* Enable external clock */\n\tret = clk_prepare_enable(imx219->xclk);\n\tif (ret)\n\t\tgoto err_clk;\n\n\t/* Assert reset only after rails + clk stable (t3 ≥ 0.5 µs) */\n\tusleep_range(1000, 1500);\n\tgpiod_set_value_cansleep(imx219->reset_gpio, 1);\n\n\t/* Wait t5 ≥ 6ms before sensor ready */\n\tmsleep(6);\n\n\treturn 0;\n\nerr_clk:\n\tregulator_disable(imx219->supplies[IMX219_VDIG].consumer);\nerr_vdig:\n\tregulator_disable(imx219->supplies[IMX219_VANA].consumer);\nerr_vana:\n\tregulator_disable(imx219->supplies[IMX219_VDDL].consumer);\nerr_vddl:\n\treturn ret;\n}\n\nstatic int imx219_power_off(struct device *dev)\n{\n\tstruct v4l2_subdev *sd = dev_get_drvdata(dev);\n\tstruct imx219 *imx219 = to_imx219(sd);\n\n\t/* Deassert reset first */\n\tgpiod_set_value_cansleep(imx219->reset_gpio, 0);\n\n\t/* Disable supplies in reverse order (VDIG → VANA → VDDL) */\n\tregulator_disable(imx219->supplies[IMX219_VDIG].consumer);\n\tregulator_disable(imx219->supplies[IMX219_VANA].consumer);\n\tregulator_disable(imx219->supplies[IMX219_VDDL].consumer);\n\n\tclk_disable_unprepare(imx219->xclk);\n\n\treturn 0;\n}\n
  `;

  return (
    <div data-testid="file-diff-viewer-outer" className="w-full flex flex-col">
      <div
        className={cn(
          "flex justify-between items-center px-2.5 py-3.5 border border-neutral-600 rounded-xl",
          !isCollapsed && !isLoading && "border-b-0 rounded-b-none",
        )}
      >
        <span className="text-sm w-full text-content flex items-center gap-2">
          {isFetchingData && <LoadingSpinner className="w-5 h-5" />}
          {!isFetchingData && statusIcon}
          <strong className="w-full truncate">{filePath}</strong>
          {isMermaidFile && (
            <button
              className="mr-8 hover:cursor-pointer"
              onClick={() => handleMermaidVisualizeClick()}
            >
              Visualize
            </button>
          )}
          <button
            data-testid="collapse"
            type="button"
            className="hover:cursor-pointer"
            onClick={() => setIsCollapsed((prev) => !prev)}
          >
            <ChevronUp
              className={cn(
                "w-4 h-4 transition-transform mr-2",
                isCollapsed && "transform rotate-180",
              )}
            />
          </button>
        </span>
      </div>
      {isSuccess && !isCollapsed && (
        <div
          className="w-full border border-neutral-600 overflow-hidden"
          style={{ height: `${editorHeight}px` }}
        >
          <DiffEditor
            data-testid="file-diff-viewer"
            className="w-full h-full"
            language={getLanguageFromPath(filePath)}
            original={
              isSimulationMode && toolId === "DEBUG_USING_CRASHLOGS"
                ? originalCode
                : isAdded
                  ? ""
                  : diff.original
            }
            modified={
              isSimulationMode && toolId === "DEBUG_USING_CRASHLOGS"
                ? modifiedCode
                : isDeleted
                  ? ""
                  : diff.modified
            }
            // original={originalCode}
            // modified={modifiedCode}
            theme="custom-diff-theme"
            onMount={handleEditorDidMount}
            beforeMount={beforeMount}
            options={{
              renderValidationDecorations: "off",
              readOnly: true,
              renderSideBySide: !isAdded && !isDeleted,
              scrollBeyondLastLine: false,
              minimap: {
                enabled: false,
              },
              hideUnchangedRegions: {
                enabled: true,
              },
              automaticLayout: true,
              scrollbar: {
                // Make scrollbar less intrusive
                alwaysConsumeMouseWheel: false,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
