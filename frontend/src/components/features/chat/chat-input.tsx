import React, { useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { SubmitButton } from "#/components/shared/buttons/submit-button";
import { StopButton } from "#/components/shared/buttons/stop-button";
import { getAllDataSourcesByWorkspaceId } from "#/api/data-sources";
import { useWorkspace } from "#/context/WorkspaceContext";
import FolderIcon from "#/icons/folder.svg?react";
import ChipList from "#/components/shared/chip-list";
import { Folder } from "lucide-react";
import { PiCode } from "react-icons/pi";
interface DataSource {
  name?: string;
  url?: string;
  id?: string;
  type?: string;
  workspace_ids?: number[];
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  versions?: any[];
  [key: string]: any;
}

export interface AttachedFile {
  id: string;
  name: string;
  source: DataSource;
}

export interface AttachedCodeBlock {
  id: string;
  fileName: string;
  selectedCode: string;
  startLine: number;
  endLine: number;
}

interface ChatInputProps {
  name?: string;
  button?: "submit" | "stop";
  disabled?: boolean;
  showButton?: boolean;
  value?: string;
  maxRows?: number;
  onSubmit: (
    message: string,
    attachedFiles: AttachedFile[],
    attachedCodeblocks: AttachedCodeBlock[],
  ) => void;
  onStop?: () => void;
  onChange?: (message: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onFilesPaste?: (files: File[]) => void;
  className?: React.HTMLAttributes<HTMLDivElement>["className"];
  buttonClassName?: React.HTMLAttributes<HTMLButtonElement>["className"];
}

export function ChatInput({
  name,
  button = "submit",
  disabled,
  showButton = true,
  value,
  maxRows = 16,
  onSubmit,
  onStop,
  onChange,
  onFocus,
  onBlur,
  onFilesPaste,
  className,
  buttonClassName,
}: ChatInputProps) {
  const { t } = useTranslation();
  const { selectedWorkspaceId } = useWorkspace();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const [showFileDropdown, setShowFileDropdown] = React.useState(false);
  const [cursorPosition, setCursorPosition] = React.useState(0);
  const [dataSources, setDataSources] = React.useState<DataSource[]>([]);
  const [filteredDataSources, setFilteredDataSources] = React.useState<
    DataSource[]
  >([]);
  const [searchFileText, setSearchFileText] = React.useState("");
  const [isLoadingDataSources, setIsLoadingDataSources] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<AttachedFile[]>([]);
  const [selectedCodeBlocks, setSelectedCodeBlocks] = React.useState<
    AttachedCodeBlock[]
  >([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const generateCodeBlockId = (
    fileName: string,
    startLine: number,
    endLine: number,
  ): string => {
    return `${fileName}(${startLine}-${endLine})`;
  };

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === "h2loop:addToChat") {
        const { fileName, text: selectedText, startLine, endLine } = event.data;

        setSelectedCodeBlocks((prev) => {
          const codeBlockId = generateCodeBlockId(fileName, startLine, endLine);
          const codeBlockAlreadyExists = prev.some(
            (cb) => cb.id === codeBlockId,
          );
          if (codeBlockAlreadyExists) return prev;
          return [
            ...prev,
            {
              id: codeBlockId,
              selectedCode: selectedText,
              fileName,
              startLine,
              endLine,
            },
          ];
        });
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onChange]);

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (onFilesPaste && event.clipboardData.files.length > 0) {
      const files = Array.from(event.clipboardData.files);
      event.preventDefault();
      onFilesPaste(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    if (event.dataTransfer.types.includes("Files")) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
    if (onFilesPaste && event.dataTransfer.files.length > 0) {
      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0) {
        onFilesPaste(files);
      }
    }
  };

  const handleSubmitMessage = () => {
    const message = value || textareaRef.current?.value || "";
    if (message.trim() || selectedFiles.length > 0) {
      // Include file references in the message
      let finalMessage = message;
      if (selectedFiles.length > 0) {
        const fileRefs = selectedFiles.map((f) => `@${f.name}`).join(" ");
        finalMessage =
          selectedFiles.length > 0 && !message.trim()
            ? fileRefs
            : `${fileRefs} ${message}`.trim();
      }

      onSubmit(finalMessage, selectedFiles, selectedCodeBlocks);
      onChange?.("");
      setSelectedFiles([]);
      setSelectedCodeBlocks([]);
      if (textareaRef.current) {
        textareaRef.current.value = "";
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !disabled &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      handleSubmitMessage();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value, selectionStart } = event.target;
    onChange?.(value);
    setCursorPosition(selectionStart);

    const textBeforeCursor = value.substring(0, selectionStart);
    const atSignIndex = textBeforeCursor.lastIndexOf("@");

    if (
      atSignIndex !== -1 &&
      !textBeforeCursor.substring(atSignIndex).includes(" ")
    ) {
      const searchStr = textBeforeCursor.substring(atSignIndex + 1);

      if (searchStr.length === 0) {
        setSearchFileText("");
        fetchDataSources();
      } else {
        setSearchFileText(searchStr);
        if (dataSources.length > 0) {
          filterDataSourcesBySearchText(searchStr);
        }
      }

      setShowFileDropdown(true);
    } else {
      if (showFileDropdown) {
        setShowFileDropdown(false);
      }
    }
  };

  const filterDataSourcesBySearchText = (searchStr: string) => {
    if (!searchStr) {
      setFilteredDataSources(dataSources);
      return;
    }

    const filtered = dataSources.filter((source) => {
      const name = source.name || source.url || "";
      return name.toLowerCase().includes(searchStr.toLowerCase());
    });

    setFilteredDataSources(filtered);
  };

  const fetchDataSources = async () => {
    try {
      setIsLoadingDataSources(true);
      const response =
        await getAllDataSourcesByWorkspaceId(selectedWorkspaceId);

      if (response.success && response.data) {
        const fileDataSources = response.data.filter(
          (source: DataSource) =>
            source.type === "FILE" &&
            source.versions?.some((v) => v.status !== "FAILED"),
        );
        setDataSources(fileDataSources);
        setFilteredDataSources(fileDataSources);
      } else {
        setDataSources([]);
        setFilteredDataSources([]);
      }
    } catch (error) {
      console.error("Error fetching data sources:", error);
      setDataSources([]);
      setFilteredDataSources([]);
    } finally {
      setIsLoadingDataSources(false);
    }
  };

  const handleFileSelect = (file: DataSource) => {
    const fileName = file.name || file.url || "Unnamed file";
    const fileId = file.id || `${fileName}-${Date.now()}`;

    // Check if file is already selected
    if (selectedFiles.some((f) => f.id === fileId)) {
      return;
    }

    // Add to selected files
    const newFile: AttachedFile = {
      id: fileId,
      name: fileName,
      source: file,
    };

    setSelectedFiles((prev) => [...prev, newFile]);
    setShowFileDropdown(false);

    // Clear the @ search from textarea
    if (textareaRef.current && onChange) {
      const currentValue = textareaRef.current.value;
      const textBeforeCursor = currentValue.substring(0, cursorPosition);
      const afterCursor = currentValue.substring(cursorPosition);
      const atSignIndex = textBeforeCursor.lastIndexOf("@");

      if (atSignIndex !== -1) {
        const beforeAt = textBeforeCursor.substring(0, atSignIndex);
        const newValue = beforeAt + afterCursor;
        onChange(newValue);
      }
    }

    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const removeCodeBlock = (codeBlockId: string) => {
    setSelectedCodeBlocks((prev) => prev.filter((cb) => cb.id !== codeBlockId));
  };

  return (
    <div
      data-testid="chat-input"
      className="flex flex-col grow gap-2 min-h-6 w-full relative"
      ref={containerRef}
    >
      {selectedFiles.length > 0 && (
        <ChipList
          items={selectedFiles}
          getKey={(file) => file.id}
          getLabel={(file) => `${file.name}`}
          onRemove={(fileId) => removeFile(fileId)}
          icon={<Folder className="w-3 h-3" />}
        />
      )}
      {selectedCodeBlocks.length > 0 && (
        <ChipList
          items={selectedCodeBlocks}
          getKey={(codeBlock) => codeBlock.id}
          getLabel={(codeBlock) => {
            const shortFileName =
              codeBlock.fileName.length > 20
                ? codeBlock.fileName.substring(0, 20) + "..."
                : codeBlock.fileName;
            return `${shortFileName}(${codeBlock.startLine}-${codeBlock.endLine})`;
          }}
          onRemove={(codeBlockId) => removeCodeBlock(codeBlockId)}
          icon={<PiCode className="w-3 h-3" />}
        />
      )}

      {/* Input area */}
      <div className="flex items-end justify-end grow gap-1 min-h-6 w-full">
        <TextareaAutosize
          ref={textareaRef}
          name={name}
          placeholder={t(I18nKey.SUGGESTIONS$WHAT_TO_BUILD)}
          onKeyDown={handleKeyPress}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          value={value}
          minRows={1}
          maxRows={maxRows}
          data-dragging-over={isDraggingOver}
          className={cn(
            "grow text-sm self-center placeholder:text-neutral-400 text-white resize-none outline-hidden ring-0",
            "transition-all duration-200 ease-in-out",
            isDraggingOver
              ? "bg-neutral-600/50 rounded-lg px-2"
              : "bg-transparent",
            className,
          )}
        />

        {showButton && (
          <div className={buttonClassName}>
            {button === "submit" && (
              <SubmitButton
                isDisabled={disabled}
                onClick={handleSubmitMessage}
              />
            )}
            {button === "stop" && (
              <StopButton isDisabled={disabled} onClick={onStop} />
            )}
          </div>
        )}
      </div>

      {/* File selection dropdown */}
      {showFileDropdown && (
        <div className="absolute bottom-full left-0 right-0 mb-2 min-w-72 max-w-full bg-neutral-800 border border-neutral-600 rounded-md shadow-lg overflow-hidden">
          <div className="text-neutral-200 px-4 py-2 bg-neutral-700 font-semibold flex items-center justify-between">
            <span>Select a file</span>
            {searchFileText && (
              <span className="text-xs text-neutral-400">
                Searching: {searchFileText}
              </span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {isLoadingDataSources ? (
              <div className="text-neutral-200 px-4 py-2">Loading files...</div>
            ) : filteredDataSources.length > 0 ? (
              <div>
                {filteredDataSources.map((item, idx) => {
                  const displayName = item.name || item.url || "Unnamed file";
                  return (
                    <div
                      key={`${displayName}-${idx}`}
                      className="text-neutral-200 hover:bg-neutral-700 hover:text-neutral-100 px-4 py-2 cursor-pointer flex items-center"
                      onClick={() => handleFileSelect(item)}
                    >
                      <FolderIcon className="w-4 h-4 mr-2 text-neutral-400" />
                      <span className="truncate">{displayName}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-neutral-200 px-4 py-2">
                {searchFileText
                  ? `No files matching "${searchFileText}"`
                  : "No files available"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
