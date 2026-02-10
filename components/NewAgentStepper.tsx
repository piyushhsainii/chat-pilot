"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/services/supabase";
import { ArrowLeft, X } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import Link from "next/link";
import GlassSurface from "@/components/GlassSurface";

const STEPS = [
  { title: "Agent Basics", subtitle: "Name and personality" },
  { title: "Behavior", subtitle: "How your agent thinks and replies" },
  { title: "Knowledge", subtitle: "Give your agent context (optional)" },
  { title: "Rate Limits", subtitle: "Protect your agent from abuse" },
  { title: "Widget", subtitle: "Customize how your chatbot looks" },
  { title: "Review", subtitle: "Finish setup" },
];

const TEMPLATES = {
  faq: {
    label: "FAQ Bot",
    systemPrompt:
      "You answer frequently asked questions clearly and concisely using the provided knowledge base.",
    fallback: "I couldn’t find that in the FAQ. Please contact support.",
  },
  support: {
    label: "Support Agent",
    systemPrompt:
      "You are a professional support agent. Be empathetic, concise, and solution-oriented.",
    fallback: "I’m not sure about that yet. Let me connect you to support.",
  },
  general: {
    label: "General Assistant",
    systemPrompt:
      "You are a helpful AI assistant that answers user questions politely and clearly.",
    fallback: "I’m not sure about that. Could you rephrase?",
  },
};

