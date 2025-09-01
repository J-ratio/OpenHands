// These are provider names, not user-facing text
export const MAP_PROVIDER = {
  openai: "OpenAI",
  azure: "Azure",
  azure_ai: "Azure AI Studio",
  vertex_ai: "VertexAI",
  palm: "PaLM",
  gemini: "Gemini",
  anthropic: "Anthropic",
  sagemaker: "AWS SageMaker",
  bedrock: "AWS Bedrock",
  mistral: "Mistral AI",
  anyscale: "Anyscale",
  databricks: "Databricks",
  ollama: "Ollama",
  perlexity: "Perplexity AI",
  friendliai: "FriendliAI",
  groq: "Groq",
  fireworks_ai: "Fireworks AI",
  cloudflare: "Cloudflare Workers AI",
  deepinfra: "DeepInfra",
  ai21: "AI21",
  replicate: "Replicate",
  voyage: "Voyage AI",
  openrouter: "OpenRouter",
  openhands: "OpenHands",
};

export const mapProvider = (provider: string) =>
  Object.keys(MAP_PROVIDER).includes(provider)
    ? MAP_PROVIDER[provider as keyof typeof MAP_PROVIDER]
    : provider;

/**
 * Compose a repository URL from a git provider and full_name.
 * @param provider - The git provider (e.g., 'github', 'gitlab', 'bitbucket')
 * @param fullName - The full name of the repository (e.g., 'user/repo')
 * @returns The full URL to the repository on the provider.
 */
export function composeRepoUrl(provider: string, fullName: string): string {
  if (provider === "github") {
    return `https://github.com/${fullName}`;
  } else if (provider === "gitlab") {
    return `https://gitlab.com/${fullName}`;
  } else if (provider === "bitbucket") {
    return `https://bitbucket.org/${fullName}`;
  }
  return "";
}

export const getProviderId = (displayName: string): string => {
  const entry = Object.entries(MAP_PROVIDER).find(
    ([, value]) => value === displayName,
  );
  return entry ? entry[0] : displayName;
};
