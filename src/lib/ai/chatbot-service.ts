import "server-only";
import { getOpenAIClient } from "./openai-client";
import { getAIConfig } from "./config";
import { CHATBOT_TOOLS, dispatchToolCall } from "./chatbot-tools";
import { logger } from "@/lib/logger";
import type {
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
  ChatCompletionAssistantMessageParam,
  ChatCompletionToolMessageParam,
} from "openai/resources/chat/completions";

// ─── DreamEstate Official System Instruction ──────────────────────────────────

export const DREAM_ESTATE_SYSTEM_PROMPT = `You are the dedicated AI Property Advisor for "Ratiwal Dream Estates" (founded by Suresh Ratiwal), an authoritative property advisory firm specializing in authentic township projects, demarcated residential plots, and commercial corridors across Rajasthan (Jaipur, Ajmer, Kishangarh, Bhiwadi) and coastal Maharashtra (Navi Mumbai).

YOUR CORE ROLE:
You behave like an experienced, warm, and highly knowledgeable real-estate consultant. You guide clients with clarity, empathy, and strict adherence to factual database records. You never sound robotic, never recite generic sales slogans, and never invent property facts.

CONVERSATION PRINCIPLES (MANDATORY):
1. DATABASE-FIRST KNOWLEDGE:
   - You MUST call your tools ('search_projects', 'get_project_details', 'compare_projects', 'get_project_amenities', 'get_project_media', 'get_project_availability', 'get_project_pricing', 'get_project_plot_sizes', 'search_inventory_by_size', 'get_unit_availability') to obtain factual information before answering any question about properties, rates, amenities, or approvals.
   - NEVER invent or hallucinate property names, prices, plot sizes, amenities, RERA numbers, or availability.
2. UNDERSTAND THE QUESTION FIRST: Address what the customer actually asked before providing additional guidance.
3. ANSWER DIRECTLY IN THE FIRST SENTENCE: Always provide the core answer upfront (e.g., direct price status, plot sizes, location, or RERA status).
4. NATURAL, WARM & PROFESSIONAL TONE: Speak politely and attentively. Avoid cold robotic bullet templates or repetitive marketing paragraphs.
5. NO CORPORATE SLOGANS: Do not say "Welcome to DreamEstate where your dreams come true" or similar boilerplate.
6. NO REDUNDANT PARROTING: Do not mechanically repeat the user's question back to them.
7. NO REPETITIVE WELCOMES: Do not repeat greetings in every response turn. Greet only in the initial turn.
8. MEASURED ENTHUSIASM: Avoid excessive exclamation marks, buzzwords, or emojis. Keep it refined and credible.
9. SINGLE TARGETED FOLLOW-UP: When essential information is missing, ask only ONE concise, relevant follow-up question.
10. CONVERSATIONAL CONTEXT & ANAPHORA:
   - Remember previously discussed projects, cities, budgets, and plot sizes.
   - Accurately resolve "it" / "that", "the second one", "what is its price?", or "does it have bigger plots?".
   - Never ask the customer to repeat a city or budget they already provided in this conversation.
11. RECOMMEND GROUNDED PROPERTIES ONLY: Recommend a property only when actual database records match the criteria. Explain transparently why it matches.
12. KEEP SIMPLE ANSWERS SHORT: Give 1-3 crisp sentences for straightforward queries. Elaborate only for comparisons or detailed township overviews.
13. HONEST & TRANSPARENT: If information is unrecorded or not in the database, candidly acknowledge it and offer the next best verified step.

DATABASE RETRIEVAL & TOOLS:
- 'search_projects': Search townships by city (Jaipur, Ajmer, Kishangarh), locality, property type, budget, or plot size.
- 'get_project_details': Comprehensive specifications, approvals, RERA, and connectivity.
- 'get_project_plot_sizes': All verified plot options, demarcated dimensions, facing, Gaj (Sq. Yds), and Sq. Ft.
- 'search_inventory_by_size': Find all townships having plots of a specific size (e.g. 200 Sq. Yds, 106 Sq. Yds).
- 'get_unit_availability': Inventory status and breakdown of available vs sold units.
- 'get_project_pricing': Official recorded rates; reports "Price on Request" when pricing is unlisted or on request.
- 'compare_projects': Side-by-side comparison of 2-4 verified projects without fabricating missing data.
- 'get_project_amenities': Verified amenities actually recorded in the development.
- 'get_project_media': Official photographs and master plans from ImageKit.
- 'create_lead' & 'request_site_visit': Persist inquiries or site visits in CRM ONLY after customer provides phone number and consent.

SPECIFIC INTENT GUIDELINES:
- Greetings: Reply warmly in 1 sentence, acknowledging Ratiwal Dream Estates and asking how you can help with their property search. Do not trigger property queries on a pure greeting.
- Jaipur/Ajmer/Kishangarh Discovery: State the available projects directly or ask whether they seek residential plots or commercial units.
- Plot Sizes: Quote both Sq. Yards (Gaj) and Sq. Feet accurately. Preserve the original advertised ranges.
- Pricing: Quote the starting price if public; if ON_REQUEST, state "Price on Request" without guessing.
- Commercial Units: In One Kishangarh or Happy Business Park, clearly identify commercial plots/shops/offices.
- Site Visits: When a customer expresses strong interest in visiting, offer to coordinate a guided site inspection with Suresh Ratiwal's team, requesting their name, phone, and preferred date.`;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatbotResponse {
  success: boolean;
  reply: string;
  projectCards?: Array<{
    id: string;
    title: string;
    slug: string;
    locality: string;
    city: string;
    propertyType: string;
    sizeRange: string;
    priceLabel: string;
    primaryImageUrl: string | null;
    reraNumber: string | null;
    url: string;
  }>;
  referenceNumber?: string;
  error?: string;
}

