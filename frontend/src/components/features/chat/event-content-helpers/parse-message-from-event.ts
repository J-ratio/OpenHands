import {
  AssistantMessageAction,
  UserMessageAction,
} from "#/types/core/actions";
import i18n from "#/i18n";
import { isUserMessage } from "#/types/core/guards";

export const parseMessageFromEvent = (
  event: UserMessageAction | AssistantMessageAction,
): string => {
  const m = isUserMessage(event) ? event.args.content : event.message;
  const uploadedFilesNotPresent =
    !event.args.file_urls || event.args.file_urls.length === 0;
  const attachedFilesNotPresent =
    !event.args.attached_files || event.args.attached_files.length === 0;

  if (uploadedFilesNotPresent && attachedFilesNotPresent) {
    return m;
  }
  const delimiter = !uploadedFilesNotPresent
    ? i18n.t("CHAT_INTERFACE$AUGMENTED_PROMPT_FILES_TITLE")
    : "Here are the relevant chunks from the workspace files:";
  const parts = m.split(delimiter);

  return parts[0];
};
