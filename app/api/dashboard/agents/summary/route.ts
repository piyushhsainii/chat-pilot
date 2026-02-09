import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CONNECTOR_LABELS: Record<string, string> = {
  google_calendar: "Google Calendar connected",
  calendly: "Calendly connected",
};

function isConnectorConnected(row: any) {
  const provider = String(row?.provider ?? "");
  if (provider === "google_calendar") {
    return !!(row?.google_refresh_token || row?.google_access_token);
  }
  if (provider === "calendly") {
    return !!row?.calendly_api_token && !!row?.calendly_scheduling_url;
  }
  return true;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  const [{ data: bots, error: botsError }, { data: workspaceUser, error: wsError }] =
    await Promise.all([
      admin.from("bots").select("id,name").eq("owner_id", user.id),
      admin
        .from("workspace_users")
        .select("workspace_id")
        .eq("auth_user_id", user.id)
        .maybeSingle(),
    ]);

  if (botsError) {
    return NextResponse.json({ error: botsError.message }, { status: 500 });
  }

  if (wsError) {
    return NextResponse.json({ error: wsError.message }, { status: 500 });
  }

  const botIds = (bots ?? []).map((b) => String((b as any)?.id ?? ""))
    .filter(Boolean);

  const connectorsByBot = new Map<string, string[]>();
  for (const id of botIds) connectorsByBot.set(id, []);

  if (workspaceUser?.workspace_id) {
    const { data: rows, error: connError } = await admin
      .from("workspace_connectors")
      .select(
        "provider,bot_ids,google_access_token,google_refresh_token,calendly_api_token,calendly_scheduling_url",
      )
      .eq("workspace_id", workspaceUser.workspace_id);

    if (connError) {
      return NextResponse.json({ error: connError.message }, { status: 500 });
    }

    for (const r of rows ?? []) {
      const provider = String((r as any)?.provider ?? "");
      if (!provider) continue;
      if (!isConnectorConnected(r)) continue;
      const label = CONNECTOR_LABELS[provider] ?? `${provider} connected`;

       const scopedBotIds = (r as any)?.bot_ids as string[] | null | undefined;
       const appliesTo = (Array.isArray(scopedBotIds) ? scopedBotIds : botIds).map(String);

       for (const botId of appliesTo) {
         const key = String(botId);
         const list = connectorsByBot.get(key);
         if (!list) continue;
         if (!list.includes(label)) list.push(label);
       }
     }
   }

  const perBotEntries = await Promise.all(
    botIds.map(async (botId) => {
      const botKey = String(botId);
      const { count, error } = await admin
        .from("chat_logs")
        .select("id", { head: true, count: "exact" })
        .eq("bot_id", botKey);

      if (error) {
        return [
          botKey,
          { totalMessages: 0, connectors: connectorsByBot.get(botKey) ?? [] },
        ] as const;
      }

      return [
        botKey,
        {
          // Each chat_logs row contains a user question and a bot answer.
          totalMessages: (count ?? 0) * 2,
          connectors: connectorsByBot.get(botKey) ?? [],
        },
      ] as const;
    }),
  );

  const perBot = Object.fromEntries(perBotEntries);

  return NextResponse.json(
    { perBot },
    { headers: { "Cache-Control": "no-store" } },
  );
}
