import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  const { session_id, message } = await req.json();
  const openai = new OpenAI();
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
    .select("system_prompt")
    .eq("id", session.bot_id)
    .single();

  // 3. Load knowledge (stub for now)
  const knowledgeContext = ""; // ← plug your embeddings later

  // 4. Call LLM
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: bot?.system_prompt ?? "" },
      { role: "system", content: knowledgeContext },
      { role: "user", content: message },
    ],
  });

  const reply = completion.choices[0].message.content;

  return NextResponse.json({
    role: "assistant",
    content: reply,
  });
}
