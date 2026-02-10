import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest, NextResponse } from "next/server";
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
  const debugCredits = process.env.DEBUG_CREDITS === "1";
  const body = await req.json().catch(() => null);
  const botId = body?.botId;
  const message = body?.message ?? body?.query;
  const history = body?.history;
  const testMode = parseTestMode(body?.testMode);

  if (!botId || !message) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const authedUserId = session?.user?.id ?? null;

  const { data: bot, error: botError } = await supabase
    .from("bots" as any)
    .select(
      "id, name, owner_id, tone, model, fallback_behavior, system_prompt, avatar_url",
    )
    .eq("id", botId)
    .single();

  if (botError || !bot) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
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
      return NextResponse.json(
        {
          answer:
            (settings as any)?.rate_limit_hit_message ||
            "Too many requests. Please slow down.",
        },
        { status: 429 },
      );
    }
  }

  const ownerId = botData.owner_id as string | undefined;
  let chargedBalance: number | null = null;
  // Always charge the bot owner when available (widget/public usage).
  // Fall back to the authenticated caller only if owner_id is missing.
  const chargeUserId = ownerId || authedUserId || null;
  if (debugCredits) {
    // eslint-disable-next-line no-console
    console.info("[chat] request", {
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
    // Consume a credit before calling the LLM so parallel requests can't
    // generate free responses.
    try {
      const nextBalance = await consumeCreditsForOwner({
        ownerId: chargeUserId,
        botId,
        amount: 1,
        reason: "dashboard_chat",
      });
      chargedBalance = typeof nextBalance === "number" ? nextBalance : null;
      if (debugCredits) {
        // eslint-disable-next-line no-console
        console.info("[chat] precharge ok", { chargeUserId, nextBalance });
      }
    } catch (err) {
      if (debugCredits) {
        // eslint-disable-next-line no-console
        console.info("[chat] precharge failed", {
          chargeUserId,
          err: String((err as any)?.message ?? err),
        });
      }
      if (isOutOfCreditsError(err)) {
        return NextResponse.json(
          { answer: "This agent is temporarily unavailable (no credits)." },
          { status: 402 },
        );
      }
      return NextResponse.json(
        { error: "Failed to consume credits" },
        { status: 500 },
      );
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
    query: String(message),
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

  const system = `
 You are an AI assistant for "${botData.name}".

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

  const { text } = await generateText({
    model: openai(botData.model || "gpt-4o-mini"),
    messages: [
      { role: "system", content: system },
      ...normalizedHistory,
      { role: "user", content: String(message) },
    ] as any,
    temperature: 0.1,
    tools: Object.keys(tools).length ? tools : undefined,
  });

  if (!testMode) {
    // Best-effort: chat should still respond even if logging fails.
    const logPromise = insertChatLog({
      botId,
      question: String(message),
      answer: text,
      environment: "dashboard_chat",
      metadata: { ip, apps_used: Array.from(appsUsed) },
    });

    await Promise.allSettled([logPromise]);
  }

  return NextResponse.json(
    { answer: text, credits_balance: chargedBalance },
    chargedBalance === null
      ? undefined
      : { headers: { "x-chatpilot-owner-credits-balance": String(chargedBalance) } },
  );
}
