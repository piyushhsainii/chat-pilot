import { NextResponse } from "next/server";

import { requireAuthedSession } from "../_lib";

export const runtime = "nodejs";

export async function GET() {
  const { supabase, user, workspaceId } = await requireAuthedSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!workspaceId) return NextResponse.json({ error: "no_workspace" }, { status: 400 });

  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("workspace_connectors" as any)
    .select("google_refresh_token, google_scopes, bot_ids, tool_instructions, created_at")
    .eq("workspace_id", workspaceId)
    .eq("provider", "google_calendar")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  return NextResponse.json({
    connected: Boolean((data as any)?.google_refresh_token),
    scopes: ((data as any)?.google_scopes as string[] | null) || undefined,
    botIds: ((data as any)?.bot_ids as string[] | null) || null,
    toolInstructions: (data as any)?.tool_instructions || null,
    connectedAt: (data as any)?.created_at || null,
  });
}

export async function POST(req: Request) {
  const { supabase, user, workspaceId } = await requireAuthedSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!workspaceId) return NextResponse.json({ error: "no_workspace" }, { status: 400 });

  const body = (await req.json().catch(() => null)) as
    | { botIds?: string[] | null; toolInstructions?: string | null }
    | null;

  const botIds = Array.isArray(body?.botIds)
    ? body?.botIds.map(String).filter(Boolean)
    : body?.botIds === null
      ? null
      : undefined;

  const toolInstructionsRaw = body?.toolInstructions;
  const toolInstructions =
    toolInstructionsRaw === null
      ? null
      : typeof toolInstructionsRaw === "string"
        ? toolInstructionsRaw.trim().slice(0, 4000) || null
        : undefined;

  if (botIds === undefined && toolInstructions === undefined) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  if (botIds && botIds.length) {
    const { data: owned, error: ownedError } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("bots" as any)
      .select("id")
      .eq("owner_id", user.id)
      .in("id", botIds);

    if (ownedError) return NextResponse.json({ error: "db_error" }, { status: 500 });

    const ownedIds = new Set(((owned as any[]) ?? []).map((b: any) => String(b.id)));
    for (const id of botIds) {
      if (!ownedIds.has(String(id))) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
    }
  }

  const update: any = {};
  if (botIds !== undefined) update.bot_ids = botIds;
  if (toolInstructions !== undefined) update.tool_instructions = toolInstructions;

  const { error: updateError } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("workspace_connectors" as any)
    .update(update)
    .eq("workspace_id", workspaceId)
    .eq("provider", "google_calendar");

  if (updateError) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const { supabase, user, workspaceId } = await requireAuthedSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!workspaceId) return NextResponse.json({ error: "no_workspace" }, { status: 400 });

  const { error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("workspace_connectors" as any)
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("provider", "google_calendar");

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
