import {
  AttachedCodeBlock,
  AttachedFile,
} from "#/components/features/chat/chat-input";
import ActionType from "#/types/action-type";

export function createChatMessage(
  message: string,
  image_urls: string[],
  file_urls: string[],
  attached_files: AttachedFile[],
  attached_codeblocks: AttachedCodeBlock[],
  timestamp: string,
) {
  const event = {
    action: ActionType.MESSAGE,
    args: {
      content: message,
      image_urls,
      file_urls,
      attached_files,
      attached_codeblocks,
      timestamp,
    },
  };
  return event;
}