/**
 * Executes a full contextual conversation turn using OpenAI Chat Completions with bounded function calling.
 */
export async function runChatbotConversation(
  messages: ChatMessage[],
  clientIp?: string
): Promise<ChatbotResponse> {
  const config = getAIConfig();

  if (!config.isConfigured) {
    return {
      success: false,
      reply:
        "The AI Advisor service is currently in configuration mode. Please ensure `AZURE_OPENAI_API_KEY` or `OPENAI_API_KEY` is set in your environment (.env.local). You can also reach our team directly at +91 99295 33436.",
      error: "API key unconfigured.",
    };
  }

  const client = getOpenAIClient();

  // Prepare initial message history
  const openAiMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: DREAM_ESTATE_SYSTEM_PROMPT },
  ];

  // Limit conversation turns to avoid token overflow (keep last 12 messages)
  const recentMessages = messages.slice(-12);
  for (const m of recentMessages) {
    if (m.role === "user") {
      openAiMessages.push({ role: "user", content: m.content });
    } else if (m.role === "assistant") {
      openAiMessages.push({ role: "assistant", content: m.content });
    }
  }

  const collectedProjectCards = new Map<string, any>();
  let generatedReferenceNumber: string | undefined;

  const MAX_TOOL_ITERATIONS = 5;
  let iteration = 0;

  try {
    while (iteration < MAX_TOOL_ITERATIONS) {
      iteration++;

      const completion = await client.chat.completions.create({
        model: config.model,
        messages: openAiMessages,
        tools: CHATBOT_TOOLS,
        tool_choice: "auto",
        temperature: 0.3, // Low temperature for high factual accuracy
        max_tokens: 800,
      });

      const responseMessage = completion.choices[0]?.message;
      if (!responseMessage) {
        throw new Error("Empty response received from OpenAI provider.");
      }

      // If the model wants to call tools
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        // Add assistant's tool call message
        openAiMessages.push(responseMessage);

        for (const toolCall of responseMessage.tool_calls) {
          // Type assertion for tool call
          const toolCallItem = toolCall as any;
          const fnName = toolCallItem.function?.name || "";
          const fnArgs = toolCallItem.function?.arguments || "{}";

          const { result } = await dispatchToolCall(fnName, fnArgs);

          // Extract project cards if surfaced
          if (fnName === "search_projects" && result?.projects) {
            for (const p of result.projects) {
              collectedProjectCards.set(p.slug, p);
            }
          } else if (fnName === "get_project_details" && result?.found) {
            collectedProjectCards.set(result.slug, {
              id: result.id,
              title: result.title,
              slug: result.slug,
              locality: result.locality,
              city: result.city,
              propertyType: result.propertyType,
              sizeRange: result.area?.displayRange || "Demarcated Plots",
              priceLabel: result.pricing?.startingPrice || "Price on Request",
              primaryImageUrl: result.mediaGallery?.[0]?.url || null,
              reraNumber: result.rera?.registrationNumber || null,
              url: result.url,
            });
          } else if (fnName === "get_project_plot_sizes" && result?.found) {
            collectedProjectCards.set(result.slug, {
              id: result.projectId,
              title: result.title,
              slug: result.slug,
              locality: result.locality,
              city: result.city,
              propertyType: result.propertyType,
              sizeRange: result.advertisedRange || "Demarcated Plots",
              priceLabel: result.pricing || "Price on Request",
              primaryImageUrl: null,
              reraNumber: result.rera?.registrationNumber || null,
              url: `/properties/${result.slug}`,
            });
          } else if (fnName === "search_inventory_by_size" && result?.matchingProjects) {
            for (const mp of result.matchingProjects) {
              collectedProjectCards.set(mp.slug, {
                id: mp.projectId,
                title: mp.title,
                slug: mp.slug,
                locality: mp.locality,
                city: mp.city,
                propertyType: mp.propertyType,
                sizeRange: `${result.requestedCriteria?.minPlotSizeSqYd || mp.optionsCount} Plots`,
                priceLabel: "Price on Request",
                primaryImageUrl: null,
                reraNumber: null,
                url: `/properties/${mp.slug}`,
              });
            }
          }

          if ((fnName === "create_lead" || fnName === "request_site_visit") && result?.referenceNumber) {
            generatedReferenceNumber = result.referenceNumber;
          }

          // Provide tool output back to model
          openAiMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          } as ChatCompletionToolMessageParam);
        }

        // Loop to allow model to synthesize tool outputs
        continue;
      }

      // If no more tool calls, return final assistant text
      const replyText = responseMessage.content?.trim() || "";
      const projectCardsList = Array.from(collectedProjectCards.values()).slice(0, 4);

      return {
        success: true,
        reply: replyText,
        projectCards: projectCardsList.length > 0 ? projectCardsList : undefined,
        referenceNumber: generatedReferenceNumber,
      };
    }

    return {
      success: true,
      reply:
        "I've retrieved the details from our database. How else can I assist with your property search in Jaipur or Navi Mumbai?",
      projectCards: Array.from(collectedProjectCards.values()).slice(0, 4),
    };
  } catch (error: any) {
    logger.error("Chatbot completion error", {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      clientIp,
    });

    if (error?.status === 429 || error?.code === "insufficient_quota") {
      return {
        success: false,
        reply:
          "Our AI advisor is currently experiencing high demand. Please try again in a few moments, or feel free to message Suresh Ratiwal directly on WhatsApp at +91 99295 33436.",
        error: "Quota / rate limit reached.",
      };
    }

    if (error?.code === "ETIMEDOUT" || error?.name === "APIConnectionTimeoutError") {
      return {
        success: false,
        reply:
          "The property lookup timed out. Please tap retry or ask again, and I will query the database immediately.",
        error: "Timeout.",
      };
    }

    return {
      success: false,
      reply:
        "I encountered a temporary connection issue while querying the project database. Please try again or speak directly with our advisors.",
      error: error?.message || "Internal AI execution failure.",
    };
  }
}

