import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
// import jwt from "jsonwebtoken";
import { links } from "../constants/data";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function trimEmail(email) {
  if (typeof email !== "string") return null;

  const maxLength = 20;
  const trimmedEmail = email.trim().toLowerCase();

  return trimmedEmail.length > maxLength
    ? trimmedEmail.slice(0, maxLength - 3) + "..."
    : trimmedEmail;
}

export function trimName(name) {
  if (typeof name !== "string") return null;

  const maxLength = 40;
  const trimmedName = name.trim();

  return trimmedName.length > maxLength
    ? trimmedName.slice(0, maxLength - 3) + "..."
    : trimmedName;
}

export function checkGithubRepositoryURl(url) {
  const githubUrlRegex = /https:\/\/github.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+/;
  return githubUrlRegex.test(url);
}

// export function isTokenExpired(token) {
//   try {
//     const decodedToken = jwt.decode(token);
//     return decodedToken.exp * 1000 < Date.now();
//   } catch (error) {
//     // console.error("Failed to decode token:", error);
//     return true;
//   }
// }

export function getAccordionDefaultValues(codebases, documents) {
  let value = [];

  if (codebases.length > 0) value.push("codebases");
  if (documents.length > 0) value.push("documents");

  return value;
}

export function updateCustomBlocks(parsedContent) {
  return parsedContent.map((block) => {
    // Process children recursively
    if (block.children && block.children.length > 0) {
      block.children = updateCustomBlocks(block.children);
    }

    // Handle Mermaid code blocks
    if (block.type === "codeBlock") {
      let isMermaid = false;
      if (
        block.props &&
        block.props.language &&
        block.props.language.toLowerCase() === "mermaid"
      ) {
        isMermaid = true;
      } else {
        let codeText = "";
        if (Array.isArray(block.content)) {
          block.content.forEach((item) => {
            if (item.type === "text" && typeof item.text === "string") {
              codeText += item.text;
            }
          });
        }
        if (codeText.toLowerCase().includes("mermaid")) {
          isMermaid = true;
        }
      }

      if (isMermaid) {
        let codeText = "";
        if (Array.isArray(block.content)) {
          block.content.forEach((item) => {
            if (item.type === "text" && typeof item.text === "string") {
              codeText += item.text;
            }
          });
        }

        block.type = "mermaid";
        block.props = {
          textColor: "default",
          textAlignment: "left",
          displayType: "text",
        };
        block.content = [
          {
            type: "mermaidcontent",
            props: {
              code: codeText,
            },
          },
        ];
        block.children = [];
      }
    }

    // Handle AI Chat code blocks
    if (
      block.type === "codeBlock" &&
      block.props.language === "json" &&
      block.content &&
      block.content[0]?.text
    ) {
      try {
        const content = JSON.parse(block.content[0].text);
        if (content?.type === "aiChat") {
          return {
            ...content,
            id: block.id,
            children: block.children || [],
          };
        }
      } catch (e) {
        console.error("Error parsing AI Chat block", e);
      }
    }

    return block;
  });
}

export function convertMermaidToCodeBlock(parsedContent) {
  return parsedContent.map((block) => {
    // Process children recursively if they exist
    if (block.children && block.children.length > 0) {
      block.children = convertMermaidToCodeBlock(block.children);
    }

    // Check if the block is a mermaid block
    if (block.type === "mermaid") {
      let codeText = "";

      // Extract code from the mermaid content
      if (Array.isArray(block.content)) {
        block.content.forEach((item) => {
          if (
            item.type === "mermaidcontent" &&
            item.props &&
            typeof item.props.code === "string"
          ) {
            codeText += item.props.code || " ";
          }
        });
      }

      if (codeText.trim() === "") {
        codeText = " ";
      }

      block.type = "codeBlock";
      block.props = {
        language: "mermaid",
        textColor: block.props.textColor || "default",
        backgroundColor: block.props.backgroundColor || "default",
        textAlignment: block.props.textAlignment || "left",
      };

      block.content = [
        {
          type: "text",
          text: codeText,
          styles: {},
        },
      ];

      block.children = [];
    }

    return block;
  });
}

export function getLastProcessedVersion(repo) {
  const processedVersions =
    repo?.versions?.filter((v) => v.status === "PROCESSED") || [];
  return processedVersions.length ? processedVersions.at(-1) : null;
}

export function getTabs(repoLength = 0) {
  const DISABLE_AUTO_GEN_FLOW =
    import.meta.env.NEXT_PUBLIC_DISABLE_AUTO_GEN_FLOW === "true";

  if (DISABLE_AUTO_GEN_FLOW || repoLength !== 1) {
    return [];
  } else {
    return ["DATA_SOURCES", "DOCUMENTATION"];
  }
}

export const normalizeAIChatBlocks = (blocks) => {
  return blocks.map((block) => {
    if (block.type === "aiChat") {
      return {
        ...block,
        props: {
          ...block.props,
          state:
            block.props?.state === "generating"
              ? "prompting"
              : block.props?.state === "generated"
                ? "initial"
                : block.props?.state,
        },
      };
    }
    return block;
  });
};

export async function getTheMarkdownContentForEditor(blocksJSON, hiddenEditor) {
  hiddenEditor.replaceBlocks(hiddenEditor.document, blocksJSON);

  const _hiddenEditorBlocks = hiddenEditor.document;

  let updatedBlocks = convertAIChatToCodeBlock(_hiddenEditorBlocks);
  updatedBlocks = convertMermaidToCodeBlock(updatedBlocks);

  const documentMarkdown =
    await hiddenEditor.blocksToMarkdownLossy(updatedBlocks);

  return documentMarkdown;
}

export const formatStatusText = (status) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export function getTheCurrentSidebarItem(pathname) {
  return links.find((link) => {
    if (pathname.startsWith("/document/")) {
      return link.href === "/documents";
    }
    return pathname === link.href || pathname.startsWith(`${link.href}/`);
  });
}

export function convertAIChatToCodeBlock(blocks) {
  return blocks.map((block) => {
    if (block.children && block.children.length > 0) {
      block.children = convertAIChatToCodeBlock(block.children);
    }

    if (block.type === "aiChat") {
      const aiChatData = {
        type: "aiChat",
        props: {
          state: block.props?.state || "prompting",
          prompt: block.props?.prompt || "",
          generatedContent: block.props?.generatedContent || "",
          sources: Array.isArray(block.props?.sources)
            ? block.props.sources
            : [],
          textColor: block.props?.textColor || "default",
          textAlignment: block.props?.textAlignment || "left",
        },
      };

      block.type = "codeBlock";
      block.props = {
        language: "json",
        textColor: "default",
        backgroundColor: "default",
        textAlignment: "left",
      };
      block.content = [
        {
          type: "text",
          text: JSON.stringify(aiChatData, null, 2),
          styles: {},
        },
      ];
      block.children = [];
    }

    return block;
  });
}

export const getColorFromName = (name) => {
  let hash = 5381;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) + hash + name.charCodeAt(i);
  }
  // Generate hue only in blue (180-270) and green (90-180) ranges
  const blueGreenRange = 180; // 180 degrees total for blue and green combined
  const hueOffset = Math.abs(hash) % blueGreenRange;
  // Map to green range (90-180) or blue range (180-270)
  const hue = hueOffset < 90 ? hueOffset + 90 : hueOffset + 90;
  return `hsl(${hue}, 70%, 50%)`;
};
