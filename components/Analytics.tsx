"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  Activity,
  Users,
  MessageSquare,
  Zap,
  Target,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  TrendingUp,
} from "lucide-react";

type AnalyticsPayload = {
  credits: { balance: number };
  totals: {
    apiCalls: number;
    botMessages: number;
    userMessages: number;
    botMessages30d: number;
    userMessages30d: number;
    sessions30d: number;
    toolActions30d: number;
    avgConfidence: number | null;
    resolvedRate: number | null;
  };
  series7d: { day: string; apiCalls: number }[];
  perBot: {
    botId: string;
    name: string;
    apiCalls30d: number;
    botMessages30d: number;
    avgConfidence30d: number | null;
    resolvedRate30d: number | null;
  }[];
  toolUsage30d: { provider: string; calls: number }[];
  recentSessions: {
    id: string;
    botId: string;
    botName: string;
    createdAt: string | null;
    isAnonymous: boolean;
  }[];
  recentLogs: {
    id: string;
    botId: string;
    botName: string;
    createdAt: string | null;
    environment: string | null;
    question: string;
    answer: string;
    sessionId: string | null;
    appsUsed: string[];
  }[];
};

function pct(n: number | null) {
  if (n === null) return "-";
  return `${Math.round(n * 1000) / 10}%`;
}

function truncate(s: string, n: number) {
  const v = String(s ?? "");
  if (v.length <= n) return v;
  return `${v.slice(0, Math.max(0, n - 1))}…`;
}

