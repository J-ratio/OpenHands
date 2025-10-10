import { Settings } from "#/types/settings";

export const LATEST_SETTINGS_VERSION = 5;

export const DEFAULT_SETTINGS: Settings = {
  LLM_MODEL: "litellm_proxy/qwen/qwen3-coder-480b-a35b-instruct-maas",
  LLM_BASE_URL: "https://litellm-prod-909645453767.asia-south1.run.app",
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
