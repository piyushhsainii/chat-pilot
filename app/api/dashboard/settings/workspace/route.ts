import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { name?: string } | null;
  const name = (body?.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Invalid name" }, { status: 400 });

  const { data: workspaceUser, error: wuError } = await supabase
    .from("workspace_users")
    .select("workspace_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (wuError) return NextResponse.json({ error: "db_error" }, { status: 500 });

  const workspaceId = (workspaceUser as any)?.workspace_id as string | undefined;
  if (!workspaceId) return NextResponse.json({ error: "no_workspace" }, { status: 400 });

  const { data: ws, error: wsError } = await supabase
    .from("workspaces")
    .select("id,owner_id")
    .eq("id", workspaceId)
    .maybeSingle();

  if (wsError) return NextResponse.json({ error: "db_error" }, { status: 500 });
  if (!ws || (ws as any).owner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error: updateError } = await supabase
    .from("workspaces")
    .update({ name })
    .eq("id", workspaceId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
