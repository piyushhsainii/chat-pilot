import React, { useMemo, useState } from 'react';
import { BotWithRelations } from '@/lib/types';
import { supabase } from '@/services/supabase';
import { TEMPLATES } from '@/lib/constants';

/* -------------------------------------------------
   Dummy Supabase helper
-------------------------------------------------- */
const fakeSupabaseUpdate = async (table: string, payload: any) => {
  console.log(`[SUPABASE] UPSERT → ${table}`, payload);
  await new Promise((r) => setTimeout(r, 800));
  return { success: true };
};

const BotCard: React.FC<{ bot: BotWithRelations }> = ({ bot }) => {
  const [isActive, setIsActive] = useState(bot.bot_settings?.active ?? false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [fallbackBehavior, setFallbackBehavior] = useState(
    "I am not sure, please contact support.",
  );
  /* -------------------------------------------------
     Missing configuration detection
  -------------------------------------------------- */
  const missing = useMemo(() => {
    const m: string[] = [];
    if (!bot.system_prompt) m.push('system_prompt');
    if (!bot.widgets) m.push('widgets');
    if (!bot.bot_settings) m.push('bot_settings');
    return m;
  }, [bot]);

  const isFullyConfigured = missing.length === 0;

  /* -------------------------------------------------
     Local form state (schema-aligned)
  -------------------------------------------------- */
  const [form, setForm] = useState({
    // system
    system_prompt: bot.system_prompt ?? '',

    // widget
    title: bot.widgets?.title ?? '',
    theme: bot.widgets?.theme ?? 'light',
    primary_color: bot.widgets?.primary_color ?? '#00d181',
    button_color: bot.widgets?.button_color ?? '#ffffff',
    greeting_message: bot.widgets?.greeting_message ?? '',

    // bot settings
    rate_limit: bot.bot_settings?.rate_limit ?? 60,
    allowed_domains: bot.bot_settings?.allowed_domains?.join(',') ?? '',
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

    await fakeSupabaseUpdate('bot_settings', {
      bot_id: bot.id,
      active: next,
    });

    setIsActive(next);
    setLoading(false);
    setShowConfirm(false);
  };

  const validateConfig = () => {
    const missing: string[] = [];

    if (!form.system_prompt?.trim()) missing.push("System prompt");

    if (!form.title?.trim()) missing.push("Widget title");
    if (!form.theme) missing.push("Widget theme");
    if (!form.primary_color) missing.push("Primary color");
    if (!form.button_color) missing.push("Button color");
    if (!form.greeting_message?.trim()) missing.push("Greeting message");

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
         1. Update bots (system_prompt)
      ------------------------------ */
      if (!bot.system_prompt) {
        const { error } = await supabase
          .from("bots")
          .update({
            system_prompt: form.system_prompt,

          })
          .eq("id", bot.id);

        if (error) throw error;
      }
      /* -----------------------------
         2. Upsert widgets
      ------------------------------ */
      if (!bot.widgets) {
        const { error } = await supabase.from("widgets").insert({
          bot_id: bot.id,
          title: form.title,
          theme: form.theme,
          primary_color: form.primary_color,
          button_color: form.button_color,
          greeting_message: form.greeting_message,


        });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("widgets")
          .update({
            title: form.title,
            theme: form.theme,
            primary_color: form.primary_color,
            button_color: form.button_color,
            greeting_message: form.greeting_message,

          })
          .eq("bot_id", bot.id);

        if (error) throw error;
      }
      /* -----------------------------
         3. Upsert bot_settings
      ------------------------------ */
      const parsedDomains =
        form.allowed_domains
          ?.split(",")
          .map((d) => d.trim())
          .filter(Boolean) ?? [];

      if (!bot.bot_settings) {
        const { error } = await supabase.from("bot_settings").insert({
          bot_id: bot.id,
          rate_limit: form.rate_limit,
          allowed_domains: parsedDomains,
          rate_limit_hit_message: form.rate_limit_hit_message,
          is_configured: true,
          active: false,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("bot_settings")
          .update({
            rate_limit: form.rate_limit,
            allowed_domains: parsedDomains,
            rate_limit_hit_message: form.rate_limit_hit_message,
            is_configured: true,
          })
          .eq("bot_id", bot.id);

        if (error) throw error;
      }

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
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between mb-4">
          <div
            style={{ backgroundColor: bot.widgets?.primary_color ?? "" }}
            className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl bg-slate-200"
          >
            🤖
          </div>

          <button
            disabled={!isFullyConfigured}
            onClick={() => setShowConfirm(true)}
            className={`px-2 py-1 text-xs font-bold rounded uppercase
              ${!isFullyConfigured
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : isActive
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-800">{bot.name}</h3>

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
              className="font-bold text-amber-700 hover:underline"
            >
              Configure now →
            </button>
          </div>
        )}
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
            <h4 className="font-normal tracking-tighter text-lg mb-">Configure Bot</h4>
            {/* System Prompt */}
            <div className="mb-4">
              <label className="text-sm font-normal tracking-tighter">System Prompt</label>
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

            {/* Widget */}
            <div className="mb-4">
              <label className="text-sm font-normal tracking-tighter">Widget Title</label>
              <input
                className="w-full border rounded p-2 text-sm"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-sm font-normal tracking-tighter">Theme</label>
                <select
                  className="w-full border rounded p-2 text-sm"
                  value={form.theme}
                  onChange={(e) =>
                    setForm({ ...form, theme: e.target.value })
                  }
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div className='flex items-center gap-2 mt-5'>
                <label className="text-sm font-normal tracking-tighter">Primary Color</label>
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={(e) =>
                    setForm({ ...form, primary_color: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <label className="text-sm font-normal tracking-tighter">Button Color</label>
              <input
                type="color"
                value={form.button_color}
                onChange={(e) =>
                  setForm({ ...form, button_color: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-normal tracking-tighter">Greeting Message</label>
              <input
                className="w-full border rounded p-2 text-sm"
                value={form.greeting_message}
                onChange={(e) =>
                  setForm({ ...form, greeting_message: e.target.value })
                }
              />
            </div>

            {/* Bot settings */}
            <div className="mb-4">
              <label className="text-sm font-normal tracking-tighter">Rate Limit</label>
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
              <label className="text-sm font-normal tracking-tighter">
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
              <label className="text-sm font-normal tracking-tighter">
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
