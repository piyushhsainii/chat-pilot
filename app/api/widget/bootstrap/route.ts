import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId");

  if (!botId) {
    return NextResponse.json({ error: "Missing botId" }, { status: 400 });
  }

  const supabase = await createClient();

  // 1. Load bot
  const { data: bot } = await supabase
    .from("bots")
    .select("id, name, owner_id, tone, avatar_url")
    .eq("id", botId)
    .single();
  if (!bot) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  // 2. Load settings + widget
  const [{ data: settings }, { data: widget }] = await Promise.all([
    supabase.from("bot_settings").select("*").eq("bot_id", botId).single(),

    supabase.from("widgets").select("*").eq("bot_id", botId).single(),
  ]);

  const { count: sourcesCount } = await supabase
    .from("knowledge_sources" as any)
    .select("id", { count: "exact", head: true })
    .eq("bot_id", botId)
    .neq("status", "failed");

  // 3. Create anonymous session
  const { data: session } = await supabase
    .from("chat_sessions")
    .insert({
      bot_id: botId,
      is_anonymous: true,
    })
    .select("id")
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({
    session_id: session.id,
    bot: {
      id: bot.id,
      name: bot.name,
      tone: (bot as any)?.tone ?? null,
      avatar_url: (bot as any)?.avatar_url ?? null,
    },
    widget: {
      title: widget?.title ?? "AI Assistant",
      greeting: widget?.greeting_message,
      theme: widget?.theme,
      primary_color: widget?.primary_color,
      button_color: widget?.button_color,
      text_color: widget?.text_color,
    },
    limits: {
      rate_limit: settings?.rate_limit ?? 60,
      rate_limit_hit_message: settings?.rate_limit_hit_message,
    },
    knowledge: {
      sources_count: sourcesCount ?? 0,
    },
  });
}
