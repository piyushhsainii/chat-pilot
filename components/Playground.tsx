"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { BotWithRelations } from "@/lib/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Message = {
  role: "user" | "bot";
  text: string;
  isStreaming?: boolean;
};

type CreditsState = {
  balance: number | null;
  total: number;
};

type KnowledgeSource = {
  id: string;
  name: string;
  type: string | null;
  status: string | null;
  created_at: string | null;
  doc_url: string[] | null;
};

const InfoTip = ({ text }: { text: string }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const onEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.bottom + 10 });
    setOpen(true);
  };

  const onLeave = () => setOpen(false);

  return (
    <span className="relative inline-flex items-center">
      <span
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter as any}
        onBlur={onLeave}
        tabIndex={0}
        role="note"
        aria-label={text}
        className="relative inline-flex items-center justify-center w-4 h-4 rounded-full border border-slate-300 text-[10px] font-black text-slate-500 cursor-help select-none"
      >
        i
      </span>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              className="pointer-events-none fixed z-[2147483647]"
              style={{ left: pos.x, top: pos.y, transform: "translateX(-50%)" }}
            >
              <div className="relative w-64 rounded-xl bg-slate-900 text-white text-[11px] font-semibold leading-snug px-3 py-2 shadow-2xl">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-slate-900" />
                {text}
              </div>
            </div>,
            document.body,
          )
        : null}
    </span>
  );
};

const FieldLabel = ({
  label,
  tip,
}: {
  label: string;
  tip: string;
}) => {
  return (
    <div className="flex items-center justify-between">
      <label className="text-[9px] font-bold uppercase text-slate-400">
        {label}
      </label>
      <InfoTip text={tip} />
    </div>
  );
};

