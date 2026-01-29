import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildKnowledgeContext } from "@/lib/knowledge/buildKnowledgeContext";

export async function POST(req: NextRequest) {
  const { botId, message, history } = await req.json();

  if (!botId || !message) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: bot, error: botError } = await supabase
    .from("bots" as any)
    .select("id, name, tone, model, fallback_behavior, system_prompt")
    .eq("id", botId)
    .single();

  if (botError || !bot) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  const botData = bot as any;

  const { data: sources } = await supabase
    .from("knowledge_sources" as any)
    .select("name, type, status, doc_url")
    .eq("bot_id", botId)
    .neq("status", "failed")
    .order("created_at", { ascending: false });

  const { contextText } = await buildKnowledgeContext(
    ((sources as any[]) ?? []) as any,
  );

  const system = `
You are an AI assistant for "${botData.name}".

Instructions (from bot configuration):
${botData.system_prompt || "Be helpful and concise."}

Rules:
- Use the knowledge context below to answer.
- If you cannot find the answer in the knowledge, reply with: "${
    botData.fallback_behavior || "Sorry, I could not answer that."
  }"

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
  });

  return NextResponse.json({ answer: text });
}
