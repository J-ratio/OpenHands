import React, { useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { SubmitButton } from "#/components/shared/buttons/submit-button";
import { StopButton } from "#/components/shared/buttons/stop-button";
// We'll create a custom dropdown instead of using the components with TypeScript errors
import { getAllDataSourcesByWorkspaceId } from "#/api/data-sources";
import { useWorkspace } from "#/context/WorkspaceContext";
import FolderIcon from "#/icons/folder.svg?react";

// Define types for data sources
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

interface ChatInputProps {
  name?: string;
  button?: "submit" | "stop";
  disabled?: boolean;
  showButton?: boolean;
  value?: string;
  maxRows?: number;
  onSubmit: (message: string) => void;
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
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Only handle paste if we have an image paste handler and there are files
    if (onFilesPaste && event.clipboardData.files.length > 0) {
      const files = Array.from(event.clipboardData.files);
      // Only prevent default if we found image files to handle
      event.preventDefault();
      onFilesPaste(files);
    }
    // For text paste, let the default behavior handle it
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
    if (message.trim()) {
      onSubmit(message);
      onChange?.("");
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

    // Always check if there's an @ character before the cursor
    const textBeforeCursor = value.substring(0, selectionStart);
    const atSignIndex = textBeforeCursor.lastIndexOf("@");

    // If there's an @ character and no space between @ and cursor
    if (
      atSignIndex !== -1 &&
      !textBeforeCursor.substring(atSignIndex).includes(" ")
    ) {
      // We're in a search context (after @)
      const searchStr = textBeforeCursor.substring(atSignIndex + 1);

      // If we just typed @, reset search
      if (searchStr.length === 0) {
        console.log("@ detected, showing dropdown");
        setSearchFileText("");

        // Only fetch data sources if dropdown is not already showing
        if (!showFileDropdown) {
          fetchDataSources();
        }
      } else {
        // We're typing after @
        console.log("Typing after @:", searchStr);
        setSearchFileText(searchStr);

        // Filter data sources based on search text
        if (dataSources.length > 0) {
          filterDataSourcesBySearchText(searchStr);
        }
      }

      // Ensure dropdown is shown
      setShowFileDropdown(true);
    } else {
      // Close dropdown if we're not in a search context
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
      console.log("Fetching data sources for workspace:", selectedWorkspaceId);
      const response =
        await getAllDataSourcesByWorkspaceId(selectedWorkspaceId);
      console.log("Data sources response:", response);

      if (response.success && response.data) {
        // Filter to only include FILE type data sources
        const fileDataSources = response.data.filter(
          (source: DataSource) => source.type === "FILE",
        );
        console.log("Filtered FILE data sources:", fileDataSources);
        setDataSources(fileDataSources);
        setFilteredDataSources(fileDataSources);

        if (searchFileText) {
          filterDataSourcesBySearchText(searchFileText);
        }
      } else {
        console.error("Failed to fetch data sources:", response.errorMessage);
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
    if (textareaRef.current && onChange) {
      const currentValue = textareaRef.current.value;
      const textBeforeCursor = currentValue.substring(0, cursorPosition);
      const afterCursor = currentValue.substring(cursorPosition);

      // Find the position of the last @ character before cursor
      const atSignIndex = textBeforeCursor.lastIndexOf("@");

      if (atSignIndex !== -1) {
        // Keep everything before the @ character
        const beforeAt = textBeforeCursor.substring(0, atSignIndex);

        // Get the selected file name
        const fileName = file.name || file.url || "Unnamed file";

        // Create the new value with @fileName format (keeping the @ character)
        const newValue = beforeAt + "@" + fileName + afterCursor;

        onChange(newValue);
        setShowFileDropdown(false);

        // Set focus back to textarea
        textareaRef.current.focus();
      }
    }
  };

  return (
    <div
      data-testid="chat-input"
      className="flex items-end justify-end grow gap-1 min-h-6 w-full relative"
      ref={containerRef}
    >
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
            <SubmitButton isDisabled={disabled} onClick={handleSubmitMessage} />
          )}
          {button === "stop" && (
            <StopButton isDisabled={disabled} onClick={onStop} />
          )}
        </div>
      )}

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
