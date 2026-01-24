"use client";
import { useState, useRef, useEffect } from "react";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { Bot, BotWithRelations } from "@/lib/types";
import { useRouter } from "next/navigation";

// Types
enum BotTone {
  PROFESSIONAL = "professional",
  FRIENDLY = "friendly",
  CASUAL = "casual",
}
enum AnswerStyle {
  DETAILED = "detailed",
  CONCISE = "concise",
  BALANCED = "balanced",
}

type Message = {
  role: "user" | "bot";
  text: string;
  isStreaming?: boolean;
};

// Playground Component
export const Playground = ({
  selectedBot,
  credits,
  setCredits,
}: {
  selectedBot: BotWithRelations;
  credits: any;
  setCredits: any;
}) => {
  const [messages, setMessages] = useState<{
    [botId: string]: Message[];
  }>({
    [selectedBot.id]: [{
      role: "bot",
      text: selectedBot.widgets?.greeting_message ?? "",
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

  const handleSend = async () => {
    if (!input.trim() || !selectedBot || isStreaming) return;

    if (credits.usedCredits >= credits.totalCredits) {
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

    // Deduct credit
    setCredits((prev: any) => ({
      ...prev,
      usedCredits: prev.usedCredits + 1,
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
        bot,
        query,
        // NEED TYO
        contextChunks: bot.system_prompt || [],
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
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg"
                style={{ backgroundColor: primaryColor ?? "" }}
              >
                🤖
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
          {/* Name */}
          <input
            value={editableBot.name}
            onChange={(e) => updateBot("name", e.target.value)}
            className="w-full text-sm font-bold border-b border-dashed outline-none"
          />

          {/* System Prompt */}
          <div>
            <label className="text-[9px] font-bold uppercase text-slate-400">
              System Prompt
            </label>
            <textarea
              rows={4}
              value={editableBot.systemPrompt || ""}
              onChange={(e) => updateBot("systemPrompt", e.target.value)}
              className="w-full mt-1 text-xs p-2 border rounded-lg resize-none"
            />
          </div>

          {/* Tone & Style */}
          <div className="grid grid-cols-2 gap-3">
            <select
              value={editableBot.tone || ""}
              onChange={(e) => updateBot("tone", e.target.value)}
              className="text-xs p-2 border rounded-lg"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="casual">Casual</option>
            </select>

            <select
              value={editableBot.answerStyle || ""}
              onChange={(e) => updateBot("answerStyle", e.target.value)}
              className="text-xs p-2 border rounded-lg"
            >
              <option value="concise">Concise</option>
              <option value="balanced">Balanced</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>

          {/* Fallback */}
          <div>
            <label className="text-[9px] font-bold uppercase text-slate-400">
              Fallback Message
            </label>
            <textarea
              rows={2}
              value={editableBot.fallbackBehavior || ""}
              onChange={(e) => updateBot("fallbackBehavior", e.target.value)}
              className="w-full mt-1 text-xs p-2 border rounded-lg italic resize-none"
            />
          </div>

          {/* Widget Theme Redirect */}
          <div
            onClick={() => router.push("/dashboard/deploy")}
            className="cursor-pointer pt-3 border-t hover:bg-slate-50 rounded-lg p-2 transition"
          >
            <p className="text-[9px] font-bold uppercase text-slate-400">
              Widget Theme
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold">{theme}</span>
              <span className="text-[10px] text-indigo-600 font-bold">
                Customize →
              </span>
            </div>
          </div>
          <div>
            <select name="" id=""></select>
          </div>
        </div>
      </div>
    </div>
  );
};
