import { createAdminClient } from "@/lib/supabase/admin";

export type WorkspaceConnector = {
  provider: string;
  bot_ids?: string[] | null;

  google_access_token?: string | null;
  google_access_token_expires_at?: string | null;
  google_refresh_token?: string | null;
  google_scopes?: string[] | null;

  calendly_api_token?: string | null;
  calendly_scheduling_url?: string | null;

  tool_instructions?: string | null;
};

export async function getConnectorsForBot({
  botId,
  workspaceId,
}: {
  botId: string;
  workspaceId: string;
}) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("workspace_connectors")
    .select(
      "provider,bot_ids,tool_instructions,google_access_token,google_access_token_expires_at,google_refresh_token,google_scopes,calendly_api_token,calendly_scheduling_url",
    )
    .eq("workspace_id", workspaceId);

  if (error) throw error;

  const rows = ((data as any[]) ?? []) as WorkspaceConnector[];
  return rows.filter((r) => {
    const scoped = r.bot_ids;
    if (!Array.isArray(scoped) || scoped.length === 0) return true;
    return scoped.includes(botId);
  });
}
