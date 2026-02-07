import { NextRequest, NextResponse } from "next/server";
import { streamText, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildKnowledgeContextForQuery } from "@/lib/knowledge/buildKnowledgeContextForQuery";
import { consumeCreditsForOwner, getOwnerCreditsPrivileged } from "@/lib/billing/credits";
import { insertChatLog } from "@/lib/analytics/chatLogs";
import { buildBotTools } from "@/lib/tools/buildBotTools";

type WidgetMessageBody = {
  botId?: string;
  bot_id?: string;
  session_id?: string;
  sessionId?: string;
  message?: string;
  history?: Array<{ role?: string; content?: string; text?: string }>;
  stream?: boolean;
  testMode?: boolean;
};

type RateLimitRow = {
  id: string;
  bot_id: string;
  ip: string;
  count: number;
  window_start: string;
};

async function checkRateLimitWithAdmin(
  admin: ReturnType<typeof createAdminClient>,
  botId: string,
  ip: string,
  limit: number,
): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 60_000);

  const { data } = await admin
    .from("rate_limits")
    .select("*")
    .eq("bot_id", botId)
    .eq("ip", ip)
    .maybeSingle<RateLimitRow>();

  if (!data) {
    await admin.from("rate_limits").insert({
      bot_id: botId,
      ip,
      count: 1,
      window_start: now.toISOString(),
    });
    return true;
  }

  const currentWindowStart = new Date(data.window_start);

  if (currentWindowStart < windowStart) {
    await admin
      .from("rate_limits")
      .update({ count: 1, window_start: now.toISOString() })
      .eq("id", data.id);
    return true;
  }

  if (data.count >= limit) return false;

  await admin
    .from("rate_limits")
    .update({ count: data.count + 1 })
    .eq("id", data.id);

  return true;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as WidgetMessageBody | null;

  const urlBotId = req.nextUrl.searchParams.get("botId") || req.nextUrl.searchParams.get("bot_id");

  const session_id = body?.session_id ?? body?.sessionId;
  const bodyBotId = body?.botId ?? body?.bot_id ?? urlBotId ?? undefined;
  const message = body?.message;
  const history = body?.history;
  const stream = Boolean(body?.stream);
  const testMode = Boolean(body?.testMode);

  if (!message || (!session_id && !bodyBotId)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const admin = createAdminClient();

  // 1) Resolve bot_id (prefer session, fallback to explicit botId)
  let resolvedSessionId = session_id || null;
  let resolvedBotId: string | null = null;

  if (resolvedSessionId) {
    const { data: session } = await admin
      .from("chat_sessions")
      .select("id, bot_id")
      .eq("id", resolvedSessionId)
      .maybeSingle();

    if (session?.bot_id) {
      resolvedBotId = String(session.bot_id);
    } else {
      // Session missing/expired; fall back to botId from the widget script.
      resolvedSessionId = null;
    }
  }

  if (!resolvedBotId && bodyBotId) {
    resolvedBotId = String(bodyBotId);

    // Create an anonymous session if client didn't provide one.
    const { data: created } = await admin
      .from("chat_sessions")
      .insert({ bot_id: resolvedBotId, is_anonymous: true })
      .select("id")
      .single();

    resolvedSessionId = created?.id ?? null;
  }

  if (!resolvedBotId) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  const sessionHeader: Record<string, string> = resolvedSessionId
    ? { "x-chatpilot-session-id": resolvedSessionId }
    : {};

  // 2. Load bot + settings
  const { data: bot } = await admin
    .from("bots")
    .select("id, name, owner_id, tone, model, system_prompt, fallback_behavior")
    .eq("id", resolvedBotId)
    .single();

  const { data: settings } = await admin
    .from("bot_settings" as any)
    .select("rate_limit, rate_limit_hit_message")
    .eq("bot_id", resolvedBotId)
    .maybeSingle();

  if (!testMode) {
    const rateLimit = (settings as any)?.rate_limit ?? 20;
    const allowed = await checkRateLimitWithAdmin(admin, resolvedBotId, ip, rateLimit);
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
            ...sessionHeader,
          },
        });
      }

      return NextResponse.json(
        {
          role: "assistant",
          content: hitMessage,
        },
        { status: 429, headers: sessionHeader },
      );
    }
  }

  const ownerId = (bot as any)?.owner_id as string | undefined;

  // If owner_id is missing (older rows / imported bots), don't hard-fail widget chat.
  // We simply skip credit gating/charging.
  if (ownerId) {
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
            ...sessionHeader,
          },
        });
      }

      return NextResponse.json(
        { role: "assistant", content: hitMessage },
        { status: 402, headers: sessionHeader },
      );
    }
  }

  // 3. Load knowledge
  const { data: sources } = await admin
    .from("knowledge_sources" as any)
    .select("name, type, status, doc_url")
    .eq("bot_id", resolvedBotId)
    .neq("status", "failed")
    .order("created_at", { ascending: false });

  const { contextText } = await buildKnowledgeContextForQuery(admin as any, {
    botId: resolvedBotId,
    query: String(message),
    sources: ((sources as any[]) ?? []) as any,
  });

  const appsUsed = new Set<string>();
  const { tools, toolInstruction } = await buildBotTools({
    botId: resolvedBotId,
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

    if (!testMode && ownerId) {
      await Promise.allSettled([
        insertChatLog({
          botId: resolvedBotId,
          question: String(message),
          answer: text,
          environment: "widget",
          metadata: { session_id: resolvedSessionId, ip, apps_used: Array.from(appsUsed) },
        }),
        consumeCreditsForOwner({
          ownerId,
          botId: resolvedBotId,
          amount: 1,
          reason: "widget_message",
        }),
      ]);
    } else if (!testMode) {
      await Promise.allSettled([
        insertChatLog({
          botId: resolvedBotId,
          question: String(message),
          answer: text,
          environment: "widget",
          metadata: { session_id: resolvedSessionId, ip, apps_used: Array.from(appsUsed) },
        }),
      ]);
    }

    return NextResponse.json(
      { role: "assistant", content: text },
      { headers: sessionHeader },
    );
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

    await Promise.allSettled(
      ownerId
        ? [
            insertChatLog({
              botId: resolvedBotId,
              question: String(message),
              answer: fullAnswer,
              environment: "widget_stream",
              metadata: {
                session_id: resolvedSessionId,
                ip,
                apps_used: Array.from(appsUsed),
                ...(meta ?? {}),
              },
            }),
            consumeCreditsForOwner({
              ownerId,
              botId: resolvedBotId,
              amount: 1,
              reason: "widget_message_stream",
            }),
          ]
        : [
            insertChatLog({
              botId: resolvedBotId,
              question: String(message),
              answer: fullAnswer,
              environment: "widget_stream",
              metadata: {
                session_id: resolvedSessionId,
                ip,
                apps_used: Array.from(appsUsed),
                ...(meta ?? {}),
              },
            }),
          ],
    );
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
      ...sessionHeader,
    },
  });
}
