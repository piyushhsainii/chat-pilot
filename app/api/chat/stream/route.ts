import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildKnowledgeContextForQuery } from "@/lib/knowledge/buildKnowledgeContextForQuery";
import { consumeCreditsForOwner, getOwnerCreditsPrivileged } from "@/lib/billing/credits";
import { insertChatLog } from "@/lib/analytics/chatLogs";
import { checkRateLimit } from "@/lib/checkrateLimit";
import { buildBotTools } from "@/lib/tools/buildBotTools";

export async function POST(req: NextRequest) {
  try {
    const { botId, query, history, testMode } = await req.json();

    if (!botId || !query) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = await createClient();

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
    if (ownerId) {
      const ownerBalance = await getOwnerCreditsPrivileged(ownerId);
      if (ownerBalance !== null && ownerBalance <= 0) {
        return new Response(JSON.stringify({ error: "No credits" }), {
          status: 402,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const { data: sources } = await supabase
      .from("knowledge_sources" as any)
      .select("name, type, status, doc_url")
      .eq("bot_id", botId)
      .neq("status", "failed")
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

      const chargePromise = ownerId
        ? consumeCreditsForOwner({
            ownerId,
            botId,
            amount: 1,
            reason: "dashboard_stream",
          })
        : Promise.resolve(null);

      await Promise.allSettled([logPromise, chargePromise]);
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