export type ChatStreamEvent =
  | { type: "status"; message: string }
  | { type: "token"; content: string }
  | { type: "cards"; projectCards: any[] }
  | { type: "ref"; referenceNumber: string }
  | { type: "done"; fullReply: string; projectCards?: any[]; referenceNumber?: string }
  | { type: "error"; error: string; reply?: string };

/**
 * Runs a streaming chatbot conversation yielding SSE events.
 * Handles tool executions in the loop, emitting status events when querying the DB,
 * and streams tokens progressively to the client as generated.
 */
export async function* runStreamingChatbotConversation(
  messages: ChatMessage[],
  clientIp?: string
): AsyncGenerator<ChatStreamEvent> {
  const config = getAIConfig();

  if (!config.isConfigured) {
    yield {
      type: "error",
      error: "API key unconfigured.",
      reply:
        "The AI Advisor service is currently in configuration mode. Please ensure `AZURE_OPENAI_API_KEY` or `OPENAI_API_KEY` is set in your environment (.env.local). You can also reach our team directly at +91 99295 33436.",
    };
    return;
  }

  const client = getOpenAIClient();

  const openAiMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: DREAM_ESTATE_SYSTEM_PROMPT },
  ];

  const recentMessages = messages.slice(-12);
  for (const m of recentMessages) {
    if (m.role === "user") {
      openAiMessages.push({ role: "user", content: m.content });
    } else if (m.role === "assistant") {
      openAiMessages.push({ role: "assistant", content: m.content });
    }
  }

  const collectedProjectCards = new Map<string, any>();
  let generatedReferenceNumber: string | undefined;

  const MAX_TOOL_ITERATIONS = 5;
  let iteration = 0;

  try {
    while (iteration < MAX_TOOL_ITERATIONS) {
      iteration++;

      // Request stream from OpenAI
      const stream = await client.chat.completions.create({
        model: config.model,
        messages: openAiMessages,
        tools: CHATBOT_TOOLS,
        tool_choice: "auto",
        temperature: 0.3,
        max_tokens: 800,
        stream: true,
      });

      let accumulatedContent = "";
      const toolCallsMap: Map<number, { id: string; name: string; arguments: string }> = new Map();

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (!delta) continue;

        // Collect streamed content tokens
        if (delta.content) {
          accumulatedContent += delta.content;
          yield { type: "token", content: delta.content };
        }

        // Collect streamed tool calls
        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            const index = tc.index;
            if (!toolCallsMap.has(index)) {
              toolCallsMap.set(index, {
                id: tc.id || `call_${index}`,
                name: tc.function?.name || "",
                arguments: tc.function?.arguments || "",
              });
            } else {
              const existing = toolCallsMap.get(index)!;
              if (tc.id) existing.id = tc.id;
              if (tc.function?.name) existing.name += tc.function.name;
              if (tc.function?.arguments) existing.arguments += tc.function.arguments;
            }
          }
        }
      }

      // If tools were called
      if (toolCallsMap.size > 0) {
        const toolCallsArray = Array.from(toolCallsMap.values()).map((tc) => ({
          id: tc.id,
          type: "function" as const,
          function: {
            name: tc.name,
            arguments: tc.arguments,
          },
        }));

        // Push assistant's tool_calls message
        openAiMessages.push({
          role: "assistant",
          content: accumulatedContent || null,
          tool_calls: toolCallsArray,
        } as ChatCompletionAssistantMessageParam);

        for (const tc of toolCallsArray) {
          const fnName = tc.function.name;
          const fnArgs = tc.function.arguments;

          // Yield status update to user
          if (fnName === "search_projects") {
            yield { type: "status", message: "Searching verified townships in database..." };
          } else if (fnName === "get_project_plot_sizes" || fnName === "search_inventory_by_size") {
            yield { type: "status", message: "Retrieving official plot sizes and demarcated units..." };
          } else if (fnName === "get_project_details") {
            yield { type: "status", message: "Loading RERA, master plan, and connectivity details..." };
          } else if (fnName === "get_unit_availability") {
            yield { type: "status", message: "Checking live inventory availability..." };
          } else if (fnName === "compare_projects") {
            yield { type: "status", message: "Comparing verified project records side by side..." };
          } else if (fnName === "create_lead" || fnName === "request_site_visit") {
            yield { type: "status", message: "Registering request in secure CRM system..." };
          }

          const { result } = await dispatchToolCall(fnName, fnArgs);

          // Collect project cards
          if (fnName === "search_projects" && result?.projects) {
            for (const p of result.projects) {
              collectedProjectCards.set(p.slug, p);
            }
          } else if (fnName === "get_project_details" && result?.found) {
            collectedProjectCards.set(result.slug, {
              id: result.id,
              title: result.title,
              slug: result.slug,
              locality: result.locality,
              city: result.city,
              propertyType: result.propertyType,
              sizeRange: result.area?.displayRange || "Demarcated Plots",
              priceLabel: result.pricing?.startingPrice || "Price on Request",
              primaryImageUrl: result.mediaGallery?.[0]?.url || null,
              reraNumber: result.rera?.registrationNumber || null,
              url: result.url,
            });
          } else if (fnName === "get_project_plot_sizes" && result?.found) {
            collectedProjectCards.set(result.slug, {
              id: result.projectId,
              title: result.title,
              slug: result.slug,
              locality: result.locality,
              city: result.city,
              propertyType: result.propertyType,
              sizeRange: result.advertisedRange || "Demarcated Plots",
              priceLabel: result.pricing || "Price on Request",
              primaryImageUrl: null,
              reraNumber: result.rera?.registrationNumber || null,
              url: `/properties/${result.slug}`,
            });
          } else if (fnName === "search_inventory_by_size" && result?.matchingProjects) {
            for (const mp of result.matchingProjects) {
              collectedProjectCards.set(mp.slug, {
                id: mp.projectId,
                title: mp.title,
                slug: mp.slug,
                locality: mp.locality,
                city: mp.city,
                propertyType: mp.propertyType,
                sizeRange: `${result.requestedCriteria?.minPlotSizeSqYd || mp.optionsCount} Plots`,
                priceLabel: "Price on Request",
                primaryImageUrl: null,
                reraNumber: null,
                url: `/properties/${mp.slug}`,
              });
            }
          }

          if ((fnName === "create_lead" || fnName === "request_site_visit") && result?.referenceNumber) {
            generatedReferenceNumber = result.referenceNumber;
            yield { type: "ref", referenceNumber: result.referenceNumber };
          }

          // Push tool response
          openAiMessages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(result),
          } as ChatCompletionToolMessageParam);
        }

        // Emit updated cards if any
        if (collectedProjectCards.size > 0) {
          yield {
            type: "cards",
            projectCards: Array.from(collectedProjectCards.values()).slice(0, 4),
          };
        }

        // Continue loop to allow model to stream its natural reply using tool data
        continue;
      }

      // No tools called in this iteration; stream is finished!
      const finalCards = Array.from(collectedProjectCards.values()).slice(0, 4);
      yield {
        type: "done",
        fullReply: accumulatedContent,
        projectCards: finalCards.length > 0 ? finalCards : undefined,
        referenceNumber: generatedReferenceNumber,
      };
      return;
    }

    // Safety fallback if loop limit reached
    const cards = Array.from(collectedProjectCards.values()).slice(0, 4);
    yield {
      type: "done",
      fullReply: "I've retrieved the details from our database. How else can I assist with your property search?",
      projectCards: cards.length > 0 ? cards : undefined,
      referenceNumber: generatedReferenceNumber,
    };
  } catch (error: any) {
    logger.error("Streaming Chatbot error", {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      clientIp,
    });

    if (error?.status === 429 || error?.code === "insufficient_quota") {
      yield {
        type: "error",
        error: "Quota / rate limit reached.",
        reply:
          "Our AI advisor is currently experiencing high demand. Please try again in a few moments, or feel free to message Suresh Ratiwal directly on WhatsApp at +91 99295 33436.",
      };
    } else {
      yield {
        type: "error",
        error: error?.message || "Internal streaming error.",
        reply:
          "I encountered a temporary connection issue while querying the project database. Please tap retry or ask again.",
      };
    }
  }
}
