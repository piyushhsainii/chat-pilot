import { createClient } from "@/lib/supabase/server";

export async function getWorkspaceData(userId: string) {
  const supabase = await createClient();

  const [{ data: workspaces }, { data: bots }] = await Promise.all([
    supabase
      .from("workspace_users")
      .select("*,workspaces(*)")
      .eq("auth_user_id", userId)
      .single(),

    supabase
      .from("bots")
      .select("*, widgets(*), bot_settings(*)")
      .eq("owner_id", userId),
  ]);

  return {
    workspaces,
    bots: bots,
  };
}
