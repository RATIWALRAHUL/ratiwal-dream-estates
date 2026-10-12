import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  runChatbotConversation,
  runStreamingChatbotConversation,
  type ChatMessage,
} from "@/lib/ai/chatbot-service";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2500),
      })
    )
    .min(1)
    .max(20),
});

const MAX_BODY_BYTES = 32 * 1024; // 32 KB

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1"
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const clientIp = getClientIp(req);

  try {
    // 1. Content-Type verification
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Content-Type must be application/json." },
        { status: 415 }
      );
    }

    // 2. Body size check
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, error: "Request payload exceeds size limit (32 KB)." },
        { status: 413 }
      );
    }

    // 3. Rate limiting (20 requests per minute per IP)
    const rateLimitResult = await checkRateLimit(
      `chat:${clientIp}`,
      20,
      60 * 1000
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit reached. Please wait a moment before sending another message.",
        },
        { status: 429 }
      );
    }

    // 4. Parse JSON
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Malformed JSON payload." },
        { status: 400 }
      );
    }

    // 5. Zod schema validation
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid chat messages payload format.",
          details: parsed.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    // 6. Check if client requested streaming
    const searchParams = req.nextUrl.searchParams;
    const wantsStream = searchParams.get("stream") === "true";

    if (wantsStream) {
      try {
        const generator = runStreamingChatbotConversation(
          parsed.data.messages as ChatMessage[],
          clientIp
        );

        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
          async start(controller) {
            try {
              let streamedAny = false;
              for await (const event of generator) {
                if (event.type === "error") {
                  // If streaming failed early with provider tool format error, fallback to non-streaming execution
                  try {
                    const fallbackResult = await runChatbotConversation(
                      parsed.data.messages as ChatMessage[],
                      clientIp
                    );
                    if (fallbackResult.success) {
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({
                            type: "done",
                            fullReply: fallbackResult.reply,
                            projectCards: fallbackResult.projectCards,
                            referenceNumber: fallbackResult.referenceNumber,
                          })}\n\n`
                        )
                      );
                      controller.close();
                      return;
                    }
                  } catch {
                    // Ignore fallback error
                  }
                }

                streamedAny = true;
                const data = `data: ${JSON.stringify(event)}\n\n`;
                controller.enqueue(encoder.encode(data));
              }
              controller.close();
            } catch (err: any) {
              const errData = `data: ${JSON.stringify({ type: "error", error: err?.message || "Stream error" })}\n\n`;
              controller.enqueue(encoder.encode(errData));
              controller.close();
            }
          },
        });

        return new NextResponse(readableStream, {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
          },
        });
      } catch {
        // Fall through to non-streaming execution
      }
    }

    // 7. Non-streaming fallback
    const result = await runChatbotConversation(
      parsed.data.messages as ChatMessage[],
      clientIp
    );

    return NextResponse.json(result, {
      status: 200,
    });
  } catch (err: any) {
    logger.error("Unhandled error in /api/chat", {
      error: err?.message || err,
      clientIp,
    });

    return NextResponse.json(
      {
        success: false,
        reply: "We are currently experiencing a brief technical interruption. Please try again shortly.",
        error: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
