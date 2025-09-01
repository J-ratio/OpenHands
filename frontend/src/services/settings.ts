import { Settings } from "#/types/settings";

export const LATEST_SETTINGS_VERSION = 5;

export const DEFAULT_SETTINGS: Settings = {
  LLM_MODEL: "hosted_vllm/Qwen/Qwen2.5-Coder-32B-Instruct-AWQ",
  LLM_BASE_URL: "https://h2loop--qwen25-coder-32b-serve.modal.run/v1",
  LLM_API_KEY_SET: true,
  AGENT: "CodeActAgent",
  LANGUAGE: "en",
  SEARCH_API_KEY_SET: false,
  CONFIRMATION_MODE: false,
  SECURITY_ANALYZER: "llm",
  REMOTE_RUNTIME_RESOURCE_FACTOR: 1,
  PROVIDER_TOKENS_SET: {},
  ENABLE_DEFAULT_CONDENSER: true,
  CONDENSER_MAX_SIZE: 120,
  ENABLE_SOUND_NOTIFICATIONS: false,
  USER_CONSENTS_TO_ANALYTICS: false,
  ENABLE_PROACTIVE_CONVERSATION_STARTERS: false,
  ENABLE_SOLVABILITY_ANALYSIS: false,
  SEARCH_API_KEY: "",
  IS_NEW_USER: true,
  MAX_BUDGET_PER_TASK: null,
  EMAIL: "",
  EMAIL_VERIFIED: true, // Default to true to avoid restricting access unnecessarily
  MCP_CONFIG: {
    sse_servers: [],
    stdio_servers: [],
    shttp_servers: [],
  },
  ACTIVE_WORKSPACE_ID: undefined,
  GIT_USER_NAME: "h2loop",
  GIT_USER_EMAIL: "h2loop@h2loop.ai",
};

/**
 * Get the default settings
 */
export const getDefaultSettings = (): Settings => DEFAULT_SETTINGS;
