import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { buildKnowledgeContext } from "@/lib/knowledge/buildKnowledgeContext";

export async function POST(req: Request) {
  const { session_id, message } = await req.json();
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  if (!session_id || !message) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

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
    .select("id, name, system_prompt, fallback_behavior")
    .eq("id", session.bot_id)
    .single();

  // 3. Load knowledge
  const { data: sources } = await supabase
    .from("knowledge_sources" as any)
    .select("name, type, status, doc_url")
    .eq("bot_id", session.bot_id)
    .neq("status", "failed")
    .order("created_at", { ascending: false });

  const { contextText } = await buildKnowledgeContext(
    ((sources as any[]) ?? []) as any,
  );

  const system = `
You are an AI assistant for "${(bot as any)?.name || "this bot"}".

Instructions:
${(bot as any)?.system_prompt || "Be helpful and concise."}

Rules:
- Use the knowledge context below to answer.
- If you cannot find the answer in the knowledge, reply with: "${
    (bot as any)?.fallback_behavior || "Sorry, I could not answer that."
  }"

${contextText}
`.trim();

  // 4. Call LLM
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: message },
    ],
  });

  const reply = completion.choices[0].message.content;

  return NextResponse.json({
    role: "assistant",
    content: reply,
  });
}
