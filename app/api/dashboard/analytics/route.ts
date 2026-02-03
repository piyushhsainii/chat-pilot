import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatDay(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: bots, error: botsError } = await supabase
    .from("bots")
    .select("id,name")
    .eq("owner_id", user.id);

  if (botsError) return NextResponse.json({ error: botsError.message }, { status: 500 });

  const botIds = (bots ?? []).map((b) => b.id);
  const admin = createAdminClient();

  const creditsRes = await admin
    .from("user_credits")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();

  const creditsBalance = creditsRes.data?.balance ?? 0;

  if (botIds.length === 0) {
    return NextResponse.json({
      credits: { balance: creditsBalance },
      totals: {
        apiCalls: 0,
        botMessages: 0,
        userMessages: 0,
        botMessages30d: 0,
        userMessages30d: 0,
        sessions30d: 0,
        toolActions30d: 0,
        avgConfidence: null,
        resolvedRate: null,
      },
      series7d: [],
      perBot: [],
      toolUsage30d: [],
      recentSessions: [],
      recentLogs: [],
    });
  }

  const now = new Date();
  const start30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const start7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { data: logs30d, error: logsError } = await admin
    .from("chat_logs")
    .select("bot_id,created_at,confidence_score,resolved,metadata")
    .in("bot_id", botIds)
    .gte("created_at", start30d.toISOString())
    .order("created_at", { ascending: true });

  if (logsError) return NextResponse.json({ error: logsError.message }, { status: 500 });

  const { count: totalCallsAllTime, error: totalError } = await admin
    .from("chat_logs")
    .select("id", { head: true, count: "exact" })
    .in("bot_id", botIds);
  if (totalError) return NextResponse.json({ error: totalError.message }, { status: 500 });

  const totals = {
    apiCalls: totalCallsAllTime ?? 0,
    botMessages: (totalCallsAllTime ?? 0) * 1,
    userMessages: (totalCallsAllTime ?? 0) * 1,
    botMessages30d: (logs30d ?? []).length,
    userMessages30d: (logs30d ?? []).length,
    sessions30d: 0,
    toolActions30d: 0,
    avgConfidence: null as number | null,
    resolvedRate: null as number | null,
  };

  const { count: sessions30dCount, error: sessions30dError } = await admin
    .from("chat_sessions")
    .select("id", { head: true, count: "exact" })
    .in("bot_id", botIds)
    .gte("created_at", start30d.toISOString());
  if (sessions30dError) return NextResponse.json({ error: sessions30dError.message }, { status: 500 });
  totals.sessions30d = sessions30dCount ?? 0;

  let confSum = 0;
  let confCount = 0;
  let resolvedCount = 0;

  const toolUsageMap = new Map<string, number>();
  for (const l of logs30d ?? []) {
    if (typeof l.confidence_score === "number") {
      confSum += l.confidence_score;
      confCount += 1;
    }
    if (l.resolved) resolvedCount += 1;

    const apps = (l as any)?.metadata && typeof (l as any).metadata === "object"
      ? (l as any).metadata.apps_used
      : null;
    if (Array.isArray(apps)) {
      for (const app of apps) {
        if (typeof app !== "string" || !app) continue;
        totals.toolActions30d += 1;
        toolUsageMap.set(app, (toolUsageMap.get(app) ?? 0) + 1);
      }
    }
  }
  totals.avgConfidence = confCount ? confSum / confCount : null;
  totals.resolvedRate = logs30d?.length ? resolvedCount / logs30d.length : null;

  const perBotMap = new Map<
    string,
    {
      botId: string;
      name: string;
      calls30d: number;
      confSum: number;
      confCount: number;
      resolved: number;
    }
  >();

  for (const b of bots ?? []) {
    perBotMap.set(b.id, {
      botId: b.id,
      name: b.name ?? "Untitled",
      calls30d: 0,
      confSum: 0,
      confCount: 0,
      resolved: 0,
    });
  }

  for (const l of logs30d ?? []) {
    if (!l.bot_id) continue;
    const row = perBotMap.get(l.bot_id);
    if (!row) continue;
    row.calls30d += 1;
    if (typeof l.confidence_score === "number") {
      row.confSum += l.confidence_score;
      row.confCount += 1;
    }
    if (l.resolved) row.resolved += 1;
  }

  const perBot = Array.from(perBotMap.values()).map((r) => ({
    botId: r.botId,
    name: r.name,
    apiCalls30d: r.calls30d,
    botMessages30d: r.calls30d,
    avgConfidence30d: r.confCount ? r.confSum / r.confCount : null,
    resolvedRate30d: r.calls30d ? r.resolved / r.calls30d : null,
  }));

  // 7-day series (UTC day buckets)
  const buckets = new Map<string, number>();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    d.setUTCDate(d.getUTCDate() - i);
    buckets.set(formatDay(d), 0);
  }

  for (const l of logs30d ?? []) {
    const created = l.created_at ? new Date(l.created_at) : null;
    if (!created) continue;
    if (created < start7d) continue;
    const key = formatDay(created);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const series7d = Array.from(buckets.entries()).map(([day, apiCalls]) => ({
    day,
    apiCalls,
  }));

  const botNameById = new Map<string, string>();
  for (const b of bots ?? []) botNameById.set(b.id, b.name ?? "Untitled");

  const { data: recentSessions, error: recentSessionsError } = await admin
    .from("chat_sessions")
    .select("id,bot_id,created_at,is_anonymous,user_id")
    .in("bot_id", botIds)
    .order("created_at", { ascending: false })
    .limit(25);
  if (recentSessionsError) {
    return NextResponse.json({ error: recentSessionsError.message }, { status: 500 });
  }

  const { data: recentLogs, error: recentLogsError } = await admin
    .from("chat_logs")
    .select("id,bot_id,created_at,environment,question,answer,metadata")
    .in("bot_id", botIds)
    .order("created_at", { ascending: false })
    .limit(25);
  if (recentLogsError) {
    return NextResponse.json({ error: recentLogsError.message }, { status: 500 });
  }

  return NextResponse.json({
    credits: { balance: creditsBalance },
    totals,
    series7d,
    perBot,
    toolUsage30d: Array.from(toolUsageMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([provider, calls]) => ({ provider, calls })),
    recentSessions: (recentSessions ?? []).map((s: any) => ({
      id: s.id,
      botId: s.bot_id,
      botName: botNameById.get(s.bot_id) ?? "Untitled",
      createdAt: s.created_at,
      isAnonymous: Boolean(s.is_anonymous),
    })),
    recentLogs: (recentLogs ?? []).map((l: any) => ({
      id: l.id,
      botId: l.bot_id,
      botName: botNameById.get(l.bot_id) ?? "Untitled",
      createdAt: l.created_at,
      environment: l.environment,
      question: l.question,
      answer: l.answer,
      sessionId:
        l?.metadata && typeof l.metadata === "object" ? (l.metadata as any)?.session_id ?? null : null,
      appsUsed:
        l?.metadata && typeof l.metadata === "object" && Array.isArray((l.metadata as any)?.apps_used)
          ? ((l.metadata as any).apps_used as any[]).filter((x) => typeof x === "string")
          : [],
    })),
  });
}
