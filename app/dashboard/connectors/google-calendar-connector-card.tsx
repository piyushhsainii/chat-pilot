"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Unplug } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";

type GoogleCalendarStatus = {
  connected: boolean;
  scopes?: string[];
  connectedAt?: string | null;
  botIds?: string[] | null;
  toolInstructions?: string | null;
};

export default function GoogleCalendarConnectorCard() {
  const { bots } = useDashboardStore();
  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [savingBots, setSavingBots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [scopesOpen, setScopesOpen] = useState(false);
  const [agentsOpen, setAgentsOpen] = useState(false);

  const [applyToAll, setApplyToAll] = useState(true);
  const [selectedBotIds, setSelectedBotIds] = useState<string[]>([]);
  const [toolInstructions, setToolInstructions] = useState("");

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/connectors/google-calendar", {
        method: "GET",
        headers: { "content-type": "application/json" },
      });
      const json = (await res.json()) as GoogleCalendarStatus & { error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to load Google Calendar status");
      setStatus(json);

      const botIds = (json as any)?.botIds as string[] | null | undefined;
      if (botIds === null || botIds === undefined) {
        setApplyToAll(true);
        setSelectedBotIds([]);
      } else {
        setApplyToAll(false);
        setSelectedBotIds(botIds.map(String));
      }

      setToolInstructions(String((json as any)?.toolInstructions ?? ""));
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const subtitle = useMemo(() => {
    if (loading) return "Checking…";
    return status?.connected ? "Connected" : "Not connected";
  }, [loading, status?.connected]);

  async function saveBotScope() {
    setSavingBots(true);
    setError(null);
    try {
      const res = await fetch("/api/connectors/google-calendar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          botIds: applyToAll ? null : selectedBotIds,
          toolInstructions,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to save agent selection");
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setSavingBots(false);
    }
  }

  async function disconnect() {
    setDisconnecting(true);
    setError(null);
    try {
      const res = await fetch("/api/connectors/google-calendar", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to disconnect");
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
            <img
              src="/google_calendar.png"
              alt="Google Calendar"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-sm font-black tracking-tight text-slate-900">Google Calendar</p>
            <p
              className={`text-xs font-semibold ${status?.connected ? "text-emerald-700" : "text-slate-500"
                }`}
            >
              {subtitle}
            </p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-bold uppercase">
          OAuth
        </span>
      </div>

      <p className="mt-3 text-xs text-slate-600">
        Real-time availability + event creation.
      </p>

      {error ? (
        <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            window.location.href = "/api/connectors/google-calendar/start";
          }}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <ExternalLink className="h-4 w-4" />
          {status?.connected ? "Reconnect" : "Connect"}
        </button>

        <button
          type="button"
          onClick={disconnect}
          disabled={!status?.connected || disconnecting}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:border-slate-300 hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Unplug className="h-4 w-4" />
          Disconnect
        </button>
      </div>

      <button
        type="button"
        onClick={() => setDetailsOpen((v) => !v)}
        className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-slate-300 hover:shadow-sm inline-flex items-center justify-center gap-2"
      >
        {detailsOpen ? "Hide details" : "Show details"}
        {detailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {detailsOpen ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-slate-600">
            Connect your Google Calendar so ChatPilot can check availability and create events on your
            behalf.
          </p>

          {status?.connected && status?.scopes?.length ? (
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <button
                type="button"
                onClick={() => setScopesOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-3"
              >
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Scopes</p>
                <span className="text-[11px] font-semibold text-slate-600 inline-flex items-center gap-2">
                  {status.scopes.length} {status.scopes.length === 1 ? "scope" : "scopes"}
                  {scopesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </button>

              {scopesOpen ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {status.scopes.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] px-2 py-1 rounded-xl bg-white border border-slate-200 text-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {status?.connected ? (
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <button
                type="button"
                onClick={() => setAgentsOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-3"
              >
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Use for agents
                </p>
                <span className="text-[11px] font-semibold text-slate-600 inline-flex items-center gap-2">
                  {applyToAll ? "All agents" : "Selected"}
                  {agentsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </button>

              {agentsOpen ? (
                <div className="mt-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold text-slate-700">Scope</div>
                    <label className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={applyToAll}
                        onChange={(e) => setApplyToAll(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      All agents
                    </label>
                  </div>

                  {!applyToAll ? (
                    <div className="mt-3 grid gap-2">
                      {(bots ?? []).map((b) => {
                        const checked = selectedBotIds.includes(b.id);
                        return (
                          <label
                            key={b.id}
                            className="flex items-center justify-between gap-3 rounded-xl bg-white border border-slate-200 px-3 py-2"
                          >
                            <span className="text-xs font-semibold text-slate-800">{b.name}</span>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const next = e.target.checked;
                                setSelectedBotIds((prev) =>
                                  next
                                    ? Array.from(new Set([...prev, b.id]))
                                    : prev.filter((id) => id !== b.id),
                                );
                              }}
                              className="h-4 w-4 rounded border-slate-300"
                            />
                          </label>
                        );
                      })}
                      {(!bots || bots.length === 0) && (
                        <div className="text-xs text-slate-500">No agents found.</div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-slate-600">
                      Calendar access is enabled for all your agents.
                    </div>
                  )}

                  <label className="mt-4 block">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      When should the bot use this?
                    </div>
                    <textarea
                      value={toolInstructions}
                      onChange={(e) => setToolInstructions(e.target.value)}
                      placeholder="Example: Only schedule meetings when the user explicitly asks to book a call. Ask for timezone if missing."
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 min-h-[88px]"
                    />
                  </label>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={saveBotScope}
                      disabled={savingBots || loading}
                      className="inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-bold text-slate-800 hover:border-slate-300 hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {savingBots ? "Saving…" : "Save settings"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-slate-600">
                  Expand to choose agents and set instructions.
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
