import ReactMarkdown from "react-markdown";
import { defaultProps } from "@blocknote/core";
import { useState, useEffect, useRef } from "react";
import { createReactBlockSpec } from "@blocknote/react";
import { TextInput, ActionIcon, Menu } from "@mantine/core";
import { IconCheck, IconSend, IconX, IconRefresh } from "@tabler/icons-react";
import "./styles.css";
import { updateBlock } from "../../../../../api/blocks";
import { toast } from "sonner";
import { useDocumentId } from "../../use-document-id";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../ui/dropdown-menu";
import { Button } from "../../../../ui/button";

export const AIChat = createReactBlockSpec(
  {
    type: "aiChat",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      state: {
        default: "prompting",
        values: ["prompting", "generating", "generated"],
      },
      prompt: {
        default: "",
      },
      generatedContent: {
        default: "",
      },
      sources: {
        default: [],
      },
    },
    content: "none", // Changed from "inline" to "none" since we're handling content via props
  },
  {
    render: ({ block, editor }) => {
      const [inputValue, setInputValue] = useState(block.props.prompt || "");
      const [isLoading, setIsLoading] = useState(false);
      const inputRef = useRef(null);
      const docId = useDocumentId();

      useEffect(() => {
        setInputValue(block.props.prompt || "");
      }, [block.props.prompt]);

      useEffect(() => {
        const timer = setTimeout(() => {
          if (inputRef.current && block.props.state === "prompting") {
            inputRef.current.focus();
          }
        }, 0);
        return () => clearTimeout(timer);
      }, [block.props.state]);

      const generateContent = async (promptValue) => {
        try {
          const response = await updateBlock(docId, block.id, promptValue);
          if (response.success && response.data) {
            const generated = extractGeneratedContent(response.data.content);
            if (!generated.content) {
              toast.error(
                "Error while Generating Content with the prompt provided",
              );
              return { error: true };
            }
            const sources = response.data.sources || [];
            const markdownBlocks = await editor.tryParseMarkdownToBlocks(
              generated.content,
            );
            return { generated, sources, markdownBlocks };
          } else {
            console.error("Error generating content:", response.errorMessage);
            return { error: true };
          }
        } catch (error) {
          console.error("Error:", error);
          return { error: true };
        }
      };

      const handleGenerate = async () => {
        if (!inputValue.trim()) return;

        setIsLoading(true);
        editor.updateBlock(block, {
          props: {
            ...block.props,
            state: "generating",
            prompt: inputValue,
          },
        });

        const result = await generateContent(inputValue);
        if (result.error) {
          editor.updateBlock(block, {
            props: {
              ...block.props,
              state: "prompting",
              prompt: inputValue,
              generatedContent: "",
              sources: [],
            },
          });
        } else {
          editor.updateBlock(block, {
            props: {
              ...block.props,
              state: "generated",
              prompt: inputValue,
              generatedContent: result.generated.content,
              sources: result.sources,
            },
            children: result.markdownBlocks,
          });
        }
        setIsLoading(false);
      };

      const handleAccept = () => {
        if (!block || !block.props.generatedContent) return;
        editor.insertBlocks(block.children || [], block, "after");
        editor.removeBlocks([block]);
      };

      const handleReject = () => {
        if (block.children) {
          editor.removeBlocks(block.children);
        }
        editor.updateBlock(block, {
          props: {
            ...block.props,
            state: "prompting",
            prompt: inputValue,
            generatedContent: "",
            sources: [],
          },
        });
      };

      const handleRegenerate = async () => {
        editor.updateBlock(block, {
          props: {
            ...block.props,
            state: "generating",
            generatedContent: "",
            sources: [],
          },
        });
        if (block.children) {
          editor.removeBlocks(block.children);
        }

        setIsLoading(true);
        const result = await generateContent(inputValue);
        if (result.error) {
          editor.updateBlock(block, {
            props: {
              ...block.props,
              state: "prompting",
              prompt: inputValue,
              generatedContent: "",
              sources: [],
            },
          });
        } else {
          editor.updateBlock(block, {
            props: {
              ...block.props,
              state: "generated",
              prompt: inputValue,
              generatedContent: result.generated.content,
              sources: result.sources,
            },
            children: result.markdownBlocks,
          });
        }
        setIsLoading(false);
      };

      const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          handleGenerate();
        }
      };

      const extractGeneratedContent = (content) => {
        const markdownRegex = /```markdown\\n(.*?)```/s;
        const match = markdownRegex.exec(content);
        const extractedContent = match ? match[1] : content;

        return {
          content: extractedContent !== "None" ? extractedContent : null,
        };
      };

      return (
        <div className="ai-chat" data-chat-type="aiChat">
          {block.props.state === "generated" && block.props.generatedContent ? (
            <div className="ai-chat-preview flex justify-between w-full">
              <div>
                <div className="preview-content markdown-preview">
                  <ReactMarkdown>{block.props.prompt}</ReactMarkdown>
                </div>
                {block.props.sources && block.props.sources.length > 0 && (
                  <SourcesPanel
                    data={block.props.sources.flatMap(
                      (item) => item.files || [],
                    )}
                  />
                )}
              </div>

              <Menu
                shadow="md"
                width={200}
                styles={{
                  dropdown: {
                    backgroundColor: "#1A1B1E",
                    borderRadius: "8px",
                    padding: "4px",
                  },
                }}
              >
                <Menu.Target>
                  <ActionIcon>
                    <IconCheck size={16} color="black" />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccept();
                    }}
                    leftSection={<IconCheck size={14} />}
                    className="menu-item accept"
                  >
                    <div className="menu-item-title mx-2">Accept</div>
                  </Menu.Item>
                  <Menu.Item
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject();
                    }}
                    leftSection={<IconX size={14} />}
                    color="red"
                    className="menu-item reject"
                  >
                    <div className="menu-item-title mx-2">Reject</div>
                  </Menu.Item>
                  <Menu.Item
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegenerate();
                    }}
                    color="violet"
                    leftSection={<IconRefresh size={14} />}
                    className="menu-item regenerate"
                  >
                    <div className="menu-item-title mx-2">Regenerate</div>
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          ) : (
            <div className="ai-chat-message">
              <TextInput
                ref={inputRef}
                placeholder="Type your prompt here..."
                value={inputValue}
                onChange={(event) => setInputValue(event.currentTarget.value)}
                onKeyDown={handleKeyDown}
                className="ai-chat-input"
                rightSection={
                  <ActionIcon
                    onClick={handleGenerate}
                    disabled={
                      !inputValue.trim() ||
                      block.props.state === "generating" ||
                      isLoading
                    }
                  >
                    <IconSend size={16} />
                  </ActionIcon>
                }
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      );
    },
  },
);

const SourcesPanel = ({ data = [] }) => {
  return (
    <div className="ai-chat-sources mt-2 flex items-center gap-2">
      <strong>Sources: </strong>
      <div className="flex items-center gap-2">
        {data.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {data.length} {data.length > 1 ? "Sources" : "Source"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-72 max-w-full">
              {data.map((item, idx) => (
                <DropdownMenuItem key={`${item}-${idx}`}>
                  {item}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
