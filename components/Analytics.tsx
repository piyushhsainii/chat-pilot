"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  MessageSquare,
  Zap,
  Target,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const StatCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
}> = ({ label, value, icon, gradient, delay = 0 }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      // @ts-ignore
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group relative"
    >
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xs ${gradient}`}
      />
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-200/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                {label}
              </div>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: delay, type: "spring", stiffness: 200 }}
                className="text-3xl font-normal tracking-tight bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent"
              >
                {value}
              </motion.div>
            </div>
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: delay + 0.1, type: "spring", stiffness: 200 }}
              className={`p-3 rounded-xl ${gradient} shadow-lg`}
            >
              <div className="text-white">{icon}</div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[400px] flex items-center justify-center"
      >
        <Card className="max-w-md border-red-200 bg-red-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-red-900">Error Loading Analytics</CardTitle>
                <CardDescription className="text-red-700">{error}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="inline-block mb-4"
          >
            <Sparkles className="h-8 w-8 text-indigo-500" />
          </motion.div>
          <div className="text-sm font-semibold text-slate-600">Loading analytics...</div>
        </motion.div>
      </div>
    );
  }

  const stats = [
    {
      label: "Credits Balance",
      value: String(data.credits.balance),
      icon: <Zap className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-amber-400 to-orange-500",
    },
    {
      label: "Active Sessions",
      value: String(data.totals.sessions30d),
      icon: <Users className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-blue-400 to-indigo-500",
    },
    {
      label: "API Calls",
      value: String(data.totals.apiCalls),
      icon: <Activity className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-violet-400 to-purple-500",
    },
    {
      label: "Bot Replies",
      value: String(data.totals.botMessages30d),
      icon: <MessageSquare className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-emerald-400 to-teal-500",
    },
    {
      label: "User Messages",
      value: String(data.totals.userMessages30d),
      icon: <MessageSquare className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-cyan-400 to-blue-500",
    },
    {
      label: "Tool Actions",
      value: String(data.totals.toolActions30d),
      icon: <Target className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-pink-400 to-rose-500",
    },
    {
      label: "Avg Confidence",
      value:
        data.totals.avgConfidence === null
          ? "-"
          : `${Math.round(data.totals.avgConfidence * 10) / 10}`,
      icon: <TrendingUp className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-lime-400 to-green-500",
    },
    {
      label: "Resolved Rate",
      value: pct(data.totals.resolvedRate),
      icon: <CheckCircle2 className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-sky-400 to-blue-500",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-24"
    >
      {/* Header */}
      {/* @ts-ignore */}
      <motion.div variants={itemVariants} className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl" />
        <div className="relative flex flex-col gap-2">
          <div className="text-xs uppercase tracking-tight text-indigo-600">
            Dashboard Overview
          </div>
          <h1 className="text-3xl font-normal tracking-tight bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent">
            Analytics
          </h1>
        </div>
      </motion.div>

      {/* Low Balance Alert */}
      {lowBalance && (
        <motion.div

          /* @ts-ignore */
          variants={itemVariants}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-2xl blur-xl" />
          <div className="relative rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/50 p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg"
              >
                <AlertTriangle className="h-6 w-6 text-white" />
              </motion.div>
              <div className="flex-1">
                <div className="text-lg font-normal text-amber-900">Low Balance Alert</div>
                <div className="text-amber-800 mt-1">
                  You have{" "}
                  <span className="font-normal text-amber-900">{data.credits.balance}</span>{" "}
                  credits remaining. Each bot reply consumes 1 credit.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, i) => (
          <StatCard
            key={i}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            gradient={stat.gradient}
            delay={i * 0.05}
          />
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* @ts-ignore */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-white to-slate-50/50 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-black tracking-tight">API Calls</CardTitle>
              <CardDescription className="font-medium">Last 7 days activity</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="h-64">
                <ChartContainer config={{ apiCalls: { label: "API calls", color: "#6366f1" } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.series7d}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                      />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="apiCalls" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* @ts-ignore */}

        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-white to-slate-50/50">
            <CardHeader>
              <CardTitle className="text-xl font-black tracking-tight">Per-Agent Usage</CardTitle>
              <CardDescription className="font-medium">
                30 days; based on saved chat logs
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <ScrollArea className="max-h-[320px] rounded-xl border-2 border-slate-100/50">
                <Table className="min-w-[520px] table-fixed">
                  <TableHeader className="sticky top-0 bg-white/95 backdrop-blur-sm">
                    <TableRow className="hover:bg-white border-b-2 border-slate-100">
                      <TableHead className="w-[40%] font-black text-slate-700">Agent</TableHead>
                      <TableHead className="font-black text-slate-700">API calls</TableHead>
                      <TableHead className="font-black text-slate-700">Avg conf.</TableHead>
                      <TableHead className="font-black text-slate-700">Resolved</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.perBot.map((b, idx) => (
                      <motion.tr
                        key={b.botId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group hover:bg-indigo-50/50 transition-colors"
                      >
                        <TableCell className="font-bold text-slate-900">
                          <div className="max-w-[260px] truncate" title={b.name}>
                            {b.name}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-700">
                          {b.apiCalls30d}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-700">
                          {b.avgConfidence30d === null
                            ? "-"
                            : `${Math.round(b.avgConfidence30d * 10) / 10}`}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-700">
                          {pct(b.resolvedRate30d)}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Additional Tables Row */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* @ts-ignore */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-white to-slate-50/50">
            <CardHeader>
              <CardTitle className="text-xl font-black tracking-tight">Apps Used</CardTitle>
              <CardDescription className="font-medium">
                30 days; tool usage (Google Calendar / Calendly)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {!data.toolUsage30d.length ? (
                <div className="text-sm font-medium text-slate-500 py-8 text-center">
                  No tool actions recorded.
                </div>
              ) : (
                <ScrollArea className="max-h-[260px] rounded-xl border-2 border-slate-100/50">
                  <Table className="min-w-[420px] table-fixed">
                    <TableHeader className="sticky top-0 bg-white/95 backdrop-blur-sm">
                      <TableRow className="hover:bg-white border-b-2 border-slate-100">
                        <TableHead className="w-[70%] font-black text-slate-700">App</TableHead>
                        <TableHead className="font-black text-slate-700">Calls</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.toolUsage30d.map((r, idx) => (
                        <motion.tr
                          key={r.provider}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group hover:bg-emerald-50/50 transition-colors"
                        >
                          <TableCell className="font-bold text-slate-900">
                            <div className="max-w-[320px] truncate" title={r.provider}>
                              {r.provider}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700">
                            {r.calls}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>
        {/* @ts-ignore */}

        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-white to-slate-50/50">
            <CardHeader>
              <CardTitle className="text-xl font-black tracking-tight">
                Recent Sessions
              </CardTitle>
              <CardDescription className="font-medium">Last 25 widget sessions</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {!data.recentSessions.length ? (
                <div className="text-sm font-medium text-slate-500 py-8 text-center">
                  No sessions yet.
                </div>
              ) : (
                <ScrollArea className="max-h-[320px] rounded-xl border-2 border-slate-100/50">
                  <Table className="min-w-[620px] table-fixed">
                    <TableHeader className="sticky top-0 bg-white/95 backdrop-blur-sm">
                      <TableRow className="hover:bg-white border-b-2 border-slate-100">
                        <TableHead className="w-[30%] font-black text-slate-700">Bot</TableHead>
                        <TableHead className="font-black text-slate-700">Session</TableHead>
                        <TableHead className="font-black text-slate-700">Type</TableHead>
                        <TableHead className="font-black text-slate-700">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentSessions.map((s, idx) => (
                        <motion.tr
                          key={s.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group hover:bg-blue-50/50 transition-colors"
                        >
                          <TableCell className="font-bold text-slate-900">
                            <div className="max-w-[220px] truncate" title={s.botName}>
                              {s.botName}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs font-semibold text-slate-600">
                            {truncate(s.id, 10)}
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700">
                            {s.isAnonymous ? "Anon" : "Auth"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-medium text-slate-600 text-xs">
                            {fmtDate(s.createdAt)}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* @ts-ignore */}

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader>
            <CardTitle className="text-xl font-black tracking-tight">Recent Chat Logs</CardTitle>
            <CardDescription className="font-medium">
              Last 25 messages saved in `chat_logs`
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            {!data.recentLogs.length ? (
              <div className="text-sm font-medium text-slate-500 py-8 text-center">
                No chat logs yet.
              </div>
            ) : (
              <ScrollArea className="max-h-[520px] rounded-xl border-2 border-slate-100/50">
                <Table className="min-w-[980px] table-fixed">
                  <TableHeader className="sticky top-0 bg-white/95 backdrop-blur-sm">
                    <TableRow className="hover:bg-white border-b-2 border-slate-100">
                      <TableHead className="font-black text-slate-700">Time</TableHead>
                      <TableHead className="font-black text-slate-700">Bot</TableHead>
                      <TableHead className="font-black text-slate-700">Env</TableHead>
                      <TableHead className="font-black text-slate-700">Apps</TableHead>
                      <TableHead className="font-black text-slate-700">User</TableHead>
                      <TableHead className="font-black text-slate-700">Bot</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentLogs.map((l, idx) => (
                      <motion.tr
                        key={l.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group hover:bg-violet-50/50 transition-colors"
                      >
                        <TableCell className="whitespace-nowrap font-medium text-slate-600 text-xs">
                          {fmtDate(l.createdAt)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-bold text-slate-900">
                          {l.botName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-semibold text-slate-700">
                          {l.environment ?? "-"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-semibold text-slate-700">
                          <div
                            className="max-w-[220px] truncate"
                            title={l.appsUsed.length ? l.appsUsed.join(", ") : "-"}
                          >
                            {l.appsUsed.length ? l.appsUsed.join(", ") : "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[420px] whitespace-normal break-words font-medium text-slate-700">
                            {truncate(l.question, 120)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[460px] whitespace-normal break-words font-medium text-slate-700">
                            {truncate(l.answer, 140)}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default Analytics;