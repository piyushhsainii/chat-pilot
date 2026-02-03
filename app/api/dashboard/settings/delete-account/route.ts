import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Find user-owned bots (used for cleanup + connector scoping).
  const { data: bots, error: botsError } = await admin
    .from("bots")
    .select("id")
    .eq("owner_id", user.id);

  if (botsError) return NextResponse.json({ error: "db_error" }, { status: 500 });
  const botIds = ((bots as any[]) ?? []).map((b: any) => String(b.id));

  // Find workspaces owned by user.
  const { data: workspaces, error: wsError } = await admin
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id);

  if (wsError) return NextResponse.json({ error: "db_error" }, { status: 500 });
  const workspaceIds = ((workspaces as any[]) ?? []).map((w: any) => String(w.id));

  try {
    // Delete dependent rows first (best-effort).
    if (botIds.length) {
      await admin.from("chat_logs" as any).delete().in("bot_id", botIds);
      await admin.from("chat_sessions" as any).delete().in("bot_id", botIds);
      await admin.from("credit_transactions" as any).delete().in("bot_id", botIds);
      await admin.from("rate_limits" as any).delete().in("bot_id", botIds);
      await admin.from("documents" as any).delete().in("bot_id", botIds);
      await admin.from("knowledge_sources" as any).delete().in("bot_id", botIds);
    }

    // Delete bots (widgets/bot_settings should cascade or be cleaned up by DB).
    await admin.from("bots" as any).delete().eq("owner_id", user.id);

    // Workspace scoped cleanup.
    if (workspaceIds.length) {
      await admin
        .from("workspace_connectors" as any)
        .delete()
        .in("workspace_id", workspaceIds);
      await admin
        .from("workspace_users" as any)
        .delete()
        .in("workspace_id", workspaceIds);
      await admin
        .from("workspaces" as any)
        .delete()
        .in("id", workspaceIds);
    }

    // User-specific cleanup.
    await admin.from("credit_transactions" as any).delete().eq("user_id", user.id);
    await admin.from("user_credits" as any).delete().eq("user_id", user.id);
    await admin.from("workspace_users" as any).delete().eq("auth_user_id", user.id);
    await admin.from("chat_sessions" as any).delete().eq("user_id", user.id);

    // Finally remove auth user.
    const { error: authErr } = await admin.auth.admin.deleteUser(user.id);
    if (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to delete account" },
      { status: 500 },
    );
  }
}
