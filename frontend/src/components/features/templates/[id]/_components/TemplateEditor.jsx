"use client";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  filterSuggestionItems,
  insertOrUpdateBlock,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";
import { RiChatSmile2Fill } from "react-icons/ri";
import { AIChat } from "../../../template/[id]/_components/AIChat";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateATemplate } from "../../../../../api/templates";
import CreateDocumentButton from "./create-document-button";

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    aiChat: AIChat,
  },
});

const TemplateEditor = ({ data, templateId }) => {
  const editor = useCreateBlockNote({
    schema,
    initialContent: [
      {
        type: "paragraph",
        content: "This is a new template!",
      },
      {
        type: "paragraph",
      },
    ],
  });

  const [_, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState(data.title || "Untitled Template");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const insertAIChat = (editor) => ({
    title: "AI Chat",
    onItemClick: async () => {
      await saveBlocksToBackend();

      insertOrUpdateBlock(editor, {
        type: "aiChat",
      });
    },
    aliases: ["chat", "ai", "bot", "conversation"],
    group: "AI",
    icon: <RiChatSmile2Fill />,
  });

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    localStorage.setItem(
      `lastUpdatedAtLocalstorage-template-${templateId}`,
      new Date().getTime(),
    );
  };

  const handleBlur = () => {
    setIsEditingTitle(false);
    if (!title.trim()) {
      setTitle("Untitled Document");
    }
  };

  const saveBlocks = () => {
    localStorage.setItem(
      `lastUpdatedAtLocalstorage-template-${templateId}`,
      new Date().getTime(),
    );
  };

  const saveBlocksToBackend = async () => {
    // try {
    console.log(JSON.stringify(editor.document));
    //   const { success, errorMessage } = await updateATemplate({
    //     templateId: templateId,
    //     content: JSON.stringify(editor.document),
    //     name: title,
    //   });
    //   if (success) {
    //     localStorage.setItem(
    //       `lastUpdatedAtBE-template-${templateId}`,
    //       new Date().getTime(),
    //     );
    //     toast.success("Template autosaved");
    //     return true;
    //   } else {
    //     toast.error("Error saving template");
    //     return false;
    //   }
    // } catch (error) {
    //   toast.error("Error saving template");
    //   return false;
    // }
  };

  useEffect(() => {
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("lastUpdatedAtBE") ||
        key.startsWith("lastUpdatedAtLocalstorage")
      ) {
        localStorage.removeItem(key);
      }
    });

    const curentTimeStamp = new Date().getTime();
    localStorage.setItem(
      `lastUpdatedAtBE-template-${templateId}`,
      curentTimeStamp,
    );
    localStorage.setItem(
      `lastUpdatedAtLocalstorage-template-${templateId}`,
      curentTimeStamp,
    );
  }, []);

  useEffect(() => {
    if (loading) return;

    const interval = setInterval(async () => {
      if (
        localStorage.getItem(
          `lastUpdatedAtLocalstorage-template-${templateId}`,
        ) > localStorage.getItem(`lastUpdatedAtBE-template-${templateId}`)
      ) {
        await saveBlocksToBackend();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [title, localStorage, loading]);

  const handleEditorChange = (editor) => {
    console.log("handle editor change");
    console.log(editor.topLevelBlocks);
    const blocksJSON = editor.topLevelBlocks;
    setBlocks(blocksJSON);
    saveBlocks();
  };

  // Load Saved Content
  useEffect(() => {
    if (!editor) {
      toast.error("Error loading document");
      return;
    }

    const loadSavedContent = async () => {
      setLoading(true);
      try {
        let parsedContent;
        parsedContent = JSON.parse(data.content || "[]");
        console.log(JSON.parse(data.content));

        if (!editor) {
          console.log("Editor destroyed");
          return;
        }

        if (parsedContent.length !== 0) {
          setTimeout(() => {
            editor.replaceBlocks(editor.document, parsedContent);
          }, 10);
        }
        setBlocks(parsedContent);
      } catch (error) {
        toast.error("Error loading document");
      } finally {
        setLoading(false);
      }
    };

    loadSavedContent();
  }, [editor]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full text-content rounded-2xl p-4 md:p-8 shadow-lg">
      <div className="container mx-auto mb-3 flex items-center justify-between">
        {isEditingTitle ? (
          <input
            autoFocus
            className={`text-2xl font-bold bg-neutral-900 border border-neutral-700 focus:bg-neutral-800 focus:border-purple-600 focus:ring-0 focus:ring-purple-200 focus:outline-none transition-all duration-200 rounded px-2 py-1 min-w-[50%] text-content`}
            placeholder={title}
            value={title}
            onChange={handleTitleChange}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.target.blur();
            }}
          />
        ) : (
          <h2
            className="text-2xl max-w-[50%] font-bold cursor-text truncate"
            onClick={() => setIsEditingTitle(true)}
          >
            {title}
          </h2>
        )}

        <CreateDocumentButton templateId={templateId} />
      </div>
      <div className="mt-2 border border-purple-900 rounded-lg h-full">
        <div
          className="min-h-[85vh] max-h-[90vh] overflow-y-auto flex-1 p-4"
          style={{ backgroundColor: "#23272e" }}
        >
          <BlockNoteView
            editor={editor}
            slashMenu={false}
            className="mt-4"
            theme="dark"
            onChange={handleEditorChange}
          >
            <SuggestionMenuController
              triggerCharacter="/"
              getItems={async (query) =>
                filterSuggestionItems(
                  [
                    ...getDefaultReactSlashMenuItems(editor),
                    insertAIChat(editor),
                  ],
                  query,
                )
              }
            />
          </BlockNoteView>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
