import "server-only";

export interface AIConfig {
  apiKey: string;
  endpoint: string;
  model: string;
  timeoutMs: number;
  rateLimitPerMin: number;
  isConfigured: boolean;
}

export function getAIConfig(): AIConfig {
  const azureKey = process.env.AZURE_OPENAI_API_KEY?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  // If Azure key is set
  if (azureKey) {
    return {
      apiKey: azureKey,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT?.trim() || "https://models.inference.ai.azure.com",
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME?.trim() || process.env.AZURE_AI_MODEL?.trim() || "gpt-4o",
      timeoutMs: Number(process.env.OPENAI_TIMEOUT_MS) || 30000,
      rateLimitPerMin: Number(process.env.CHAT_RATE_LIMIT) || 20,
      isConfigured: true,
    };
  }

  // If Gemini key is set (using official OpenAI-compatible endpoint)
  if (geminiKey) {
    return {
      apiKey: geminiKey,
      endpoint: "https://generativelanguage.googleapis.com/v1beta/openai",
      model: process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash",
      timeoutMs: Number(process.env.OPENAI_TIMEOUT_MS) || 30000,
      rateLimitPerMin: Number(process.env.CHAT_RATE_LIMIT) || 20,
      isConfigured: true,
    };
  }

  // Fallback to standard OpenAI key if present
  const apiKey = openAiKey || "";
  const endpoint = process.env.OPENAI_BASE_URL?.trim() || "https://models.inference.ai.azure.com";
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o";

  return {
    apiKey,
    endpoint,
    model,
    timeoutMs: Number(process.env.OPENAI_TIMEOUT_MS) || 30000,
    rateLimitPerMin: Number(process.env.CHAT_RATE_LIMIT) || 20,
    isConfigured: Boolean(apiKey),
  };
}
