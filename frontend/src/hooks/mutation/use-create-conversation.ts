import { useMutation, useQueryClient } from "@tanstack/react-query";
import posthog from "posthog-js";
import OpenHands from "#/api/open-hands";
import { SuggestedTask } from "#/components/features/home/tasks/task.types";
import { useSimulationMode } from "#/fake_scripts/simulation_context";
import { Provider } from "#/types/settings";
import { CreateMicroagent } from "#/api/open-hands.types";
import { setInitialPrompt } from "#/state/initial-query-slice";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { useWorkspace } from "#/context/WorkspaceContext";

interface CreateConversationVariables {
  query?: string;
  repository?: {
    name: string;
    gitProvider: Provider;
    branch?: string;
  };
  suggestedTask?: SuggestedTask;
  conversationInstructions?: string;
  createMicroagent?: CreateMicroagent;
  use_h2loop_model?: boolean;
}

export const useCreateConversation = (comparision: boolean = false) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enableSimulation, disableSimulation } = useSimulationMode();
  const { linkedRepo } = useWorkspace();

  return useMutation({
    mutationKey: ["create-conversation"],
    mutationFn: async (
      variables: CreateConversationVariables & { simulationMode?: boolean },
    ) => {
      const {
        query,
        repository,
        suggestedTask,
        conversationInstructions,
        createMicroagent,
        use_h2loop_model,
      } = variables;

      if (variables.simulationMode) {
        enableSimulation();
      } else {
        disableSimulation();
      }

      if (variables.query) dispatch(setInitialPrompt(variables.query));

      return OpenHands.createConversation(
        repository?.name,
        repository?.gitProvider,
        query,
        suggestedTask,
        repository?.branch,
        conversationInstructions,
        createMicroagent,
        use_h2loop_model,
        linkedRepo?.url,
      );
    },
    onSuccess: async (
      { conversation_id: conversationId },
      { query, repository },
    ) => {
      posthog.capture("initial_query_submitted", {
        entry_point: "task_form",
        query_character_length: query?.length,
        has_repository: !!repository,
      });
      await queryClient.invalidateQueries({
        queryKey: ["user", "conversations"],
      });
      if (!comparision) {
        navigate(`/conversations/${conversationId}`);
      } else {
        navigate(`/conversations/${conversationId}/compare`);
      }
    },
  });
};
