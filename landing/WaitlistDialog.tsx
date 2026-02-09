"use client";

import { LiquidMetalButton } from "@/components/liquid-metal-button";
import React, { useMemo, useState } from "react";

type Props = {
  triggerClassName: string;
  triggerText: string;
  children?: React.ReactNode;
};

export default function WaitlistDialog({
  triggerClassName,
  triggerText,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const e = email.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }, [email]);

  const close = () => {
    setOpen(false);
    setStatus("idle");
    setErrorMsg(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || status === "loading") return;

    setStatus("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || null,
          company: company.trim() || null,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const msg = json?.error === "invalid_email" ? "Enter a valid email." : "Something went wrong.";
        throw new Error(msg);
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(String(err?.message || "Something went wrong."));
    }
  };

  return (
    <>
      <LiquidMetalButton onClick={() => setOpen(true)} label={triggerText} />

      {open && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Join waitlist"
        >
          <div
            className="absolute inset-0 bg-zinc-950/35 backdrop-blur-sm"
            onClick={close}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white shadow-2xl">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(900px_circle_at_20%_0%,rgba(99,102,241,0.12),transparent_60%)]" />

            <div className="relative p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Early access
                  </div>
                  <div className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">
                    Join the waitlist
                  </div>
                  <div className="mt-1 text-sm text-zinc-600">
                    We’ll email you when spots open up.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={close}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/70 text-zinc-700 hover:bg-white"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {status === "success" ? (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="text-sm font-bold text-emerald-900">You’re on the list.</div>
                  <div className="mt-1 text-sm text-emerald-800">Thanks — we’ll be in touch soon.</div>
                  <button
                    type="button"
                    onClick={close}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="mt-6 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                      Email
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="example@email.com"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                      autoFocus
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                        Name (optional)
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type="text"
                        placeholder="John Doe"
                        className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                        Company (optional)
                      </label>
                      <input
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        type="text"
                        placeholder="Company Name"
                        className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  {status === "error" && errorMsg && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!canSubmit || status === "loading"}
                    className={
                      "inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-bold transition " +
                      (!canSubmit || status === "loading"
                        ? "bg-zinc-200 text-zinc-500"
                        : "bg-zinc-900 text-white hover:bg-zinc-800")
                    }
                  >
                    {status === "loading" ? "Joining..." : "Join waitlist"}
                  </button>

                  <div className="text-xs text-zinc-500">
                    No spam. Unsubscribe anytime.
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