export default function NewAgentStepper({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [botId, setBotId] = useState<string | null>(null);
  const [isWidgetOpen, setisWidgetOpen] = useState(true);
  /* ---------------- BOT ---------------- */
  const [name, setName] = useState("Peak Support");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [tone, setTone] = useState("Professional");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [fallbackBehavior, setFallbackBehavior] = useState(
    "I am not sure, please contact support.",
  );
  const [knowledgeTab, setKnowledgeTab] = useState<"upload" | "text">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  /* ---------------- SETTINGS ---------------- */
  const [rateLimit, setRateLimit] = useState(60);
  const [rateLimitMsg, setRateLimitMsg] = useState(
    "Too many requests. Please try again later.",
  );
  const [WidgetTitle, setWidgetTitle] = useState<string | null>(null);
  const [GreetingMessage, setGreetingMessage] = useState<string | null>(
    "Hi, how may i help you!",
  );
  /* ---------------- WIDGET ---------------- */
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [widgetButtonColor, setWidgetButtonColor] = useState("#4f46e5");
  const [widgetIconColor, setWidgetIconColor] = useState("#ffffff");

  /* ---------------- KNOWLEDGE ---------------- */
  const [textInput, setTextInput] = useState("");
  const [isSavingText, setIsSavingText] = useState(false);
  const { user, workspaces } = useDashboardStore();
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
  const [domainInput, setDomainInput] = useState("");

  console.log(workspaces)

  /* ----------------------------------------
     STEP PERSISTENCE
  ---------------------------------------- */
  async function saveStep() {
    setSaving(true);

    if (step === 0) {
      const { data, error } = await supabase
        .from("bots")
        .insert({
          name,
          avatar_url: avatarUrl || null,
          tone,
          owner_id: user?.id,
          workspace_id: workspaces?.workspace_id,
        })
        .select()
        .single();

      if (!error && data) setBotId(data.id);
    }

    if (step === 1 && botId) {
      await supabase
        .from("bots")
        .update({
          system_prompt: systemPrompt,
          fallback_behavior: fallbackBehavior,
        })
        .eq("id", botId);
    }

    if (step === 3 && botId) {
      await supabase.from("bot_settings").upsert({
        bot_id: botId,
        rate_limit: rateLimit,
        rate_limit_hit_message: rateLimitMsg,
        allowed_domains: allowedDomains.length ? allowedDomains : null,
      });
    }

    if (step === 4 && botId) {
      await supabase.from("widgets").upsert({
        bot_id: botId,
        title: name,
        theme,
        primary_color: primaryColor,
        button_color: widgetButtonColor,
        text_color: widgetIconColor,
        launcher_surface: "glass",
        panel_surface: "solid",
      });
    }

    setSaving(false);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function uploadAvatarImage(file: File) {
    if (!file.type || !file.type.startsWith("image/")) {
      alert("Please select an image file");
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
      const userId = session?.user?.id || user?.id || "anonymous";

      const path = botId
        ? `${userId}/${botId}/avatar_${Date.now()}_${safeName}`
        : `drafts/${userId}/avatar_${Date.now()}_${safeName}`;

      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: "3600",
      });

      if (error) {
        console.error("Avatar upload error:", error);
        alert(
          `Avatar upload failed. Make sure the '${bucket}' storage bucket exists and is accessible.`,
        );
        return;
      }

      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
      const publicUrl = publicData?.publicUrl;
      if (!publicUrl) {
        alert("Avatar uploaded, but could not get public URL");
        return;
      }

      setAvatarUrl(publicUrl);
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  function normalizeDomainInput(value: string): string | null {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return null;
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

  function addDomain() {
    const normalized = normalizeDomainInput(domainInput);
    if (!normalized) {
      alert("Please enter a valid domain (e.g. myapp.com)");
      return;
    }

    if (allowedDomains.includes(normalized)) {
      alert("Domain already added");
      return;
    }

    setAllowedDomains([...allowedDomains, normalized]);
    setDomainInput("");
  }

  function removeDomain(domain: string) {
    setAllowedDomains(allowedDomains.filter((d) => d !== domain));
  }

  /* ---------------- KNOWLEDGE ---------------- */
  async function uploadFiles(files: FileList) {
    if (!botId) return;

    for (const file of Array.from(files)) {
      await supabase.storage
        .from("knowledge")
        .upload(`${botId}/${file.name}`, file, { upsert: true });
    }
  }

  async function saveRawText() {
    if (!textInput.trim()) return;

    setIsSavingText(true);
    const blob = new Blob([textInput], { type: "text/plain" });
    const file = new File([blob], `text_${Date.now()}.txt`);

    await supabase.storage
      .from("knowledge-files")
      .upload(`${botId}/${file.name}`, file, { upsert: true });

    setTextInput("");
    setIsSavingText(false);
  }
  const bucket = "knowledge-files";

  /* ---------------------------------------- */
  async function loadFiles() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user.id;
    const basePath = `${userId}/${botId}`;
    try {
      // List files in the specific path
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(basePath, {
          limit: 100,
          offset: 0,
        });

      if (error) {
        console.error("Error loading files:", error);
        return;
      }

      const mapped =
        data?.map((f) => ({
          name: f.name,
          size: f.metadata?.size || 0,
          path: `${basePath}/${f.name}`,
        })) || [];

      setFiles(mapped);
    } catch (err) {
      console.error("Failed to load files:", err);
    }
  }

  const { title, subtitle } = STEPS[step];

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="grid ">
          {/* LEFT: STEPS */}
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
              <p className="text-sm text-slate-500">{subtitle}</p>
            </div>
            <div className="flex gap-2 mb-6">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 rounded ${i <= step ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                />
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                {/* STEP CONTENT */}
                {step === 0 && (
                  <div className="space-y-4">
                    <label
                      htmlFor=""
                      className="pl-1 font-semibold tracking-tighter text-gray-900"
                    >
                      {" "}
                      Agent Name
                    </label>
                    <input
                      className="w-full border rounded-lg p-2"
                      placeholder="Agent name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />

                    <label
                      htmlFor=""
                      className="pl-1 font-semibold tracking-tighter text-gray-900"
                    >
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      className="w-full border rounded-lg p-2"
                      placeholder="https://..."
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                    />

                    <label
                      htmlFor=""
                      className="pl-1 font-semibold tracking-tighter text-gray-900"
                    >
                      Upload Avatar Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingAvatar}
                      className="w-full border rounded-lg p-2"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.currentTarget.value = "";
                        if (file) uploadAvatarImage(file);
                      }}
                    />
                    <label
                      htmlFor=""
                      className="pl-1 font-semibold tracking-tighter text-gray-900"
                    >
                      {" "}
                      Agent Tonality
                    </label>
                    <select
                      className="w-full border rounded-lg p-2"
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                    >
                      <option>Professional</option>
                      <option>Friendly</option>
                      <option>Casual</option>
                    </select>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      {Object.values(TEMPLATES).map((t) => (
                        <button
                          key={t.label}
                          className="px-3 py-1 text-xs border rounded-lg"
                          onClick={() => {
                            setSystemPrompt(t.systemPrompt);
                            setFallbackBehavior(t.fallback);
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <label
                      htmlFor=""
                      className="pl-1 font-semibold tracking-tighter text-gray-900"
                    >
                      {" "}
                      Agent System Instructions
                    </label>
                    <textarea
                      className="w-full h-28 border rounded-lg p-2"
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                    />
                    <label
                      htmlFor=""
                      className="tracking-tight font-semibold pl-1 p-1"
                    >
                      Fallback Text Message
                    </label>
                    <input
                      className="w-full border rounded-lg p-2"
                      value={fallbackBehavior}
                      onChange={(e) => setFallbackBehavior(e.target.value)}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-3 border-b border-slate-200">
                      <button
                        onClick={() => setKnowledgeTab("upload")}
                        className={`pb-2 text-sm font-semibold ${knowledgeTab === "upload"
                          ? "border-b-2 border-indigo-600 text-indigo-600"
                          : "text-slate-500 hover:text-slate-700"
                          }`}
                      >
                        Upload Documents
                      </button>

                      <button
                        onClick={() => setKnowledgeTab("text")}
                        className={`pb-2 text-sm font-semibold ${knowledgeTab === "text"
                          ? "border-b-2 border-indigo-600 text-indigo-600"
                          : "text-slate-500 hover:text-slate-700"
                          }`}
                      >
                        Raw Text
                      </button>
                    </div>

                    {/* Upload Tab */}
                    {knowledgeTab === "upload" && (
                      <div
                        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition ${isDragging
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-300 bg-slate-50"
                          }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          if (e.dataTransfer.files) {
                            uploadFiles(e.dataTransfer.files);
                          }
                        }}
                      >
                        <input
                          type="file"
                          multiple
                          className="absolute inset-0 cursor-pointer opacity-0"
                          onChange={(e) =>
                            e.target.files && uploadFiles(e.target.files)
                          }
                        />

                        <div className="space-y-2 pointer-events-none">
                          <div className="text-3xl">📁</div>
                          <p className="text-sm font-semibold text-slate-700">
                            Drag & drop documents here
                          </p>
                          <p className="text-xs text-slate-500">
                            PDF, TXT, Markdown supported
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Raw Text Tab */}
                    {knowledgeTab === "text" && (
                      <div className="space-y-3">
                        <textarea
                          className="w-full h-36 rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                          placeholder="Paste FAQs, internal docs, policies, or notes…"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                        />

                        <div className="flex justify-between items-center">
                          <p className="text-xs text-slate-500">
                            Saved as a private knowledge file for this bot
                          </p>
                          <button
                            onClick={saveRawText}
                            disabled={isSavingText}
                            className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {isSavingText ? "Saving..." : "Save Text"}
                          </button>
                        </div>
                        {files.length > 0 && (
                          <div className="mt-6 space-y-2">
                            <h4 className="text-sm font-semibold text-slate-700">
                              Uploaded Knowledge
                            </h4>

                            <div className="space-y-2">
                              {files.map((file) => (
                                <div
                                  key={file.name}
                                  className="flex items-center justify-between rounded-lg border bg-white px-4 py-2 text-sm shadow-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <span>📄</span>
                                    <span className="text-slate-700">
                                      {file.name}
                                    </span>
                                  </div>

                                  <span className="text-xs text-slate-400">
                                    {(file.metadata?.size / 1024).toFixed(1)} KB
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <label
                      htmlFor=""
                      className="tracking-tight font-semibold pl-1 p-1"
                    >
                      Rate Limit
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded-lg p-2"
                      value={rateLimit}
                      onChange={(e) => setRateLimit(+e.target.value)}
                    />
                    <label
                      htmlFor=""
                      className="tracking-tight font-semibold pl-1 p-1"
                    >
                      Rate Limit Hit Message
                    </label>
                    <input
                      className="w-full border rounded-lg p-2"
                      value={rateLimitMsg}
                      onChange={(e) => setRateLimitMsg(e.target.value)}
                    />
                    <div className="space-y-2">
                      <label className="tracking-tight font-semibold pl-1 text-sm">
                        Allowed Domains
                      </label>

                      <p className="text-xs text-slate-500 pl-1">
                        Restrict chatbot usage to specific websites.
                      </p>

                      {/* Input */}
                      <div className="flex gap-2">
                        <input
                          className="w-full border rounded-lg p-2 text-sm"
                          placeholder="https://example.com"
                          value={domainInput}
                          onChange={(e) => setDomainInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addDomain();
                            }
                          }}
                        />

                        <button
                          type="button"
                          onClick={addDomain}
                          className="px-3 text-xs font-bold rounded-lg bg-slate-900 text-white disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>

                      {/* Domain Chips */}
                      {allowedDomains.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {allowedDomains.map((domain) => (
                            <span
                              key={domain}
                              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full"
                            >
                              {domain}
                              <button
                                type="button"
                                onClick={() => removeDomain(domain)}
                                className="text-indigo-500 hover:text-indigo-700"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-slate-400 pl-1">
                        {allowedDomains.length} domains added
                      </p>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="flex ">
                    <div className="space-y-10 animate-in slide-in-from-left-4 duration-300">
                      <section className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest tracking-tighter">
                          Interface Theme
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => setTheme("light")}
                            className={`p-4 rounded-2xl border-2 transition-all text-left ${theme === "light" ? "border-indigo-600 bg-indigo-50/20" : "border-slate-100 bg-white"}`}
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
                            className={`p-4 rounded-2xl border-2 transition-all text-left ${theme === "dark" ? "border-indigo-600 bg-indigo-50/20" : "border-slate-100 bg-white"}`}
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
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest tracking-tighter">
                            Brand Colors
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                            <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-tighter">
                              Primary
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) =>
                                  setPrimaryColor(e.target.value)
                                }
                                className="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer"
                              />
                              <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-tighter">
                                {primaryColor}
                              </span>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                            <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-tighter">
                              Widget Button
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={widgetButtonColor}
                                onChange={(e) => setWidgetButtonColor(e.target.value)}
                                className="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer"
                              />
                              <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-tighter">
                                {widgetButtonColor}
                              </span>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                            <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-tighter">
                              Widget Icon
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={widgetIconColor}
                                onChange={(e) => setWidgetIconColor(e.target.value)}
                                className="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer"
                              />
                              <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-tighter">
                                {widgetIconColor}
                              </span>
                            </div>
                          </div>
                        </div>
                      </section>
                      <section className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest tracking-tighter">
                            Widget Title
                          </h3>
                        </div>
                        <input
                          className="w-full border rounded-lg p-2"
                          placeholder="AI Assistant Name"
                          value={WidgetTitle ?? ""}
                          onChange={(e) => setWidgetTitle(e.target.value)}
                        />
                      </section>
                      <section className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest tracking-tighter">
                            Greeting Message
                          </h3>
                        </div>
                        <input
                          className="w-full border rounded-lg p-2"
                          placeholder="Widget Greeting Message"
                          value={GreetingMessage ?? ""}
                          onChange={(e) => setGreetingMessage(e.target.value)}
                        />
                      </section>
                    </div>
                    <div className="relative h-full w-[380px] mx-auto flex flex-col items-end justify-end">
                      {/* Simulated Chat Interface */}
                      <div
                        className={`w-[380px] h-[580px] mx-auto rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 z-10 mb-6 mr-4 transition-all duration-500 origin-bottom-right transform ${isWidgetOpen
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
                            <div className="w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center text-xl shadow-sm">
                              🤖
                            </div>
                            <div>
                              <h5 className="font-bold text-sm tracking-tighter">
                                {WidgetTitle || "AI Assistant Bot"}
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
                            onClick={() => setisWidgetOpen(false)}
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
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs">
                              🤖
                            </div>
                            <div
                              className={`p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed max-w-[85%] shadow-sm tracking-tighter ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}
                            >
                              {GreetingMessage || "Hi, how may i help you!"}
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
                              style={{
                                backgroundColor: primaryColor,
                                color: widgetIconColor,
                              }}
                            >
                              Hey! I have a question about pricing.
                            </div>
                          </div>

                          {/* Branding */}
                          <div
                            className={`flex flex-col items-center gap-1 mt-auto pb-4 opacity-40 transition-all duration-700 delay-400 ${isWidgetOpen
                              ? "scale-100 opacity-40"
                              : "scale-90 opacity-0"
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
                      <GlassSurface
                        variant="widgetIcon"
                        width={64}
                        height={64}
                        tint={widgetButtonColor || primaryColor}
                        tintOpacity={0.2}
                        className="group z-20 mr-4 mb-4 transition-all duration-500 hover:scale-110 active:scale-95"
                      >
                        <button
                          onClick={() => setisWidgetOpen(!isWidgetOpen)}
                          className="relative h-full w-full rounded-full overflow-hidden"
                          style={{ color: widgetIconColor }}
                          aria-label={isWidgetOpen ? "Close chat" : "Open chat"}
                          type="button"
                        >
                          {/* Icon Transition Logic */}
                          <div
                            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out ${isWidgetOpen ? "opacity-0 scale-50 rotate-90 translate-y-8" : "opacity-100 scale-100 rotate-0 translate-y-0"}`}
                          >
                            <span className="text-3xl">💬</span>
                          </div>
                          <div
                            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out ${isWidgetOpen ? "opacity-100 scale-100 rotate-0 translate-y-0" : "opacity-0 scale-50 -rotate-90 -translate-y-8"}`}
                          >
                            <span className="text-2xl font-bold">✕</span>
                          </div>

                          {/* Pulsing indicator when closed to attract attention */}
                          {!isWidgetOpen && (
                            <span className="absolute top-3 right-3 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-red-500">
                              <span className="h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                            </span>
                          )}
                        </button>
                      </GlassSurface>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="text-3xl text-black mx-auto flex flex-col items-center justify-center">
                    <div className="mx-auto uppercase font-semibold tracking-tight">
                      Your agent is ready 🎉
                    </div>
                    <Link href={'/dashboard'}>
                      <button className="text-lg bg-indigo-500 font-light cursor-pointer mt-5 rounded-xl px-4 py-1 text-white"> Try it!</button>
                    </Link>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between pt-6 gap-4 items-center">
              <div className="cursor-pointer mx-4">
                <button onClick={onClose} className="border rounded-full p-1">
                  {" "}
                  <X />{" "}
                </button>
              </div>
              <div className="flex items-center">
                <button
                  className="text-sm mx-4 tracking-tighter cursor-pointer font-semibold"
                  onClick={() => setStep((step) => step - 1)}
                >
                  <ArrowLeft />
                </button>
                <button
                  onClick={saveStep}
                  disabled={saving}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-xs"
                >
                  {saving ? "Saving..." : step === 5 ? "Finish" : "Next"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: CHAT WIDGET PREVIEW */}
        </div>
      </motion.div>
    </div>
  );
}
