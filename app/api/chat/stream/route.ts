import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildKnowledgeContextForQuery } from "@/lib/knowledge/buildKnowledgeContextForQuery";
import {
  consumeCreditsForOwner,
  getOwnerCreditsPrivileged,
  isOutOfCreditsError,
} from "@/lib/billing/credits";
import { insertChatLog } from "@/lib/analytics/chatLogs";
import { checkRateLimit } from "@/lib/checkrateLimit";
import { buildBotTools } from "@/lib/tools/buildBotTools";

function parseTestMode(v: unknown) {
  return v === true || v === "true" || v === 1 || v === "1";
}

export async function POST(req: NextRequest) {
  try {
    const debugCredits = process.env.DEBUG_CREDITS === "1";
    const body = await req.json();
    const { botId, query, history } = body;
    const testMode = parseTestMode(body?.testMode);

    if (!botId || !query) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const authedUserId = session?.user?.id ?? null;

    const { data: bot, error: botError } = await supabase
      .from("bots")
      .select("*")
      .eq("id", botId)
      .single();

    if (botError || !bot) {
      return new Response(JSON.stringify({ error: "Bot not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const botData = bot as any;

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!testMode) {
      const { data: settings } = await supabase
        .from("bot_settings" as any)
        .select("rate_limit, rate_limit_hit_message")
        .eq("bot_id", botId)
        .maybeSingle();

      const rateLimit = (settings as any)?.rate_limit ?? 20;
      const allowed = await checkRateLimit(botId, ip, rateLimit);
      if (!allowed) {
        const hitMessage =
          (settings as any)?.rate_limit_hit_message ||
          "Too many requests. Please slow down.";

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ content: hitMessage })}\n\n`,
              ),
            );
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          },
        });

        return new Response(stream, {
          status: 429,
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }
    }

    const ownerId = botData.owner_id as string | undefined;
    let chargedBalance: number | null = null;
    // Always charge the bot owner when available (widget/public usage).
    // Fall back to the authenticated caller only if owner_id is missing.
    const chargeUserId = ownerId || authedUserId || null;
    if (debugCredits) {
      // eslint-disable-next-line no-console
      console.info("[chat-stream] request", {
        botId,
        ownerId: ownerId ?? null,
        authedUserId,
        chargeUserId,
        testMode: Boolean(testMode),
      });
    }

    // Debit credits BEFORE calling the LLM.
    // Prefer debiting the authenticated user (dashboard usage), fall back to bot owner.
    if (!testMode && chargeUserId) {
      try {
        const nextBalance = await consumeCreditsForOwner({
          ownerId: chargeUserId,
          botId,
          amount: 1,
          reason: "dashboard_stream",
        });
        chargedBalance = typeof nextBalance === "number" ? nextBalance : null;
        if (debugCredits) {
          // eslint-disable-next-line no-console
          console.info("[chat-stream] precharge ok", { chargeUserId, nextBalance });
        }
      } catch (err) {
        if (debugCredits) {
          // eslint-disable-next-line no-console
          console.info("[chat-stream] precharge failed", {
            chargeUserId,
            err: String((err as any)?.message ?? err),
          });
        }
        const hitMessage = isOutOfCreditsError(err)
          ? "This agent is temporarily unavailable (no credits)."
          : "Failed to consume credits.";

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: hitMessage })}\n\n`),
            );
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          },
        });

        return new Response(stream, {
          status: isOutOfCreditsError(err) ? 402 : 500,
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }
    }

    const { data: sources } = await supabase
      .from("knowledge_sources" as any)
      .select("name, type, status, doc_url")
      .eq("bot_id", botId)
      .or("status.is.null,status.neq.failed")
      .order("created_at", { ascending: false });

    const { contextText } = await buildKnowledgeContextForQuery(supabase as any, {
      botId,
      query: String(query),
      sources: ((sources as any[]) ?? []) as any,
    });

    const appsUsed = new Set<string>();
    const { tools, toolInstruction } = await buildBotTools({
      botId,
      testMode: Boolean(testMode),
      requestIp: ip,
      onToolUsed: (evt) => {
        if (evt.ok && evt.provider) appsUsed.add(evt.provider);
      },
    });

    const systemInstruction = `
 You are an AI assistant for "${botData.name}".
 Tone: ${botData.tone || "professional"}

Instructions (from bot configuration):
${botData.system_prompt || "Be helpful and concise."}

 Rules:
 - Use the knowledge context below to answer.
 - If you cannot find the answer in the knowledge, reply with: "${
       botData.fallback_behavior || "Sorry, I could not answer that."
     }"

 ${toolInstruction ? `${toolInstruction}\n` : ""}

 ${contextText}
 `.trim();

    const normalizedHistory = Array.isArray(history)
      ? history
          .slice(-12)
          .map((m: any) => ({
            role: m.role === "bot" ? "assistant" : "user",
            content: String(m.text ?? ""),
          }))
          .filter((m: any) => m.content.trim().length > 0)
      : [];

    const messages = [
      { role: "system", content: systemInstruction },
      ...normalizedHistory,
      { role: "user", content: String(query) },
    ] as any;

    const result = await streamText({
      model: openai(botData.model || "gpt-4o-mini"),
      messages,
      temperature: 0.1,
      tools: Object.keys(tools).length ? tools : undefined,
    });

    let fullAnswer = "";
    let finalized = false;

    const finalize = async (meta?: Record<string, any>) => {
      if (finalized) return;
      finalized = true;

      if (testMode) return;

      const logPromise = insertChatLog({
        botId,
        question: String(query),
        answer: fullAnswer,
        environment: "dashboard_stream",
        metadata: { ip, apps_used: Array.from(appsUsed), ...(meta ?? {}) },
      });

      await Promise.allSettled([logPromise]);
    };

    // Create a readable stream for SSE (Server-Sent Events)
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const textPart of result.textStream) {
            if (!textPart) continue;

            fullAnswer += textPart;

            const data = JSON.stringify({ content: textPart });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          // Send done signal
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();

          await finalize();
        } catch (error) {
          await finalize({ stream_error: String((error as any)?.message ?? error) });
          controller.error(error);
        }
      },
      async cancel(reason) {
        await finalize({ cancelled: true, reason: String(reason ?? "") });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        ...(chargedBalance === null
          ? {}
          : { "x-chatpilot-owner-credits-balance": String(chargedBalance) }),
      },
    });
  } catch (error) {
    console.error("Error in chat stream:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
