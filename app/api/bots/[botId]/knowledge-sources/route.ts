import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: any) {
  const params = await (ctx?.params ?? {});
  const botId = (params as any)?.botId as string | undefined;
  if (!botId) {
    return NextResponse.json({ error: "Missing botId" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: bot, error: botError } = await supabase
    .from("bots")
    .select("id,owner_id")
    .eq("id", botId)
    .maybeSingle();

  if (botError) {
    return NextResponse.json({ error: botError.message }, { status: 500 });
  }
  if (!bot) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }
  if (bot.owner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: sources, error: sourcesError } = await supabase
    .from("knowledge_sources" as any)
    .select("id,name,type,status,created_at,doc_url")
    .eq("bot_id", botId)
    .order("created_at", { ascending: false });

  if (sourcesError) {
    return NextResponse.json({ error: sourcesError.message }, { status: 500 });
  }

  return NextResponse.json({ sources: sources ?? [] });
}
