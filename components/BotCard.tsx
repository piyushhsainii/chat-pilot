import React, { useMemo, useState } from "react";
import { BotWithRelations } from "@/lib/types";
import { supabase } from "@/services/supabase";
import { TEMPLATES } from "@/lib/constants";
import { Settings, Power } from "lucide-react";

const BotCard: React.FC<{ bot: BotWithRelations }> = ({ bot }) => {
  const [isActive, setIsActive] = useState(bot.bot_settings?.active ?? false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  /* -------------------------------------------------
     Missing configuration detection
  -------------------------------------------------- */
  const missing = useMemo(() => {
    const m: string[] = [];
    if (!bot.system_prompt) m.push("system_prompt");
    if (!bot.bot_settings) m.push("bot_settings");
    if (bot.bot_settings && !bot.bot_settings.is_configured) m.push("is_configured");
    return m;
  }, [bot]);

  const isFullyConfigured = missing.length === 0;

  /* -------------------------------------------------
     Local form state (schema-aligned)
  -------------------------------------------------- */
  const [form, setForm] = useState({
    // bots
    name: bot.name ?? "",
    tone: (bot.tone as string) ?? "Professional",
    fallback_behavior:
      bot.fallback_behavior ?? "I am not sure, please contact support.",
    system_prompt: bot.system_prompt ?? "",

    // bot_settings
    rate_limit: bot.bot_settings?.rate_limit ?? 60,
    allowed_domains: bot.bot_settings?.allowed_domains?.join(",") ?? "",
    rate_limit_hit_message:
      bot.bot_settings?.rate_limit_hit_message ??
      'Too many requests. Please try again later.',
  });

  /* -------------------------------------------------
     Toggle active (dummy Supabase)
  -------------------------------------------------- */
  const toggleActive = async () => {
    setLoading(true);
    const next = !isActive;

    try {
      const { error } = await supabase
        .from("bot_settings")
        .upsert(
          {
            bot_id: bot.id,
            active: next,
          },
          { onConflict: "bot_id" },
        );
      if (error) throw error;
      setIsActive(next);
      setShowConfirm(false);
    } catch (err: any) {
      console.error("Toggle active failed:", err);
      alert(err?.message ?? "Failed to update bot status");
    } finally {
      setLoading(false);
    }
  };

  const validateConfig = () => {
    const missing: string[] = [];

    if (!form.name?.trim()) missing.push("Bot name");
    if (!form.tone?.trim()) missing.push("Tone");
    if (!form.system_prompt?.trim()) missing.push("System prompt");
    if (!form.fallback_behavior?.trim()) missing.push("Fallback behavior");

    if (!form.rate_limit || form.rate_limit <= 0)
      missing.push("Rate limit");

    if (!form.rate_limit_hit_message?.trim())
      missing.push("Rate limit hit message");

    return missing;
  };
  const isSaveDisabled = validateConfig().length > 0 || loading;
  /* -------------------------------------------------
     Save configuration (dummy Supabase)
  -------------------------------------------------- */
  const saveConfiguration = async () => {
    const missingFields = validateConfig();

    if (missingFields.length > 0) {
      alert(
        `Please fill the following fields before saving:\n\n• ${missingFields.join(
          "\n• ",
        )}`,
      );
      return;
    }
    try {
      setLoading(true);
      /* -----------------------------
         1. Update bots
      ------------------------------ */
      const { error: botUpdateError } = await supabase
        .from("bots" as any)
        .update({
          name: form.name,
          tone: form.tone,
          fallback_behavior: form.fallback_behavior,
          system_prompt: form.system_prompt,
        })
        .eq("id", bot.id);
      if (botUpdateError) throw botUpdateError;

      /* -----------------------------
         2. Upsert bot_settings
      ------------------------------ */
      const parsedDomains =
        form.allowed_domains
          ?.split(",")
          .map((d) => d.trim())
          .filter(Boolean) ?? [];

      const { error: settingsUpsertError } = await supabase
        .from("bot_settings")
        .upsert(
          {
            bot_id: bot.id,
            rate_limit: form.rate_limit,
            allowed_domains: parsedDomains,
            rate_limit_hit_message: form.rate_limit_hit_message,
            is_configured: true,
          },
          { onConflict: "bot_id" },
        );
      if (settingsUpsertError) throw settingsUpsertError;

      setShowConfig(false);
    } catch (err: any) {
      console.error("Save configuration failed:", err);
      alert(err.message ?? "Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="relative bg-white border border-slate-200 rounded-xl p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between mb-4">
          <div
            className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl bg-slate-100 border border-slate-200"
          >
            🤖
          </div>

          <button
            type="button"
            disabled={!isFullyConfigured}
            onClick={() => setShowConfirm(true)}
            className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border transition
              ${!isFullyConfigured
                ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                : isActive
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            title={
              !isFullyConfigured
                ? "Configure your bot to enable activation"
                : isActive
                  ? "Click to deactivate"
                  : "Click to activate"
            }
          >
            <Power className="h-4 w-4" />
            <span>{isActive ? "Active" : "Inactive"}</span>
            <span className="ml-1 text-[10px] font-bold opacity-70">Manage</span>
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-800">{bot.name}</h3>

        <div className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {bot.tone || "Professional"}
        </div>

        <p className="text-sm text-slate-500 mt-1 flex-grow">
          {bot.system_prompt ?? 'No system prompt configured yet.'}
        </p>

        {!isFullyConfigured && (
          <div className="mt-4 border border-amber-200 bg-amber-50 p-3 rounded-lg text-xs">
            <div className="font-bold text-amber-800 mb-1">
              ⚠ Bot not fully configured
            </div>
            <div className="text-amber-700 mb-2">
              Missing: {missing.join(', ')}
            </div>
            <button
              onClick={() => setShowConfig(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-amber-200 text-amber-800 font-semibold hover:bg-amber-100 transition"
            >
              Configure now
              <span className="text-amber-700">→</span>
            </button>
          </div>
        )}

        {/* Quick settings */}
        <button
          type="button"
          onClick={() => setShowConfig(true)}
          className="absolute bottom-4 right-4 inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
          title="Bot settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Activate / Deactivate dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h4 className="font-bold text-lg mb-2">
              {isActive ? 'Deactivate bot?' : 'Activate bot?'}
            </h4>
            <p className="text-sm text-slate-500 mb-4">
              {isActive
                ? 'This bot will stop responding to users.'
                : 'This bot will start responding to users.'}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={toggleActive}
                className={`px-4 py-2 text-white rounded font-bold
                  ${isActive ? 'bg-red-500' : 'bg-emerald-500'}`}
                disabled={loading}
              >
                {loading ? 'Saving…' : isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configure dialog */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <h4 className="font-semibold text-lg mb-4">Configure Bot</h4>

            {/* Bot */}
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700">Bot name</label>
              <input
                className="w-full border rounded p-2 text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Tone</label>
                <select
                  className="w-full border rounded p-2 text-sm"
                  value={form.tone}
                  onChange={(e) => setForm({ ...form, tone: e.target.value })}
                >
                  <option value="Professional">Professional</option>
                  <option value="Friendly">Friendly</option>
                  <option value="Casual">Casual</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Fallback behavior
                </label>
                <input
                  className="w-full border rounded p-2 text-sm"
                  value={form.fallback_behavior}
                  onChange={(e) =>
                    setForm({ ...form, fallback_behavior: e.target.value })
                  }
                />
              </div>
            </div>

            {/* System Prompt */}
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700">
                System prompt
              </label>
              <textarea
                className="w-full border rounded p-2 text-sm"
                rows={4}
                value={form.system_prompt}
                onChange={(e) =>
                  setForm({ ...form, system_prompt: e.target.value })
                }
              />
              <div className="flex gap-2">
                {Object.values(TEMPLATES).map((t) => (
                  <button
                    key={t.label}
                    className="px-3 py-1 text-xs border rounded-lg"
                    onClick={() => {
                      setForm((form) => ({
                        ...form,
                        system_prompt: t.systemPrompt,
                      }));
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bot settings */}
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700">Rate limit</label>
              <input
                type="number"
                className="w-full border rounded p-2 text-sm"
                value={form.rate_limit}
                onChange={(e) =>
                  setForm({ ...form, rate_limit: Number(e.target.value) })
                }
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700">
                Allowed Domains (comma separated)
              </label>
              <input
                className="w-full border rounded p-2 text-sm"
                value={form.allowed_domains}
                onChange={(e) =>
                  setForm({ ...form, allowed_domains: e.target.value })
                }
              />
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-slate-700">
                Rate Limit Hit Message
              </label>
              <input
                className="w-full border rounded p-2 text-sm"
                value={form.rate_limit_hit_message}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rate_limit_hit_message: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfig(false)}
                className="px-4 py-2 bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                disabled={isSaveDisabled || loading}
                onClick={saveConfiguration}
                className="px-4 py-2 bg-indigo-600 text-white rounded font-bold hover:cursor-pointer"
              >
                {loading ? 'Saving…' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BotCard;
