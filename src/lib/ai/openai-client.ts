import "server-only";
import OpenAI from "openai";
import { getAIConfig } from "./config";
import { logger } from "@/lib/logger";

let clientInstance: OpenAI | null = null;
let lastApiKey: string = "";
let lastEndpoint: string = "";

export function getOpenAIClient(): OpenAI {
  const config = getAIConfig();

  if (!config.apiKey) {
    throw new Error(
      "AI API key is missing. Please set AZURE_OPENAI_API_KEY or OPENAI_API_KEY in your environment (.env.local)."
    );
  }

  if (
    !clientInstance ||
    lastApiKey !== config.apiKey ||
    lastEndpoint !== config.endpoint
  ) {
    logger.info("Initializing OpenAI client", {
      endpoint: config.endpoint,
      model: config.model,
      timeoutMs: config.timeoutMs,
      category: "AI",
    });

    clientInstance = new OpenAI({
      baseURL: config.endpoint,
      apiKey: config.apiKey,
      timeout: config.timeoutMs,
      maxRetries: 2,
    });

    lastApiKey = config.apiKey;
    lastEndpoint = config.endpoint;
  }

  return clientInstance;
}
