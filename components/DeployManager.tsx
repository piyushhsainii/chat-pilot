"use client";
import React, { useState, useEffect } from "react";

const DeployManager: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [textColor, setTextColor] = useState("#ffffff");
  const [activeTab, setActiveTab] = useState<"content" | "style" | "embed">(
    "style",
  );
  const [isWidgetOpen, setIsWidgetOpen] = useState(true);

  const [botName, setBotName] = useState("Chat Pilot Assistant");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Hi! How can I help you today?",
  );
  const [allowedDomains, setAllowedDomains] = useState<string[]>([
    "example.com",
  ]);
  const [domainInput, setDomainInput] = useState("");

  const botId = "cp_demo_" + Math.random().toString(36).substr(2, 6);

  const addDomain = () => {
    if (domainInput && !allowedDomains.includes(domainInput)) {
      setAllowedDomains([...allowedDomains, domainInput]);
      setDomainInput("");
    }
  };

  const removeDomain = (domain: string) => {
    setAllowedDomains(allowedDomains.filter((d) => d !== domain));
  };

  const embedCode = `<script
  src="https://chatpilot.ai/v1/widget.js"
  data-bot-id="${botId}"
  data-theme="${theme}"
  data-primary="${primaryColor.replace("#", "")}"
  data-name="${encodeURIComponent(botName)}"
  defer
></script>`;

  const iframeCode = `<iframe
  src="https://chatpilot.ai/widget/${botId}?theme=${theme}&primary=${primaryColor.replace("#", "")}&name=${encodeURIComponent(botName)}"
  width="400"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);"
  title="${botName}"
></iframe>`;

  return (
    <div className="flex h-full bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm min-h-[750px] animate-in fade-in duration-500">
      {/* Left Settings Panel */}
      <div className="w-1/2 border-r border-slate-100 flex flex-col">
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
                className={`pb-4 text-sm font-bold transition-all relative tracking-tighter ${
                  activeTab === tab.toLowerCase()
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
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {activeTab === "style" && (
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
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-tighter">
                        {primaryColor}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-tighter">
                      Bubble Text
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-tighter">
                        {textColor}
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
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest tracking-tighter">
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
                      value={welcomeMessage}
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
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest tracking-tighter">
                  Embed Options
                </h3>

                <div className="bg-slate-900 rounded-3xl p-6 relative group border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest tracking-tighter">
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
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest tracking-tighter">
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
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest tracking-tighter">
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

        <div className="text-center mb-10">
          <h4 className="text-slate-400 font-black text-xs uppercase tracking-[0.4em] mb-2 tracking-tighter">
            Live Preview
          </h4>
          <p className="text-slate-400 text-[10px] font-medium italic tracking-tighter">
            Interact with the production widget simulation
          </p>
        </div>

        {/* The Actual Widget Wrapper */}
        <div className="relative w-full h-full flex flex-col items-end justify-end">
          {/* Simulated Chat Interface */}
          <div
            className={`w-[380px] h-[580px] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 z-10 mb-6 mr-4 transition-all duration-500 origin-bottom-right transform ${
              isWidgetOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-75 translate-y-12 pointer-events-none"
            } ${theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}
          >
            {/* Header - Stagger 1 */}
            <div
              className={`p-6 flex justify-between items-center border-b transition-all duration-500 delay-100 ${
                isWidgetOpen
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
                className={`flex gap-3 transition-all duration-500 delay-200 ${
                  isWidgetOpen
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
                  {welcomeMessage}
                </div>
              </div>

              <div
                className={`flex justify-end mt-4 transition-all duration-500 delay-300 ${
                  isWidgetOpen
                    ? "translate-x-0 opacity-100"
                    : "translate-x-4 opacity-0"
                }`}
              >
                <div
                  className="p-4 rounded-2xl rounded-tr-none text-sm font-medium shadow-lg transition-all duration-300 max-w-[80%] tracking-tighter"
                  style={{ backgroundColor: primaryColor, color: textColor }}
                >
                  Hey! I have a question about pricing.
                </div>
              </div>

              {/* Branding */}
              <div
                className={`flex flex-col items-center gap-1 mt-auto pb-4 opacity-40 transition-all duration-700 delay-400 ${
                  isWidgetOpen ? "scale-100 opacity-40" : "scale-90 opacity-0"
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
              className={`p-6 border-t transition-all duration-500 delay-500 ${
                isWidgetOpen
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
            className="group w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 z-20 mr-4 mb-4 relative overflow-hidden"
            style={{
              backgroundColor: primaryColor,
              boxShadow: `0 20px 50px ${primaryColor}40`,
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
  );
};

export default DeployManager;
