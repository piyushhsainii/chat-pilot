"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/services/supabase";
import { useDashboardStore } from "@/store/dashboardStore";

type CreditsPayload = {
  credits?: { balance?: number };
};

export default function SettingsPage() {
  const router = useRouter();
  const { user, workspaces, setDashboard } = useDashboardStore();

  const workspace = (workspaces as any)?.workspaces as any | null;
  const workspaceName = (workspace?.name as string | undefined) ?? "";
  const workspaceTier = (workspace?.tier as string | undefined) ?? "free";

  const [name, setName] = useState(workspaceName);
  const [savingName, setSavingName] = useState(false);
  const [saveOk, setSaveOk] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const [credits, setCredits] = useState<number | null>(null);

  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  useEffect(() => {
    setName(workspaceName);
  }, [workspaceName]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/credits");
        if (!res.ok) return;
        const json = (await res.json()) as CreditsPayload;
        const bal = json?.credits?.balance;
        if (!cancelled && typeof bal === "number") setCredits(bal);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const planLabel = useMemo(() => {
    const t = String(workspaceTier || "free").toLowerCase();
    if (t === "pro") return "Pro";
    if (t === "business") return "Business";
    return "Free";
  }, [workspaceTier]);

  async function saveWorkspaceName() {
    setSavingName(true);
    setSaveOk(null);
    setSaveErr(null);
    try {
      const next = name.trim();
      if (!next) throw new Error("Workspace name cannot be empty");

      const res = await fetch("/api/dashboard/settings/workspace", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: next }),
      });
      const json = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) throw new Error(json?.error || "Failed to update workspace");

      // Update store so UI reflects immediately.
      if (workspaces?.workspaces) {
        setDashboard({
          workspaces: {
            ...(workspaces as any),
            workspaces: { ...(workspaces as any).workspaces, name: next },
          },
        } as any);
      }

      setSaveOk("Saved");
    } catch (e: any) {
      setSaveErr(e?.message ?? "Failed to update workspace");
    } finally {
      setSavingName(false);
    }
  }

  async function deleteAccount() {
    if (deleteText.trim().toUpperCase() !== "DELETE") {
      setDeleteErr('Type "DELETE" to confirm.');
      return;
    }

    setDeleting(true);
    setDeleteErr(null);
    try {
      const res = await fetch("/api/dashboard/settings/delete-account", {
        method: "POST",
        headers: { "content-type": "application/json" },
      });
      const json = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) throw new Error(json?.error || "Failed to delete account");

      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (e: any) {
      setDeleteErr(e?.message ?? "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
          Settings
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Workspace & account
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your workspace name, plan, and account.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="text-sm font-black tracking-tight text-slate-900">Workspace</div>
          <div className="mt-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Workspace name
            </label>
            <div className="mt-2 flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                placeholder="My workspace"
              />
              <button
                type="button"
                onClick={saveWorkspaceName}
                disabled={savingName}
                className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingName ? "Saving…" : "Save"}
              </button>
            </div>
            {saveOk ? (
              <div className="mt-2 text-xs text-emerald-700 font-semibold">{saveOk}</div>
            ) : null}
            {saveErr ? (
              <div className="mt-2 text-xs text-red-700 font-semibold">{saveErr}</div>
            ) : null}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="text-sm font-black tracking-tight text-slate-900">Plan</div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Current plan
              </div>
              <div className="mt-1 text-lg font-black tracking-tight text-slate-900">
                {planLabel}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Credits
              </div>
              <div className="mt-1 text-lg font-black tracking-tight text-slate-900">
                {credits === null ? "…" : credits}
              </div>
              <div className="mt-1 text-[11px] text-slate-600 font-semibold">
                1 bot reply = 1 credit
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Email: <span className="font-semibold text-slate-700">{user?.email ?? "-"}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm">
          <div className="text-sm font-black tracking-tight text-red-900">Delete account</div>
          <p className="mt-2 text-sm text-red-800">
            This permanently deletes your account and workspace data.
          </p>
          <div className="mt-4">
            <label className="block text-[10px] font-bold text-red-800 uppercase tracking-wide">
              Type DELETE to confirm
            </label>
            <input
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              className="mt-2 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-300"
              placeholder="DELETE"
            />
          </div>

          {deleteErr ? (
            <div className="mt-3 text-xs text-red-700 font-semibold">{deleteErr}</div>
          ) : null}

          <div className="mt-4">
            <button
              type="button"
              onClick={deleteAccount}
              disabled={deleting}
              className="rounded-xl bg-red-600 text-white px-4 py-2 text-sm font-bold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {deleting ? "Deleting…" : "Delete account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
