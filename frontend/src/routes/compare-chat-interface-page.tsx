import React from "react";
import { useDisclosure } from "@heroui/react";
import { useNavigate } from "react-router";
import { useConversationId } from "#/hooks/use-conversation-id";
import { Controls } from "#/components/features/controls/controls";

import { WsClientProvider } from "#/context/ws-client-provider";
import { EventHandler } from "../wrapper/event-handler";
import { useConversationConfig } from "#/hooks/query/use-conversation-config";

import Security from "#/components/shared/modals/security/security";
import { useActiveConversation } from "#/hooks/query/use-active-conversation";
import { useSettings } from "#/hooks/query/use-settings";
import { displayErrorToast } from "#/utils/custom-toast-handlers";
import { useDocumentTitleFromState } from "#/hooks/use-document-title-from-state";
import OpenHands from "#/api/open-hands";
import { useAuthTokenStatus } from "#/hooks/use-auth-token";
import { useUserProviders } from "#/hooks/use-user-providers";
import { CompareChatInterface } from "#/components/features/chat/compare-chat-interface";

function CompareChatInterfacePage() {
  useConversationConfig();
  const { data: settings } = useSettings();
  const { conversationId } = useConversationId();
  const { data: conversation, isFetched, refetch } = useActiveConversation();
  const { isAuthenticated } = useAuthTokenStatus();
  const { providers } = useUserProviders();

  const navigate = useNavigate();

  // Set the document title to the conversation title when available
  useDocumentTitleFromState();

  React.useEffect(() => {
    if (isFetched && !conversation && isAuthenticated) {
      displayErrorToast(
        "This conversation does not exist, or you do not have permission to access it.",
      );
      navigate("/");
    } else if (conversation?.status === "STOPPED") {
      // start the conversation if the state is stopped on initial load
      OpenHands.startConversation(conversation.conversation_id, providers).then(
        () => refetch(),
      );
    }
  }, [conversation?.conversation_id, isFetched, isAuthenticated, providers]);

  const {
    isOpen: securityModalIsOpen,
    onOpen: onSecurityModalOpen,
    onOpenChange: onSecurityModalOpenChange,
  } = useDisclosure();

  return (
    <WsClientProvider conversationId={conversationId}>
      <EventHandler>
        <div data-testid="app-route" className="flex flex-col h-full gap-3">
          <div className="flex h-full overflow-auto">
            <CompareChatInterface />
          </div>

          <Controls showSecurityLock={!!settings?.SECURITY_ANALYZER} />
          {settings && (
            <Security
              isOpen={securityModalIsOpen}
              onOpenChange={onSecurityModalOpenChange}
              securityAnalyzer={settings.SECURITY_ANALYZER ?? ""}
            />
          )}
        </div>
      </EventHandler>
    </WsClientProvider>
  );
}

export default CompareChatInterfacePage;
