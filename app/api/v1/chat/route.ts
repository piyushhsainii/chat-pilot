import { NextRequest, NextResponse } from "next/server";
import { validateBot } from "@/lib/bot/validateBot";
import OpenAI from "openai";
import { checkRateLimit } from "@/lib/checkrateLimit";
import { createClient } from "@/lib/supabase/server";
import { buildKnowledgeContext } from "@/lib/knowledge/buildKnowledgeContext";

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 },
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const body = await req.json();
  const { botId, message } = body;

  if (!botId || !message) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const supabaseServer = await createClient();
  // 1️⃣ Validate bot + domain
  const bot = await validateBot(botId, req.headers.get("referer"));
  if (!bot) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // 2️⃣ Load settings
  const { data: settings } = await supabaseServer
    .from("bot_settings")
    .select("*")
    .eq("bot_id", botId)
    .single();

  const rateLimit = settings?.rate_limit ?? 20;

  // 3️⃣ Rate limit check
  const allowed = await checkRateLimit(botId, ip, rateLimit);

  if (!allowed) {
    return NextResponse.json(
      {
        answer:
          settings?.rate_limit_hit_message ||
          "Too many requests. Please slow down.",
      },
      { status: 429 },
    );
  }

  // 4️⃣ Build system prompt
  const { data: sources } = await supabaseServer
    .from("knowledge_sources" as any)
    .select("name, type, status, doc_url")
    .eq("bot_id", botId)
    .neq("status", "failed")
    .order("created_at", { ascending: false });

  const { contextText } = await buildKnowledgeContext(
    ((sources as any[]) ?? []) as any,
  );

  const systemPrompt = `
You are an AI assistant for "${bot.name}".

Instructions:
${bot.system_prompt || "Be helpful and concise."}

Rules:
- Use the knowledge context below to answer.
- If you cannot find the answer in the knowledge, reply with: "${
    bot.fallback_behavior || "Sorry, I could not answer that."
  }"

${contextText}
  `.trim();

  // 5️⃣ Call LLM
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ],
    temperature: 0.6,
  });

  const answer =
    completion.choices[0]?.message?.content ||
    bot.fallback_behavior ||
    "Sorry, I could not answer that.";

  // 6️⃣ Log conversation
  await supabaseServer.from("chat_logs").insert({
    bot_id: botId,
    question: message,
    answer,
  });

  return NextResponse.json({ answer });
}