// Playground Component
export const Playground = ({
  selectedBot,
  credits,
  refreshCredits,
}: {
  selectedBot: BotWithRelations;
  credits: CreditsState;
  refreshCredits: () => Promise<void>;
}) => {
  const [messages, setMessages] = useState<{
    [botId: string]: Message[];
  }>({
    [selectedBot.id]: [{
      role: "bot",
      text: selectedBot.widgets?.greeting_message!,
      isStreaming: false
    }]
  });
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();
  const [editableBot, setEditableBot] = useState({
    name: selectedBot.name,
    systemPrompt: selectedBot.system_prompt,
    tone: selectedBot.tone,
    answerStyle: selectedBot.tone,
    fallbackBehavior: selectedBot.fallback_behavior,
  });
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(
    [],
  );
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const updateBot = (key: string, value: string) => {
    setEditableBot((prev) => ({ ...prev, [key]: value }));
  };
  const currentMessages = messages[selectedBot.id] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  useEffect(() => {
    setEditableBot({
      name: selectedBot.name,
      systemPrompt: selectedBot.system_prompt,
      tone: selectedBot.tone,
      answerStyle: selectedBot.tone,
      fallbackBehavior: selectedBot.fallback_behavior,
    })
    setAvatarFailed(false);
    setMessages({
      [selectedBot.id]: [{
        role: "bot",
        text: selectedBot.widgets?.greeting_message!,
        isStreaming: false
      }]
    });
  }, [selectedBot])

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setKnowledgeLoading(true);
        const res = await fetch(
          `/api/bots/${encodeURIComponent(selectedBot.id)}/knowledge-sources`,
          { cache: "no-store" },
        );
        const json = (await res.json().catch(() => ({}))) as any;
        if (!cancelled && res.ok) {
          setKnowledgeSources((json?.sources ?? []) as KnowledgeSource[]);
        }
      } catch {
        if (!cancelled) setKnowledgeSources([]);
      } finally {
        if (!cancelled) setKnowledgeLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedBot.id]);

  const handleSend = async () => {
    if (!input.trim() || !selectedBot || isStreaming) return;

    if (typeof credits.balance === "number" && credits.balance <= 0) {
      alert("Credit limit reached!");
      return;
    }

    const userMsg = input.trim();
    setInput("");
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    // Add user + empty bot message
    setMessages((prev) => ({
      ...prev,
      [selectedBot.id]: [
        ...(prev[selectedBot.id] || []),
        { role: "user", text: userMsg },
        { role: "bot", text: "", isStreaming: true },
      ],
    }));

    let fullText = "";

    try {
      await streamChatFromAPI(
        selectedBot,
        userMsg,
        (chunk) => {
          fullText += chunk;

          setMessages((prev) => {
            const msgs = [...(prev[selectedBot.id] || [])];
            msgs[msgs.length - 1] = {
              role: "bot",
              text: fullText,
              isStreaming: true,
            };

            return { ...prev, [selectedBot.id]: msgs };
          });
        },
        abortControllerRef.current.signal,
      );

      // Finalize
      setMessages((prev) => {
        const msgs = [...(prev[selectedBot.id] || [])];
        msgs[msgs.length - 1] = {
          role: "bot",
          text: fullText,
          isStreaming: false,
        };
        return { ...prev, [selectedBot.id]: msgs };
      });
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error(err);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
      refreshCredits();
    }
  };

  const streamChatFromAPI = async (
    bot: BotWithRelations,
    query: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal,
  ) => {
    const res = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        botId: bot.id,
        query,
        history: currentMessages.slice(-12),
      }),
      signal,
    });

    if (!res.body) throw new Error("No response body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      const lines = chunk.split("\n\n");
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;

        const data = line.replace("data: ", "").trim();
        if (data === "[DONE]") return;

        const parsed = JSON.parse(data);
        onChunk(parsed.content);
      }
    }
  };

  const handleStopStreaming = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  };

  const theme = selectedBot.widgets?.theme;
  const primaryColor = selectedBot.widgets?.primary_color;
  const avatarUrl = (selectedBot as any)?.avatar_url as string | null | undefined;
  const showAvatar = Boolean(avatarUrl && String(avatarUrl).trim()) && !avatarFailed;

  const creditsPct = (() => {
    if (credits.balance === null) return 0;
    if (!credits.total) return 0;
    const pct = (credits.balance / credits.total) * 100;
    return Math.min(100, Math.max(0, pct));
  })();

  const creditsRingColor = (() => {
    if (credits.balance === null) return "#94a3b8";
    if (creditsPct >= 50) return "#10b981";
    if (creditsPct >= 20) return "#f59e0b";
    return "#ef4444";
  })();

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* ================= LEFT: CHATBOT (40%) ================= */}
      <div className="w-[40%] h-full flex justify-start pl-6">
        <div
          className={`w-full max-w-[420px] h-[580px] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border-2 ${theme === "dark"
            ? "bg-slate-900 text-white border-slate-700"
            : "bg-white text-slate-900 border-slate-200"
            }`}
        >
          {/* Header */}
          <div
            className={`p-5 flex justify-between items-center border-b ${theme === "dark" ? "border-slate-700" : "border-slate-200"
              }`}
            style={{ borderTop: `6px solid ${primaryColor}` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg overflow-hidden"
                style={{ backgroundColor: primaryColor ?? "" }}
              >
                {showAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={String(avatarUrl)}
                    alt={`${editableBot.name} avatar`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      setAvatarFailed(true);
                    }}
                  />
                ) : (
                  "🤖"
                )}
              </div>
              <div>
                <h5 className="font-bold text-sm tracking-tight">
                  {editableBot.name}
                </h5>
                <span className="text-[10px] font-semibold opacity-60 uppercase tracking-wider">
                  {isStreaming
                    ? "Typing..."
                    : `${editableBot.tone} • ${editableBot.answerStyle}`}
                </span>
              </div>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${isStreaming ? "bg-yellow-500 animate-pulse" : "bg-green-500"
                }`}
            />
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 space-y-5 flex flex-col overflow-y-auto">
            {currentMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 opacity-60">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-3xl">
                  💬
                </div>
                <p className="text-xs font-semibold text-slate-500 text-center">
                  Start a conversation to test your bot
                </p>
              </div>
            )}

            {currentMessages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
              >
                <div
                  className={`p-3.5 rounded-2xl text-[13px] leading-relaxed max-w-[85%] shadow-sm ${m.role === "bot"
                    ? theme === "dark"
                      ? "bg-slate-800 border border-slate-700 rounded-tl-none"
                      : "bg-slate-50 border border-slate-100 rounded-tl-none"
                    : "rounded-tr-none"
                    }`}
                  style={
                    m.role === "user"
                      ? { backgroundColor: primaryColor || "", color: "#fff" }
                      : {}
                  }
                >
                  {m.text}
                  {m.isStreaming && (
                    <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-5 border-t border-slate-200">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isStreaming}
                placeholder="Type your message..."
                className="bg-transparent text-xs w-full outline-none"
              />
              {isStreaming ? (
                <button
                  onClick={handleStopStreaming}
                  className="w-10 h-10 rounded-xl bg-red-500 text-white"
                >
                  ⬛
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl text-white"
                  style={{ backgroundColor: primaryColor || "" }}
                >
                  ➔
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MIDDLE: EMPTY SPACE ================= */}
      <div className="flex-1" />

      {/* ================= RIGHT: AGENT SETTINGS ================= */}
      <div className="w-[360px] h-full pr-6 overflow-y-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          {/* Credits */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[9px] font-bold uppercase text-slate-400">
                    Credits
                  </p>
                  <InfoTip text="Credits are consumed when your bot generates a reply. If you run out, the bot will stop responding until you add more." />
                </div>
                <div className="mt-1 text-sm font-black text-slate-900 tracking-tight">
                  {credits.balance === null ? "…" : credits.balance} / {credits.total}
                </div>
                <div className="mt-0.5 text-[10px] font-semibold text-slate-500">
                  {credits.balance === null
                    ? "Loading…"
                    : `${Math.round(creditsPct)}% available`}
                </div>
              </div>

              <div
                className="relative w-14 h-14 rounded-full"
                style={{
                  background: `conic-gradient(${creditsRingColor} ${creditsPct}%, #e2e8f0 0)`,
                }}
                aria-label="Credits remaining"
                title={
                  credits.balance === null
                    ? "Credits loading"
                    : `${credits.balance} / ${credits.total} credits (${Math.round(
                        creditsPct,
                      )}%)`
                }
              >
                <div className="absolute inset-[4px] rounded-full bg-white flex items-center justify-center text-[10px] font-black text-slate-700">
                  {credits.balance === null ? "…" : `${Math.round(creditsPct)}%`}
                </div>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <FieldLabel
              label="Name"
              tip="This is the display name shown to users in the chat header." 
            />
            <input
              value={editableBot.name}
              onChange={(e) => updateBot("name", e.target.value)}
              className="mt-1 w-full text-sm font-bold border-b border-dashed outline-none"
            />
          </div>

          {/* System Prompt */}
          <div>
            <FieldLabel
              label="System Prompt"
              tip="Your bot's private instructions. Use this to define what it should do, what it should avoid, and how it should behave." 
            />
            <textarea
              rows={4}
              value={editableBot.systemPrompt || ""}
              onChange={(e) => updateBot("systemPrompt", e.target.value)}
              className="w-full mt-1 text-xs p-2 border rounded-lg resize-none"
            />
          </div>

          {/* Tone & Style */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel
                label="Tone"
                tip="Controls the personality of responses (formal, friendly, casual, etc.)." 
              />
              <select
                value={editableBot.tone || ""}
                onChange={(e) => updateBot("tone", e.target.value)}
                className="mt-1 w-full text-xs p-2 border rounded-lg"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="casual">Casual</option>
              </select>
            </div>

            <div>
              <FieldLabel
                label="Answer Style"
                tip="Controls how short or detailed the bot's answers should be." 
              />
              <select
                value={editableBot.answerStyle || ""}
                onChange={(e) => updateBot("answerStyle", e.target.value)}
                className="mt-1 w-full text-xs p-2 border rounded-lg"
              >
                <option value="concise">Concise</option>
                <option value="balanced">Balanced</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>

          {/* Fallback */}
          <div>
            <FieldLabel
              label="Fallback Message"
              tip="Used when the bot can't find an answer in your knowledge base. Keep it short and helpful." 
            />
            <textarea
              rows={2}
              value={editableBot.fallbackBehavior || ""}
              onChange={(e) => updateBot("fallbackBehavior", e.target.value)}
              className="w-full mt-1 text-xs p-2 border rounded-lg italic resize-none"
            />
          </div>

          {/* Knowledge base */}
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase text-slate-400">
                Knowledge Base
              </p>
              <InfoTip text="These are the files and documents your bot can use as references when answering questions." />
            </div>

            <div className="mt-1 flex items-center justify-between gap-3">
              <div className="text-xs font-semibold text-slate-700">
                {knowledgeLoading
                  ? "Loading files…"
                  : knowledgeSources.length
                    ? `${knowledgeSources.length} file${
                        knowledgeSources.length === 1 ? "" : "s"
                      } connected`
                    : "No files connected"}
              </div>
              <Link
                href={`/dashboard/knowledge?botId=${encodeURIComponent(selectedBot.id)}`}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
              >
                Manage →
              </Link>
            </div>

            {knowledgeSources.length ? (
              <div className="mt-2 max-h-28 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                {knowledgeSources.slice(0, 20).map((s) => (
                  <div
                    key={s.id}
                    className="px-3 py-2 border-b last:border-b-0 border-slate-100"
                    title={s.name}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-semibold text-slate-800 truncate">
                        {s.name}
                      </span>
                      <span className="shrink-0 text-[10px] font-bold uppercase text-slate-500">
                        {s.status ?? ""}
                      </span>
                    </div>
                  </div>
                ))}
                {knowledgeSources.length > 20 ? (
                  <div className="px-3 py-2 text-[11px] font-semibold text-slate-500">
                    +{knowledgeSources.length - 20} more
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Widget Theme Redirect */}
          <div
            onClick={() => router.push("/dashboard/deploy")}
            className="cursor-pointer pt-3 border-t hover:bg-slate-50 rounded-lg p-2 transition"
          >
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase text-slate-400">
                Widget Theme
              </p>
              <InfoTip text="Controls how your website widget looks (light/dark theme and colors)." />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold">{theme}</span>
              <span className="text-[10px] text-indigo-600 font-bold">
                Customize →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
