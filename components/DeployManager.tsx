"use client";
import { supabase } from "@/services/supabase";
import { useDashboardStore } from "@/store/dashboardStore";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import HorizontalBotSelector from "./HorizontalBotSelector";

type ConfigCheck = {
  label: string;
  valid: boolean;
};

function normalizeDomainInput(value: string): string | null {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return null;

  // Allow users to paste full URLs; we only persist hostnames.
  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    try {
      return new URL(`http://${raw}`).hostname.toLowerCase();
    } catch {
      return null;
    }
  }
}

function parseAllowedDomains(domainsRaw: any): string[] {
  const list = Array.isArray(domainsRaw)
    ? domainsRaw
    : typeof domainsRaw === "string"
      ? domainsRaw
          .split(",")
          .map((d: string) => d.trim())
          .filter(Boolean)
      : [];

  const normalized = list
    .map((d: any) => normalizeDomainInput(String(d ?? "")))
    .filter(Boolean) as string[];

  return Array.from(new Set(normalized));
}

const DeployManager: React.FC = () => {
  const { bots, workspaces, setDashboard } = useDashboardStore();
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const selectedBot = bots?.find((se) => se.id == selectedBotId)
  const [theme, setTheme] = useState<"light" | "dark">(
    ((selectedBot?.widgets?.theme as "light" | "dark") ?? "light"),
  );
  const [primaryColor, setPrimaryColor] = useState(selectedBot?.widgets?.primary_color ?? "#6366f1");
  const [launcherButtonColor, setLauncherButtonColor] = useState(selectedBot?.widgets?.button_color ?? "#4f46e5");
  const [launcherIconColor, setLauncherIconColor] = useState((selectedBot?.widgets as any)?.text_color ?? "#ffffff");
  const [activeTab, setActiveTab] = useState<"content" | "style" | "embed">(
    "style",
  );
  const [originalConfig, setOriginalConfig] = useState(() => {
    const parsedDomains = parseAllowedDomains(
      (selectedBot as any)?.bot_settings?.allowed_domains,
    );

    return {
      theme: ((selectedBot?.widgets?.theme as "light" | "dark") ?? "light") as "light" | "dark",
      primaryColor: selectedBot?.widgets?.primary_color ?? "#6366f1",
      launcherButtonColor: selectedBot?.widgets?.button_color ?? "#4f46e5",
      launcherIconColor: (selectedBot?.widgets as any)?.text_color ?? "#ffffff",
      botName: selectedBot?.widgets?.title ?? "Chat Pilot Assistant",
      avatarUrl: (selectedBot as any)?.avatar_url ?? "",
      welcomeMessage: selectedBot?.widgets?.greeting_message ?? "",
      allowedDomains: parsedDomains,
    };
  });
  const [isWidgetOpen, setIsWidgetOpen] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [botName, setBotName] = useState(
    selectedBot?.widgets?.title ?? "Chat Pilot Assistant",
  );
  const [avatarUrl, setAvatarUrl] = useState((selectedBot as any)?.avatar_url ?? "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [previewAvatarFailed, setPreviewAvatarFailed] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string>(
    selectedBot?.widgets?.greeting_message ?? "",
  );
  const [allowedDomains, setAllowedDomains] = useState<string[]>(() =>
    parseAllowedDomains((selectedBot as any)?.bot_settings?.allowed_domains),
  );
  const [domainInput, setDomainInput] = useState("");

  function updateBotInStore(patch: {
    id: string;
    avatar_url?: string | null;
    widgets?: any;
    bot_settings?: any;
  }) {
    if (!bots || !bots.length) return;
    const nextBots = bots.map((b: any) =>
      b.id === patch.id ? { ...b, ...patch } : b,
    );
    setDashboard({ bots: nextBots as any });
  }

  const botId = selectedBot?.id ?? "";

  const botsForSelector = (bots || []).map((b: any) =>
    b.id === selectedBotId ? { ...b, avatar_url: avatarUrl } : b,
  );

  async function uploadAvatarImage(file: File) {
    if (!selectedBot?.id) return;

    if (!file.type || !file.type.startsWith("image/")) {
      toast("Please select an image file");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const bucket = "knowledge-files";
      const safeName = String(file.name || "avatar")
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .slice(0, 80);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        toast("Please sign in to upload an avatar");
        return;
      }

      const path = `${userId}/${selectedBot.id}/avatar_${Date.now()}_${safeName}`;

      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: "3600",
      });

      if (error) {
        console.error("Avatar upload error:", error);
        toast(
          `Avatar upload failed. Make sure the '${bucket}' storage bucket exists and is accessible.`,
        );
        return;
      }

      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
      const publicUrl = publicData?.publicUrl;
      if (!publicUrl) {
        toast("Avatar uploaded, but could not get public URL");
        return;
      }

      setAvatarUrl(publicUrl);

      const { error: botUpdateError } = await supabase
        .from("bots")
        .update({ avatar_url: publicUrl })
        .eq("id", selectedBot.id);

      if (botUpdateError) {
        console.error("Avatar db update error:", botUpdateError);
        toast("Avatar uploaded, but failed to save to database");
        return;
      }

      updateBotInStore({ id: selectedBot.id, avatar_url: publicUrl });

      setOriginalConfig((prev) => ({ ...prev, avatarUrl: publicUrl }));
      toast("Avatar uploaded");
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  function addDomain() {
    const next = normalizeDomainInput(domainInput);
    if (!next) return;
    if (allowedDomains.includes(next)) {
      setDomainInput("");
      return;
    }
    setAllowedDomains([...allowedDomains, next]);
    setDomainInput("");
  }

  useEffect(() => {
    if (!selectedBot) return;

    setPreviewAvatarFailed(false);

    const nextAllowedDomains = parseAllowedDomains(
      (selectedBot as any)?.bot_settings?.allowed_domains,
    );

    setTheme(
      (selectedBot.widgets?.theme as "light" | "dark") ?? "light"
    );

    setPrimaryColor(
      selectedBot.widgets?.primary_color ?? "#6366f1"
    );

    setLauncherButtonColor(
      selectedBot.widgets?.button_color ?? "#4f46e5"
    );

    setLauncherIconColor(
      (selectedBot.widgets as any)?.text_color ?? "#ffffff"
    );

    setBotName(
      selectedBot?.widgets?.title ?? "Chat Pilot Assistant"
    );

    setAvatarUrl(
      (selectedBot as any)?.avatar_url ?? ""
    );

    setWelcomeMessage(
      selectedBot.widgets?.greeting_message ?? ""
    );
    setOriginalConfig({
      theme: ((selectedBot?.widgets?.theme as "light" | "dark") ?? "light") as
        | "light"
        | "dark",
      primaryColor: selectedBot?.widgets?.primary_color ?? "#6366f1",
      launcherButtonColor: selectedBot?.widgets?.button_color ?? "#4f46e5",
      launcherIconColor: (selectedBot?.widgets as any)?.text_color ?? "#ffffff",
      botName: selectedBot?.widgets?.title ?? "Chat Pilot Assistant",
      avatarUrl: (selectedBot as any)?.avatar_url ?? "",
      welcomeMessage: selectedBot?.widgets?.greeting_message ?? "",
      allowedDomains: nextAllowedDomains,
    })
    setAllowedDomains(nextAllowedDomains);
  }, [selectedBot]);

  useEffect(() => {
    setPreviewAvatarFailed(false);
  }, [avatarUrl]);

  useEffect(() => {
    if (bots && bots.length > 0) {
      setSelectedBotId(bots[0].id);
    }
  }, [bots]);



  function removeDomain(domain: string) {
    setAllowedDomains(allowedDomains.filter((d) => d !== domain));
  }

  const getBotConfigChecks = (bot: any): ConfigCheck[] => {
    return [
      {
        label: "Bot settings configured",
        valid: Boolean(bot.bot_settings?.is_configured),
      },
      {
        label: "Widget created",
        valid: Boolean(bot.widgets),
      },
      {
        label: "Widget title",
        valid: Boolean(bot.widgets?.title),
      },
      {
        label: "Primary color",
        valid: Boolean(bot.widgets?.primary_color),
      },
      {
        label: "Greeting message",
        valid: Boolean(bot.widgets?.greeting_message),
      },
      {
        label: "Theme selected",
        valid: Boolean(bot.widgets?.theme),
      },
      {
        label: "System prompt",
        valid: Boolean(bot.system_prompt && bot.system_prompt.trim().length > 0),
      },
    ];
  };

  const getConfigProgress = (checks: ConfigCheck[]) => {
    const passed = checks.filter((c) => c.valid).length;
    return Math.round((passed / checks.length) * 100);
  };

  const isBotFullyConfigured = (bot: any) => {
    return getBotConfigChecks(bot).every((c) => c.valid);
  };

  useEffect(() => {
    if (!selectedBot) {
      setHasChanges(false);
      return;
    }

    const hasChanged =
      theme !== originalConfig.theme ||
      primaryColor !== originalConfig.primaryColor ||
      launcherButtonColor !== (originalConfig as any).launcherButtonColor ||
      launcherIconColor !== (originalConfig as any).launcherIconColor ||
      botName !== originalConfig.botName ||
      avatarUrl !== (originalConfig as any).avatarUrl ||
      welcomeMessage !== originalConfig.welcomeMessage ||
      JSON.stringify(allowedDomains) !==
        JSON.stringify(originalConfig.allowedDomains);
    setHasChanges(hasChanged);

    // Clear success message when user makes new changes
    if (hasChanged && saveSuccess) {
      setSaveSuccess(false);
    }
  }, [
    selectedBot,
    theme,
    primaryColor,
    launcherButtonColor,
    launcherIconColor,
    botName,
    avatarUrl,
    welcomeMessage,
    allowedDomains,
    saveSuccess,
  ]);
  // Save changes
  async function saveChanges() {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (!selectedBot?.id) {
        toast("No bot selected");
        return;
      }

      const widgetPayload = {
        bot_id: selectedBot.id,
        primary_color: primaryColor,
        greeting_message: welcomeMessage,
        button_color: launcherButtonColor,
        text_color: launcherIconColor,
        theme: theme,
        title: botName,
      };

      const { data: widgetRow, error: widgetSaveError } = await supabase
        .from("widgets")
        .upsert(widgetPayload as any, { onConflict: "bot_id" })
        .select("*")
        .maybeSingle();

      if (widgetSaveError) {
        console.error("Widget save error:", widgetSaveError);
        toast(`Failed to save widget: ${widgetSaveError.message}`);
        return;
      }

      if (!widgetRow) {
        toast("Failed to save widget");
        return;
      }

      updateBotInStore({ id: selectedBot.id, widgets: widgetRow });

      const { error: botSaveError } = await supabase
        .from("bots")
        .update({ avatar_url: avatarUrl || null })
        .eq("id", selectedBot.id);

      if (botSaveError) {
        console.error("Bot avatar save error:", botSaveError);
        toast("Failed to save avatar");
      }

      updateBotInStore({ id: selectedBot?.id!, avatar_url: avatarUrl || null });

      const { error: settingsSaveError } = await supabase
        .from("bot_settings")
        .upsert(
          {
            bot_id: selectedBot.id,
            allowed_domains: allowedDomains.length ? allowedDomains : null,
          },
          { onConflict: "bot_id" },
        );
      if (settingsSaveError) {
        console.error("Bot settings save error:", settingsSaveError);
        toast("Failed to save authorized domains");
      } else {
        updateBotInStore({
          id: selectedBot?.id!,
          bot_settings: {
            ...(selectedBot as any)?.bot_settings,
            allowed_domains: allowedDomains.length ? allowedDomains : null,
          },
        });
      }

      // Update original config to match current state
      const newConfig = {
        theme,
        primaryColor,
        launcherButtonColor,
        launcherIconColor,
        botName,
        avatarUrl,
        welcomeMessage,
        allowedDomains,
      };

      setOriginalConfig(newConfig);
      setHasChanges(false);
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  // Discard changes
  function discardChanges() {
    setTheme((selectedBot?.widgets?.theme as "light" | "dark") ?? "light");
    setPrimaryColor(selectedBot?.widgets?.primary_color ?? "#6366f1");
    setLauncherButtonColor(selectedBot?.widgets?.button_color ?? "#4f46e5");
    setLauncherIconColor((selectedBot?.widgets as any)?.text_color ?? "#ffffff");
    setBotName(selectedBot?.widgets?.title ?? "Chat Pilot Assistant");
    setAvatarUrl((selectedBot as any)?.avatar_url ?? "");
    setWelcomeMessage(selectedBot?.widgets?.greeting_message ?? "");
    const parsedDomains = parseAllowedDomains(
      (selectedBot as any)?.bot_settings?.allowed_domains,
    );
    setAllowedDomains(parsedDomains);
    setHasChanges(false);
  }




  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.chatpilot-agent.com/")
    .replace(/\/+$/, "");

  const embedCode = `<script
  src="${baseUrl}/widget.js"
  data-bot-id="${botId}"
  defer
 ></script>`;

  const iframeCode = `<iframe
  src="${baseUrl}/api/widget/chat?botId=${botId}"
  width="400"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);"
  title="${botName}"
 ></iframe>`;

  return (
    <div>
      {/* Bot Grid */}

      <div className="flex h-full bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm min-h-[750px] animate-in fade-in duration-500">
        {/* Left Settings Panel */}
        <div className="
        w-1/2 border-r border-slate-100 flex flex-col">
          {bots && bots.length > 0 ? (
            <HorizontalBotSelector
              bots={botsForSelector}
              getBotConfigChecks={getBotConfigChecks}
              getConfigProgress={getConfigProgress}
              isBotFullyConfigured={isBotFullyConfigured}
              selectedBotId={selectedBotId}
              setSelectedBotId={setSelectedBotId}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <p className="text-slate-500 text-sm">
                No bots found. Create one to get started.
              </p>
            </div>
          )}
          <div className=" border-r border-slate-100 flex flex-col">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded tracking-tighter">
                  BETA
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tighter">
                  Widget Configuration
                </h2>
              </div>

              <div className="flex gap-8 mt-4">
                {["Content", "Style", "Embed"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase() as any)}
                    className={`pb-4 text-sm font-bold transition-all relative tracking-tighter ${activeTab === tab.toLowerCase()
                      ? "text-indigo-600"
                      : "text-slate-400"
                      }`}
                  >
                    {tab}
                    {activeTab === tab.toLowerCase() && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {selectedBot && (
                <div className="mt-3 grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-tighter">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 font-medium tracking-tighter text-sm"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-tighter">
                      Upload Avatar Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingAvatar}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.currentTarget.value = "";
                        if (file) uploadAvatarImage(file);
                      }}
                      className="block w-full text-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 tracking-tighter">
                      Uploads to Supabase Storage bucket `knowledge-files`.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {hasChanges && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      <span className="text-sm font-semibold tracking-tight">
                        You have unsaved changes
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={discardChanges}
                        disabled={isSaving}
                        className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/10 tracking-tight disabled:opacity-50"
                      >
                        Discard
                      </button>
                      <button
                        onClick={saveChanges}
                        disabled={isSaving}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 tracking-tight disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <span>💾</span>
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {saveSuccess && (
                <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 duration-300">
                  <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                    <span className="text-xl">✓</span>
                    <span className="text-sm font-semibold tracking-tight">
                      Changes saved successfully!
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "style" && (
                <div className="space-y-10 animate-in slide-in-from-left-4 duration-300">
                  <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tighter">
                      Interface Theme
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setTheme("light")}
                        className={`p-4 rounded-2xl border-2 transition-all text-left ${theme === "light"
                          ? "border-indigo-600 bg-indigo-50/20"
                          : "border-slate-100 bg-white"
                          }`}
                      >
                        <div className="aspect-video bg-white border border-slate-200 rounded-lg mb-3 flex flex-col p-2 gap-1.5 overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-slate-200" />
                            <div className="w-8 h-1 bg-slate-100 rounded" />
                          </div>
                          <div className="w-12 h-3 bg-slate-100 rounded-md" />
                          <div className="w-full h-3 bg-slate-50 rounded-md mt-auto" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 tracking-tighter">
                          Light Mode
                        </span>
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`p-4 rounded-2xl border-2 transition-all text-left ${theme === "dark"
                          ? "border-indigo-600 bg-indigo-50/20"
                          : "border-slate-100 bg-white"
                          }`}
                      >
                        <div className="aspect-video bg-slate-900 border border-slate-800 rounded-lg mb-3 flex flex-col p-2 gap-1.5 overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-slate-700" />
                            <div className="w-8 h-1 bg-slate-800 rounded" />
                          </div>
                          <div className="w-12 h-3 bg-slate-800 rounded-md" />
                          <div className="w-full h-3 bg-slate-800 rounded-md mt-auto" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 tracking-tighter">
                          Dark Mode
                        </span>
                      </button>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tighter">
                        Chat Accent
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-tighter">
                          Primary
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer"
                          />
                          <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-tighter">
                            {primaryColor}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tighter">
                        Widget Launcher
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-tighter">
                          Widget Button Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={launcherButtonColor}
                            onChange={(e) => setLauncherButtonColor(e.target.value)}
                            className="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer"
                          />
                          <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-tighter">
                            {launcherButtonColor}
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-tighter">
                          Widget Text Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={launcherIconColor}
                            onChange={(e) => setLauncherIconColor(e.target.value)}
                            className="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer"
                          />
                          <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-tighter">
                            {launcherIconColor}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === "content" && (
                <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                  <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tighter">
                      Bot Identity
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-2 block tracking-tighter">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={botName}
                          onChange={(e) => setBotName(e.target.value)}
                          className="w-full px-5 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 font-medium tracking-tighter"
                          placeholder="e.g. Chat Pilot Assistant"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-2 block tracking-tighter">
                          Greeting Message
                        </label>
                        <textarea
                          value={welcomeMessage || ""}
                          onChange={(e) => setWelcomeMessage(e.target.value)}
                          className="w-full px-5 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 h-32 resize-none font-medium leading-relaxed tracking-tighter"
                          placeholder="Welcome your users..."
                        />
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === "embed" && (
                <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                  <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tighter">
                      Embed Options
                    </h3>

                    <div className="bg-slate-900 rounded-3xl p-6 relative group border border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">
                          Global Widget Script
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(embedCode)}
                          className="text-[10px] font-bold bg-white/10 text-white px-3 py-1 rounded-lg hover:bg-indigo-600 transition-colors tracking-tighter"
                        >
                          Copy Code
                        </button>
                      </div>
                      <code className="text-[11px] text-indigo-100 font-mono break-all leading-relaxed block whitespace-pre-wrap tracking-tighter">
                        {embedCode}
                      </code>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-6 relative group border border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">
                          iFrame Embed
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(iframeCode)}
                          className="text-[10px] font-bold bg-white/10 text-white px-3 py-1 rounded-lg hover:bg-emerald-600 transition-colors tracking-tighter"
                        >
                          Copy Code
                        </button>
                      </div>
                      <code className="text-[11px] text-emerald-100 font-mono break-all leading-relaxed block whitespace-pre-wrap tracking-tighter">
                        {iframeCode}
                      </code>
                    </div>

                    <div className="pt-6 space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tighter">
                        Security Whitelist
                      </h3>
                      <p className="text-xs text-slate-500 tracking-tighter">
                        Only authorized domains can render this widget.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={domainInput}
                          onChange={(e) => setDomainInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addDomain();
                            }
                          }}
                          placeholder="myapp.com"
                          className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-medium focus:border-indigo-500 outline-none tracking-tighter"
                        />
                        <button
                          onClick={addDomain}
                          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all tracking-tighter"
                        >
                          Authorize
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {allowedDomains.map((domain) => (
                          <span
                            key={domain}
                            className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-2 border border-slate-200 tracking-tighter"
                          >
                            {domain}
                            <button
                              onClick={() => removeDomain(domain)}
                              className="text-slate-400 hover:text-red-500"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>
              )}

            </div>
          </div>

        </div>
        {/* Right Preview Panel (Simulated Production Environment) */}
        <div className="w-1/2 bg-slate-100 relative flex flex-col items-center justify-center p-12 overflow-hidden">
          {/* Background browser simulation */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, #000 1.5px, transparent 1.5px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="text-center mb-6">
            <h4 className="text-slate-400 font-black text-xs uppercase tracking-[0.4em] mb-2 tracking-tighter">
              Live Preview
            </h4>
            <p className="text-slate-400 text-[10px] font-medium italic tracking-tighter">
              Interact with the production widget simulation
            </p>
          </div>

          {/* The Actual Widget Wrapper */}
          <div className="relative w-full flex flex-col items-end">
            {/* Simulated Chat Interface */}
            <div
              className={`w-[380px] h-[580px] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 z-10 mb-4 mr-4 transition-all duration-500 origin-bottom-right transform ${isWidgetOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-75 translate-y-12 pointer-events-none"
                } ${theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}
            >
              {/* Header - Stagger 1 */}
              <div
                className={`p-6 flex justify-between items-center border-b transition-all duration-500 delay-100 ${isWidgetOpen
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-4 opacity-0"
                  } ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`}
                style={{ borderTop: `6px solid ${primaryColor}` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center text-xl shadow-sm overflow-hidden">
                    {avatarUrl && !previewAvatarFailed ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={String(avatarUrl)}
                        alt={`${botName} avatar`}
                        className="h-full w-full object-cover"
                        onError={() => setPreviewAvatarFailed(true)}
                      />
                    ) : (
                      "🤖"
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm tracking-tighter">
                      {botName}
                    </h5>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">
                        Online
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsWidgetOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2"
                >
                  <span className="text-xl">⌄</span>
                </button>
              </div>

              {/* Message Area - Stagger 2 */}
              <div className="flex-1 p-6 space-y-6 flex flex-col overflow-y-auto bg-transparent">
                <div
                  className={`flex gap-3 transition-all duration-500 delay-200 ${isWidgetOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-4 opacity-0"
                    }`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs overflow-hidden">
                    {avatarUrl && !previewAvatarFailed ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={String(avatarUrl)}
                        alt={`${botName} avatar`}
                        className="h-full w-full object-cover"
                        onError={() => setPreviewAvatarFailed(true)}
                      />
                    ) : (
                      "🤖"
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed max-w-[85%] shadow-sm tracking-tighter ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}
                  >
                    {welcomeMessage}
                  </div>
                </div>

                <div
                  className={`flex justify-end mt-4 transition-all duration-500 delay-300 ${isWidgetOpen
                    ? "translate-x-0 opacity-100"
                    : "translate-x-4 opacity-0"
                    }`}
                >
                  <div
                    className="p-4 rounded-2xl rounded-tr-none text-sm font-medium shadow-lg transition-all duration-300 max-w-[80%] tracking-tighter"
                    style={{ backgroundColor: primaryColor, color: launcherIconColor || "#ffffff" }}
                  >
                    Hey! I have a question about pricing.
                  </div>
                </div>

                {/* Branding */}
                <div
                  className={`flex flex-col items-center gap-1 mt-auto pb-4 opacity-40 transition-all duration-700 delay-400 ${isWidgetOpen ? "scale-100 opacity-40" : "scale-90 opacity-0"
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="bg-slate-400 text-white text-[9px] font-black px-1 rounded tracking-tighter">
                      CP
                    </span>
                    <span className="text-[10px] font-bold tracking-tighter">
                      Powered by Chat Pilot
                    </span>
                  </div>
                </div>
              </div>

              {/* Input Footer - Stagger 3 */}
              <div
                className={`p-6 border-t transition-all duration-500 delay-500 ${isWidgetOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
                  } ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`}
              >
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${theme === "dark" ? "bg-slate-800 border-slate-700 focus-within:border-indigo-500" : "bg-white border-slate-200 focus-within:border-indigo-500"}`}
                >
                  <input
                    placeholder="Ask a question..."
                    className="bg-transparent text-sm w-full outline-none font-medium tracking-tighter"
                    readOnly
                  />
                  <div className="flex gap-4 items-center">
                    <span className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                      📎
                    </span>
                    <button
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-transform hover:scale-110"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span className="text-xs">➔</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Trigger Icon - Always Visible Floating Button */}
            <button
              onClick={() => setIsWidgetOpen(!isWidgetOpen)}
              className="group w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 z-20 mr-4 mb-4 relative overflow-hidden"
              style={{
                backgroundColor: launcherButtonColor || primaryColor,
                color: launcherIconColor || "#ffffff",
                boxShadow: `0 20px 50px ${(launcherButtonColor || primaryColor)}40`,
              }}
              aria-label={isWidgetOpen ? "Close chat" : "Open chat"}
            >
              {/* Icon Transition Logic */}
              <div
                className={`absolute transition-all duration-500 ease-in-out ${isWidgetOpen ? "opacity-0 scale-50 rotate-90 translate-y-8" : "opacity-100 scale-100 rotate-0 translate-y-0"}`}
              >
                <span className="text-3xl">💬</span>
              </div>
              <div
                className={`absolute transition-all duration-500 ease-in-out ${isWidgetOpen ? "opacity-100 scale-100 rotate-0 translate-y-0" : "opacity-0 scale-50 -rotate-90 -translate-y-8"}`}
              >
                <span className="text-2xl font-bold">✕</span>
              </div>

              {/* Pulsing indicator when closed to attract attention */}
              {!isWidgetOpen && (
                <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                  <span className="w-full h-full bg-red-400 rounded-full animate-ping opacity-75"></span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>

  );
};

export default DeployManager;