function fmtDate(s: string | null) {
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

const StatCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => {
  return (
    <Card className="group border border-slate-200/70 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {label}
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {value}
            </div>
          </div>
          <div className="shrink-0 rounded-lg border border-slate-200/70 bg-slate-50 p-2 text-slate-700 transition-colors duration-200 group-hover:bg-slate-100">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard/analytics", { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as AnalyticsPayload;
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load analytics");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const lowBalance = useMemo(() => {
    const bal = data?.credits.balance ?? 0;
    return bal <= 20;
  }, [data]);

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Card className="max-w-md border border-red-200 bg-red-50/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-red-900 font-medium">
                  Error Loading Analytics
                </CardTitle>
                <CardDescription className="text-red-700">{error}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Credits Balance",
      value: String(data.credits.balance),
      icon: <Zap className="h-4 w-4" />,
    },
    {
      label: "Active Sessions",
      value: String(data.totals.sessions30d),
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "API Calls",
      value: String(data.totals.apiCalls),
      icon: <Activity className="h-4 w-4" />,
    },
    {
      label: "Bot Replies",
      value: String(data.totals.botMessages30d),
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      label: "User Messages",
      value: String(data.totals.userMessages30d),
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      label: "Tool Actions",
      value: String(data.totals.toolActions30d),
      icon: <Target className="h-4 w-4" />,
    },
    {
      label: "Avg Confidence",
      value:
        data.totals.avgConfidence === null
          ? "-"
          : `${Math.round(data.totals.avgConfidence * 10) / 10}`,
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      label: "Resolved Rate",
      value: pct(data.totals.resolvedRate),
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-500">Dashboard</div>
          <h1 className="text-2xl font-medium tracking-tight text-slate-900">
            Analytics
          </h1>
          <div className="text-sm text-slate-600">
            Usage, sessions, and recent activity.
          </div>
        </div>
      </div>

      {/* Low Balance Alert */}
      {lowBalance && (
        <Card className="border border-amber-200/70 bg-amber-50/40 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg border border-amber-200 bg-amber-100/60 p-2 text-amber-800">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-amber-900">
                  Low balance
                </div>
                <div className="mt-0.5 text-sm text-amber-900/80">
                  You have <span className="font-medium">{data.credits.balance}</span> credits remaining.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard
            key={i}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border border-slate-200/70 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium tracking-tight">API Calls</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-64">
                <ChartContainer config={{ apiCalls: { label: "API calls", color: "#475569" } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.series7d}>
                      <CartesianGrid vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                      />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="apiCalls" fill="#475569" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

        <Card className="border border-slate-200/70 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium tracking-tight">
                Per-Agent Usage
              </CardTitle>
              <CardDescription>Last 30 days (from saved chat logs)</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ScrollArea className="max-h-[320px] rounded-xl border border-slate-200/60">
                <Table className="min-w-[520px] table-fixed">
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow className="border-b border-slate-200/70">
                      <TableHead className="w-[40%] font-medium text-slate-600">
                        Agent
                      </TableHead>
                      <TableHead className="font-medium text-slate-600">API calls</TableHead>
                      <TableHead className="font-medium text-slate-600">Avg conf.</TableHead>
                      <TableHead className="font-medium text-slate-600">Resolved</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.perBot.map((b, idx) => (
                      <TableRow
                        key={b.botId}
                        className={`${idx % 2 ? "bg-slate-50/30" : "bg-white"} hover:bg-slate-50 transition-colors`}
                      >
                        <TableCell className="font-medium text-slate-900">
                          <div className="max-w-[260px] truncate" title={b.name}>
                            {b.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {b.apiCalls30d}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {b.avgConfidence30d === null
                            ? "-"
                            : `${Math.round(b.avgConfidence30d * 10) / 10}`}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {pct(b.resolvedRate30d)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
      </div>

      {/* Additional Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border border-slate-200/70 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium tracking-tight">Apps Used</CardTitle>
              <CardDescription>Last 30 days (tool usage)</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {!data.toolUsage30d.length ? (
                <div className="text-sm text-slate-600 py-8 text-center">
                  No tool actions recorded.
                </div>
              ) : (
                <ScrollArea className="max-h-[260px] rounded-xl border border-slate-200/60">
                  <Table className="min-w-[420px] table-fixed">
                    <TableHeader className="sticky top-0 bg-white">
                      <TableRow className="border-b border-slate-200/70">
                        <TableHead className="w-[70%] font-medium text-slate-600">App</TableHead>
                        <TableHead className="font-medium text-slate-600">Calls</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.toolUsage30d.map((r, idx) => (
                        <TableRow
                          key={r.provider}
                          className={`${idx % 2 ? "bg-slate-50/30" : "bg-white"} hover:bg-slate-50 transition-colors`}
                        >
                          <TableCell className="font-medium text-slate-900">
                            <div className="max-w-[320px] truncate" title={r.provider}>
                              {r.provider}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-700">
                            {r.calls}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

        <Card className="border border-slate-200/70 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium tracking-tight">Recent Sessions</CardTitle>
              <CardDescription>Last 25 widget sessions</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {!data.recentSessions.length ? (
                <div className="text-sm text-slate-600 py-8 text-center">
                  No sessions yet.
                </div>
              ) : (
                <ScrollArea className="max-h-[320px] rounded-xl border border-slate-200/60">
                  <Table className="min-w-[620px] table-fixed">
                    <TableHeader className="sticky top-0 bg-white">
                      <TableRow className="border-b border-slate-200/70">
                        <TableHead className="w-[30%] font-medium text-slate-600">Bot</TableHead>
                        <TableHead className="font-medium text-slate-600">Session</TableHead>
                        <TableHead className="font-medium text-slate-600">Type</TableHead>
                        <TableHead className="font-medium text-slate-600">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentSessions.map((s, idx) => (
                        <TableRow
                          key={s.id}
                          className={`${idx % 2 ? "bg-slate-50/30" : "bg-white"} hover:bg-slate-50 transition-colors`}
                        >
                          <TableCell className="font-medium text-slate-900">
                            <div className="max-w-[220px] truncate" title={s.botName}>
                              {s.botName}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-600">
                            {truncate(s.id, 10)}
                          </TableCell>
                          <TableCell className="text-slate-700">
                            {s.isAnonymous ? "Anon" : "Auth"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-slate-600 text-xs">
                            {fmtDate(s.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
      </div>

      <Card className="border border-slate-200/70 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium tracking-tight">Recent Chat Logs</CardTitle>
            <CardDescription>
              Last 25 messages saved in `chat_logs`
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {!data.recentLogs.length ? (
              <div className="text-sm text-slate-600 py-8 text-center">
                No chat logs yet.
              </div>
            ) : (
              <ScrollArea className="max-h-[520px] rounded-xl border border-slate-200/60">
                <Table className="min-w-[980px] table-fixed">
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow className="border-b border-slate-200/70">
                      <TableHead className="font-medium text-slate-600">Time</TableHead>
                      <TableHead className="font-medium text-slate-600">Bot</TableHead>
                      <TableHead className="font-medium text-slate-600">Env</TableHead>
                      <TableHead className="font-medium text-slate-600">Apps</TableHead>
                      <TableHead className="font-medium text-slate-600">User</TableHead>
                      <TableHead className="font-medium text-slate-600">Bot</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentLogs.map((l, idx) => (
                      <TableRow
                        key={l.id}
                        className={`${idx % 2 ? "bg-slate-50/30" : "bg-white"} hover:bg-slate-50 transition-colors`}
                      >
                        <TableCell className="whitespace-nowrap text-slate-600 text-xs">
                          {fmtDate(l.createdAt)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium text-slate-900">
                          {l.botName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-slate-700">
                          {l.environment ?? "-"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-slate-700">
                          <div
                            className="max-w-[220px] truncate"
                            title={l.appsUsed.length ? l.appsUsed.join(", ") : "-"}
                          >
                            {l.appsUsed.length ? l.appsUsed.join(", ") : "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[420px] whitespace-normal break-words text-slate-700">
                            {truncate(l.question, 120)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[460px] whitespace-normal break-words text-slate-700">
                            {truncate(l.answer, 140)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
    </div>
  )
}

export default Analytics;
