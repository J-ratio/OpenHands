import React from "react";
import { NavLink, useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { ConversationCard } from "./conversation-card";
import { useUserConversations } from "#/hooks/query/use-user-conversations";
import { useDeleteConversation } from "#/hooks/mutation/use-delete-conversation";
import { ConfirmDeleteModal } from "./confirm-delete-modal";
import { LoadingSpinner } from "#/components/shared/loading-spinner";
import { ExitConversationModal } from "./exit-conversation-modal";
import { useClickOutsideElement } from "#/hooks/use-click-outside-element";
import { useWorkspace } from "#/context/WorkspaceContext";
import { BrandButton } from "../settings/brand-button";
import { useCreateConversation } from "#/hooks/mutation/use-create-conversation";
import OpenHands from "#/api/open-hands";
import { displayErrorToast } from "#/utils/custom-toast-handlers";

interface ConversationPanelProps {
  onClose: () => void;
}

export function ConversationPanel({ onClose }: ConversationPanelProps) {
  const { t } = useTranslation();
  const { conversationId: currentConversationId } = useParams();
  const ref = useClickOutsideElement<HTMLDivElement>(onClose);
  const navigate = useNavigate();
  const { selectedWorkspaceName } = useWorkspace();

  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] =
    React.useState(false);
  const [
    confirmExitConversationModalVisible,
    setConfirmExitConversationModalVisible,
  ] = React.useState(false);
  const [selectedConversationId, setSelectedConversationId] = React.useState<
    string | null
  >(null);

  const [conversations, setConversations] = React.useState<any[]>([]);
  const [nextPageId, setNextPageId] = React.useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  const { mutate: createConversation } = useCreateConversation();
  const { data, isFetching, error, isFetchedAfterMount } =
    useUserConversations();

  const { mutate: deleteConversation } = useDeleteConversation();

  React.useEffect(() => {
    if (data?.results) {
      setConversations(data.results);
      setNextPageId(data.next_page_id);
    }
  }, [data]);

  const handleDeleteProject = (conversationId: string) => {
    setConfirmDeleteModalVisible(true);
    setSelectedConversationId(conversationId);
  };

  const handleConfirmDelete = () => {
    if (selectedConversationId) {
      deleteConversation(
        { conversationId: selectedConversationId },
        {
          onSuccess: () => {
            if (selectedConversationId === currentConversationId) {
              navigate("/");
            }
          },
        },
      );
    }
  };

  const handleLoadMore = async () => {
    if (!nextPageId || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const response = await OpenHands.getUserConversations(nextPageId);

      setConversations((prev) => [...prev, ...response.results]);
      setNextPageId(response.next_page_id);
    } catch (error) {
      console.error("Failed to load more conversations:", error);
      displayErrorToast("Failed to load more conversations");
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div
      ref={ref}
      data-testid="conversation-panel"
      className="w-[350px] h-full border border-neutral-700 bg-base-secondary rounded-xl overflow-y-auto absolute"
    >
      <div className="flex flex-col items-center justify-center mt-2 mb-4">
        <span className="text-sm text-neutral-400 font-medium px-3 py-1 bg-neutral-800 rounded">
          Workspace:{" "}
          <span className="font-semibold">{selectedWorkspaceName}</span>
        </span>
        <div className="w-full h-px bg-neutral-700 mt-2" />
      </div>
      {isFetching && (
        <div className="w-full h-full absolute flex justify-center items-center">
          <LoadingSpinner size="small" />
        </div>
      )}
      {error && (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-danger">{error.message}</p>
        </div>
      )}
      {conversations.length === 0 && !isFetching && isFetchedAfterMount && (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-neutral-400">
            {t(I18nKey.CONVERSATION$NO_CONVERSATIONS)}
          </p>
          <BrandButton
            type="button"
            variant="primary"
            onClick={() => {
              createConversation({});
              onClose();
            }}
          >
            Create New Conversation
          </BrandButton>
        </div>
      )}
      {conversations.map((project) => (
        <NavLink
          key={project.conversation_id}
          to={`/conversations/${project.conversation_id}`}
          onClick={onClose}
        >
          {({ isActive }) => (
            <ConversationCard
              isActive={isActive}
              onDelete={() => handleDeleteProject(project.conversation_id)}
              title={project.title}
              selectedRepository={project.selected_repository}
              lastUpdatedAt={project.last_updated_at}
              createdAt={project.created_at}
              conversationStatus={project.status}
              conversationId={project.conversation_id}
            />
          )}
        </NavLink>
      ))}
      {nextPageId !== null && (
        <div className="flex justify-center my-4">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className={`px-4 py-2 text-sm font-medium rounded ${
              isLoadingMore
                ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary-dark"
            }`}
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
      {confirmDeleteModalVisible && (
        <ConfirmDeleteModal
          onConfirm={() => {
            handleConfirmDelete();
            setConfirmDeleteModalVisible(false);
          }}
          onCancel={() => setConfirmDeleteModalVisible(false)}
        />
      )}
      {confirmExitConversationModalVisible && (
        <ExitConversationModal
          onConfirm={() => {
            onClose();
          }}
          onClose={() => setConfirmExitConversationModalVisible(false)}
        />
      )}
    </div>
  );
}
