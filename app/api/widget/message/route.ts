import { NextRequest, NextResponse } from "next/server";
import { streamText, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@/lib/supabase/server";
import { buildKnowledgeContextForQuery } from "@/lib/knowledge/buildKnowledgeContextForQuery";
import { consumeCreditsForOwner, getOwnerCreditsPrivileged } from "@/lib/billing/credits";
import { insertChatLog } from "@/lib/analytics/chatLogs";
import { checkRateLimit } from "@/lib/checkrateLimit";
import { buildBotTools } from "@/lib/tools/buildBotTools";

type WidgetMessageBody = {
  session_id?: string;
  sessionId?: string;
  message?: string;
  history?: Array<{ role?: string; content?: string; text?: string }>;
  stream?: boolean;
  testMode?: boolean;
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as WidgetMessageBody | null;

  const session_id = body?.session_id ?? body?.sessionId;
  const message = body?.message;
  const history = body?.history;
  const stream = Boolean(body?.stream);
  const testMode = Boolean(body?.testMode);

  if (!session_id || !message) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const supabase = await createClient();

  // 1. Validate session
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("bot_id, user_id")
    .eq("id", session_id)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  // 2. Load bot + settings
  const { data: bot } = await supabase
    .from("bots")
    .select("id, name, owner_id, tone, model, system_prompt, fallback_behavior")
    .eq("id", session.bot_id)
    .single();

  const { data: settings } = await supabase
    .from("bot_settings" as any)
    .select("rate_limit, rate_limit_hit_message")
    .eq("bot_id", session.bot_id)
    .maybeSingle();

  if (!testMode) {
    const rateLimit = (settings as any)?.rate_limit ?? 20;
    const allowed = await checkRateLimit(session.bot_id, ip, rateLimit);
    if (!allowed) {
      const hitMessage =
        (settings as any)?.rate_limit_hit_message ||
        "Too many requests. Please slow down.";

      if (stream) {
        const encoder = new TextEncoder();
        const rateLimitStream = new ReadableStream({
          start(controller) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: hitMessage })}\n\n`),
            );
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          },
        });

        return new Response(rateLimitStream, {
          status: 429,
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }

      return NextResponse.json(
        {
          role: "assistant",
          content: hitMessage,
        },
        { status: 429 },
      );
    }
  }

  const ownerId = (bot as any)?.owner_id as string | undefined;
  if (!ownerId) {
    return NextResponse.json({ error: "Bot owner not found" }, { status: 400 });
  }

  const ownerBalance = await getOwnerCreditsPrivileged(ownerId);
  if (ownerBalance !== null && ownerBalance <= 0) {
    const hitMessage = "This agent is temporarily unavailable (no credits).";

    if (stream) {
      const encoder = new TextEncoder();
      const noCreditsStream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: hitMessage })}\n\n`),
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(noCreditsStream, {
        status: 402,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    return NextResponse.json(
      { role: "assistant", content: hitMessage },
      { status: 402 },
    );
  }

  // 3. Load knowledge
  const { data: sources } = await supabase
    .from("knowledge_sources" as any)
    .select("name, type, status, doc_url")
    .eq("bot_id", session.bot_id)
    .neq("status", "failed")
    .order("created_at", { ascending: false });

  const { contextText } = await buildKnowledgeContextForQuery(supabase as any, {
    botId: session.bot_id,
    query: String(message),
    sources: ((sources as any[]) ?? []) as any,
  });

  const appsUsed = new Set<string>();
  const { tools, toolInstruction } = await buildBotTools({
    botId: session.bot_id,
    testMode,
    requestIp: ip,
    onToolUsed: (evt) => {
      if (evt.ok && evt.provider) appsUsed.add(evt.provider);
    },
  });

  const system = `
 You are an AI assistant for "${(bot as any)?.name || "this bot"}".
 Tone: ${(bot as any)?.tone || "professional"}

Instructions:
${(bot as any)?.system_prompt || "Be helpful and concise."}

Rules:
- Use the knowledge context below to answer.
 - If you cannot find the answer in the knowledge, reply with: "${
     (bot as any)?.fallback_behavior || "Sorry, I could not answer that."
   }"

 ${toolInstruction ? `${toolInstruction}\n` : ""}
 
 ${contextText}
 `.trim();

  const normalizedHistory = Array.isArray(history)
    ? history
        .slice(-12)
        .map((m: any) => ({
          role: m.role === "assistant" || m.role === "bot" ? "assistant" : "user",
          content: String(m.content ?? m.text ?? ""),
        }))
        .filter((m: any) => m.content.trim().length > 0)
    : [];

  const messages = [
    { role: "system", content: system },
    ...normalizedHistory,
    { role: "user", content: String(message) },
  ] as any;

  const model = openai((bot as any)?.model || "gpt-4o-mini");

  if (!stream) {
    const { text } = await generateText({
      model,
      messages,
      temperature: 0.1,
      tools: Object.keys(tools).length ? tools : undefined,
    });

    if (!testMode) {
      await Promise.allSettled([
        insertChatLog({
          botId: session.bot_id,
          question: String(message),
          answer: text,
          environment: "widget",
          metadata: { session_id, ip, apps_used: Array.from(appsUsed) },
        }),
        consumeCreditsForOwner({
          ownerId,
          botId: session.bot_id,
          amount: 1,
          reason: "widget_message",
        }),
      ]);
    }

    return NextResponse.json({ role: "assistant", content: text });
  }

  const result = await streamText({
    model,
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

    await Promise.allSettled([
      insertChatLog({
        botId: session.bot_id,
        question: String(message),
        answer: fullAnswer,
        environment: "widget_stream",
        metadata: { session_id, ip, apps_used: Array.from(appsUsed), ...(meta ?? {}) },
      }),
      consumeCreditsForOwner({
        ownerId,
        botId: session.bot_id,
        amount: 1,
        reason: "widget_message_stream",
      }),
    ]);
  };

  const streamBody = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        for await (const textPart of result.textStream) {
          if (!textPart) continue;
          fullAnswer += textPart;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: textPart })}\n\n`),
          );
        }

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

  return new Response(streamBody, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
