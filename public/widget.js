(function () {
  // Prevent the widget from recursively embedding itself inside the widget iframe.
  // (This can happen if the host app includes widget.js globally.)
  try {
    const isFramed = window.self !== window.top;
    const url = new URL(window.location.href);
    const isWidgetChat = url.pathname.includes("/widget/chat");
    if (isFramed && isWidgetChat) return;
  } catch {
    // ignore
  }

  if (window.ChatPilotWidget) return;

  // Prevent recursive/nested widget injection.
  // The widget renders the chat UI inside an iframe; if `widget.js` is ever
  // included on the iframe page (or any embedded context), we must no-op.
  const __cp_isEmbeddedContext = (() => {
    try {
      if (window.self !== window.top) return true;
    } catch {
      return true;
    }

    try {
      const u = new URL(window.location.href);
      if (u.searchParams.has("embedded")) return true;
      if (u.pathname.includes("/widget/chat")) return true;
      if (u.pathname.includes("/api/widget/chat")) return true;
    } catch {
      // ignore
    }

    return false;
  })();

  if (__cp_isEmbeddedContext) return;

  // Capture the exact <script> element that loaded widget.js.
  // This is the most reliable way to read data-* attributes like data-bot-id.
  const __cp_loaderScript = (() => {
    try {
      const s = document.currentScript;
      if (s && s.tagName === "SCRIPT") return s;
    } catch {
      // ignore
    }
    return null;
  })();

  class ChatPilotWidget {
    constructor() {
      this.hasRemoteConfig = false;
      this.loaderScript = __cp_loaderScript;
      this.config = this.extractConfig();

      console.log("[ChatPilot] Config extracted:", this.config);

      if (!this.config?.botId) {
        console.error("[ChatPilot] No valid botId found");
        return;
      }

      this.isOpen = false;
      this.init();
    }

    extractConfig() {
      const DEFAULT_BASE_URL = "http://localhost:3000";
      // const DEFAULT_BASE_URL = "https://www.chatpilot-agent.com";

      // Preferred: config injected via /api/widget/chat
      if (window.__CHAT_WIDGET__ && window.__CHAT_WIDGET__.botId) {
        const cfg = window.__CHAT_WIDGET__;
        const widgetScript = document.querySelector("script[src*='widget.js']");
        const inferredBaseUrl = (() => {
          if (!widgetScript?.src) return DEFAULT_BASE_URL;
          const u = new URL(widgetScript.src, window.location.href);
          // If the script is served from the host site (relative path),
          // do NOT treat that as the API origin.
          if (u.origin === window.location.origin) return DEFAULT_BASE_URL;
          return u.origin;
        })();
        return {
          botId: cfg.botId,
          baseUrl: cfg.baseUrl || cfg.appUrl || inferredBaseUrl,
          theme: cfg.theme || "light",
          primary: cfg.primary || cfg.primary_color,
          buttonColor:
            cfg.buttonColor || cfg.button_color || cfg.button || null,
          textColor: cfg.textColor || cfg.text || cfg.text_color || null,
          name: cfg.name || "Chat Assistant",
        };
      }

      // Log all script tags for debugging
      const allScripts = document.querySelectorAll("script");
      console.log("[ChatPilot] Total scripts found:", allScripts.length);

      // 1) Best: the script tag that loaded widget.js (document.currentScript).
      // 2) Next: a script tag with BOTH data-bot-id and a widget.js src.
      // 3) Fallback: any script tag with data-bot-id.
      const script = (() => {
        try {
          const loader = this.loaderScript;
          if (loader?.getAttribute?.("data-bot-id")) return loader;

          const scriptsWithBotId = Array.from(
            document.querySelectorAll("script[data-bot-id]"),
          );
          const preferred = scriptsWithBotId.find((s) => {
            const src = String(s.getAttribute("src") || "");
            return src.includes("widget.js");
          });

          return preferred || scriptsWithBotId[0] || null;
        } catch {
          return null;
        }
      })();
      console.log("[ChatPilot] Script with data-bot-id:", script);

      if (!script) {
        console.warn("[ChatPilot] Script tag with data-bot-id not found");

        // Fallback: try to find by src
        const widgetScript = document.querySelector("script[src*='widget.js']");
        console.log("[ChatPilot] Widget script by src:", widgetScript);

        if (widgetScript) {
          const botId = widgetScript.getAttribute("data-bot-id");
          console.log("[ChatPilot] BotId from widget script:", botId);

          if (botId) {
            return {
              botId,
              baseUrl:
                widgetScript.getAttribute("data-base-url") || DEFAULT_BASE_URL,
              theme: widgetScript.getAttribute("data-theme") || "light",
              primary: widgetScript.getAttribute("data-primary"),
              buttonColor: widgetScript.getAttribute("data-button") || null,
              textColor: widgetScript.getAttribute("data-text") || null,
              name: decodeURIComponent(
                widgetScript.getAttribute("data-name") || "Chat Assistant",
              ),
            };
          }
        }

        return null;
      }

      const botId = script.getAttribute("data-bot-id");
      console.log("[ChatPilot] Extracted botId:", botId);

      if (!botId) {
        console.warn("[ChatPilot] data-bot-id is missing");
        return null;
      }

      const baseUrlFromSrc = (() => {
        if (!script?.src) return null;
        const u = new URL(script.src, window.location.href);
        // If widget.js is loaded from host site (relative path),
        // don't assume API is also hosted there.
        if (u.origin === window.location.origin) return null;
        return u.origin;
      })();

      return {
        botId,
        baseUrl:
          script.getAttribute("data-base-url") ||
          baseUrlFromSrc ||
          DEFAULT_BASE_URL,
        theme: script.getAttribute("data-theme") || "light",
        primary: script.getAttribute("data-primary"),
        buttonColor: script.getAttribute("data-button") || null,
        textColor: script.getAttribute("data-text") || null,
        name: decodeURIComponent(
          script.getAttribute("data-name") || "Chat Assistant",
        ),
      };
    }

    init() {
      const host = document.createElement("div");
      host.style.position = "fixed";
      host.style.bottom = "20px";
      host.style.right = "20px";
      host.style.zIndex = "2147483647";

      const shadow = host.attachShadow({ mode: "open" });
      shadow.innerHTML = this.getTemplate();

      document.body.appendChild(host);

      this.shadow = shadow;
      this.wrapper = shadow.querySelector(".wrapper");
      this.trigger = shadow.querySelector(".trigger");
      this.iframe = shadow.querySelector("iframe");

      this.bindEvents();

      // Apply initial (inline) config immediately
      this.applyConfigToUI();

      // Load latest widget config from server (colors, title, theme)
      this.loadRemoteConfig();
    }

    requestConfigFromIframe() {
      try {
        if (!this.iframe || !this.iframe.contentWindow) return;
        this.iframe.contentWindow.postMessage(
          { type: "chatpilot:config:request" },
          "*",
        );
      } catch {
        // ignore
      }
    }

    async loadRemoteConfigViaFetch() {
      try {
        const res = await fetch(
          `${this.config.baseUrl}/api/widget/config?botId=${encodeURIComponent(
            this.config.botId,
          )}&_=${Date.now()}`,
          {
            method: "GET",
            mode: "cors",
            credentials: "omit",
            cache: "no-store",
          },
        );

        if (!res.ok) return false;
        const data = await res.json().catch(() => null);
        if (!data) return false;

        const title = data?.widget?.title || data?.bot?.name;
        const primary = data?.widget?.primary_color;
        const buttonColor = data?.widget?.button_color;
        const textColor = data?.widget?.text_color;

        if (title) this.config.name = title;
        if (primary) this.config.primary = primary;
        if (buttonColor) this.config.buttonColor = buttonColor;
        if (textColor) this.config.textColor = textColor;

        this.applyConfigToUI();
        this.hasRemoteConfig = true;
        return true;
      } catch {
        return false;
      }
    }

    loadRemoteConfig() {
      // 1) Best: ask the iframe (no extra network, CSP-friendly)
      if (this.iframe) {
        this.iframe.addEventListener("load", () => {
          this.requestConfigFromIframe();

          // If the iframe didn't respond, try again shortly.
          setTimeout(() => {
            if (!this.hasRemoteConfig) this.requestConfigFromIframe();
          }, 750);
        });
      }

      // Kick an initial request in case iframe is already loaded.
      setTimeout(() => this.requestConfigFromIframe(), 50);

      // 2) Fallback: CORS fetch (works on many sites; blocked by some CSPs)
      this.loadRemoteConfigViaFetch().then((ok) => {
        if (ok) return;
        // 3) Last resort: JSONP script injection
        this.loadRemoteConfigViaScript();
      });
    }

    loadRemoteConfigViaScript() {
      const cb = `__chatpilot_cfg_${Math.random().toString(16).slice(2)}`;

      window[cb] = (data) => {
        try {
          delete window[cb];
        } catch {
          // ignore
        }

        if (!data) return;

        const title = data?.widget?.title || data?.bot?.name;
        const primary = data?.widget?.primary_color;
        const buttonColor = data?.widget?.button_color;
        const textColor = data?.widget?.text_color;

        if (title) this.config.name = title;
        if (primary) this.config.primary = primary;
        if (buttonColor) this.config.buttonColor = buttonColor;
        if (textColor) this.config.textColor = textColor;

        this.applyConfigToUI();
      };

      const s = document.createElement("script");
      s.async = true;
      s.src = `${this.config.baseUrl}/api/widget/config-script?botId=${encodeURIComponent(
        this.config.botId,
      )}&callback=${encodeURIComponent(cb)}&_=${Date.now()}`;

      s.onerror = () => {
        try {
          delete window[cb];
        } catch {
          // ignore
        }
      };

      document.head.appendChild(s);
    }

    applyConfigToUI() {
      const DEFAULT_PRIMARY = "#6366f1";

      const normalizeHex = (hex, fallback) => {
        if (!hex) return fallback;
        const v = String(hex).trim();
        if (!v) return fallback;
        // If someone accidentally saved "##xxxxxx", normalize it.
        const cleaned = v.replace(/^#+/, "#");
        return cleaned.startsWith("#") ? cleaned : `#${cleaned}`;
      };

      const primary = normalizeHex(
        this.config.buttonColor || this.config.primary,
        DEFAULT_PRIMARY,
      );

      const textColor = this.config.textColor
        ? normalizeHex(this.config.textColor, "")
        : "";

      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : { r: 99, g: 102, b: 241 };
      };

      const rgb = hexToRgb(primary);
      const shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
      const shadowColorHover = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;

      const derivedTextColor = (() => {
        if (textColor) return textColor;
        // YIQ contrast against the button bg
        const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return yiq >= 170 ? "#111827" : "#ffffff";
      })();

      if (this.wrapper) {
        this.wrapper.style.setProperty("--cp-primary", primary);
        this.wrapper.style.setProperty("--cp-text", derivedTextColor);
        this.wrapper.style.setProperty("--cp-shadow", shadowColor);
        this.wrapper.style.setProperty("--cp-shadow-hover", shadowColorHover);
      }

      // Hard override the trigger itself to ensure styles apply
      // even if CSS variables are blocked/ignored by the host.
      if (this.trigger) {
        this.trigger.style.background = primary;
        this.trigger.style.color = derivedTextColor;
      }

      if (this.iframe) this.iframe.title = this.config.name;
    }

    bindEvents() {
      this.trigger.addEventListener("click", () => this.toggle());

      window.addEventListener("message", (e) => {
        // Only accept messages from our iframe, regardless of the host page origin.
        if (e.source !== this.iframe?.contentWindow) return;
        if (e.data?.type === "chatpilot:close") this.close();

        if (e.data?.type === "chatpilot:config") {
          const cfg = e.data?.payload || {};
          if (cfg.title) this.config.name = cfg.title;
          if (cfg.primary_color) this.config.primary = cfg.primary_color;
          if (cfg.button_color) this.config.buttonColor = cfg.button_color;
          if (cfg.text_color || cfg.textColor) {
            this.config.textColor = cfg.text_color || cfg.textColor;
          }
          this.hasRemoteConfig = true;
          this.applyConfigToUI();
        }
      });
    }

    toggle() {
      this.isOpen ? this.close() : this.open();
    }

    open() {
      this.isOpen = true;
      this.wrapper.classList.add("open");
      this.trigger.innerHTML = this.getCloseIcon();
    }

    close() {
      this.isOpen = false;
      this.wrapper.classList.remove("open");
      this.trigger.innerHTML = this.getChatIcon();
    }

    getChatIcon() {
      return `
        <svg class="triggerIcon triggerIcon--chat" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path fill="var(--cp-text)" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2zm4 6a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H8zm0-4a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2H8z" />
        </svg>
      `;
    }

    getCloseIcon() {
      return `
        <svg class="triggerIcon triggerIcon--close" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path fill="var(--cp-text)" d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 1 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.42 1.42L12 13.41l4.89 4.9a1 1 0 0 0 1.42-1.42L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4z" />
        </svg>
      `;
    }

    getTemplate() {
      const params = new URLSearchParams({
        botId: this.config.botId,
        embedded: "true",
      });

      const normalizeHex = (hex, fallback) => {
        if (!hex) return fallback;
        const v = String(hex).trim();
        if (!v) return fallback;
        const cleaned = v.replace(/^#+/, "#");
        return cleaned.startsWith("#") ? cleaned : `#${cleaned}`;
      };

      const primary = normalizeHex(
        this.config.buttonColor || this.config.primary,
        "#6366f1",
      );
      const textColor = normalizeHex(this.config.textColor, "");

      // Convert hex to RGB for shadow
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : { r: 99, g: 102, b: 241 }; // fallback to default indigo
      };

      const rgb = hexToRgb(primary);
      const shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
      const shadowColorHover = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;

      const derivedTextColor = (() => {
        if (textColor) return textColor;
        const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return yiq >= 170 ? "#111827" : "#ffffff";
      })();

      return `
<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .wrapper {
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI Rounded', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    --cp-primary: ${primary};
    --cp-text: ${derivedTextColor};
    --cp-shadow: ${shadowColor};
    --cp-shadow-hover: ${shadowColorHover};
  }

  iframe {
    width: 380px;
    height: 600px;
    border: none;
    border-radius: 18px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
    position: absolute;
    bottom: 80px;
    right: 0;
    opacity: 0;
    transform: scale(0.9) translateY(10px);
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: white;
  }

  .wrapper.open iframe {
    opacity: 1;
    transform: scale(1) translateY(0);
    pointer-events: all;
  }

  .trigger {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--cp-primary);
    color: var(--cp-text);
    border: none;
    cursor: pointer;
    font-size: 26px;
    box-shadow: 0 10px 25px var(--cp-shadow);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI Rounded', 'Segoe UI', Roboto, system-ui, sans-serif;
    font-weight: 500;
    letter-spacing: -0.02em;
  }

  .triggerIcon {
    width: 28px;
    height: 28px;
    display: block;
    color: var(--cp-text);
    user-select: none;
  }

  .triggerIcon--chat {
    width: 30px;
    height: 30px;
  }

  .triggerIcon--close {
    width: 26px;
    height: 26px;
  }

  .trigger:hover {
    transform: scale(1.1);
    box-shadow: 0 15px 35px var(--cp-shadow-hover);
  }

  .trigger:active {
    transform: scale(0.95);
  }

  /* Notification badge when closed */
  .trigger::after {
    content: '';
    position: absolute;
    top: 8px;
    right: 8px;
    width: 12px;
    height: 12px;
    background: #ef4444;
    border: 2px solid white;
    border-radius: 50%;
    opacity: 1;
    transition: opacity 0.3s;
  }

  .wrapper.open .trigger::after {
    opacity: 0;
  }

  /* Pulsing animation for notification */
  @keyframes pulse-ring {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }

  .trigger::before {
    content: '';
    position: absolute;
    top: 8px;
    right: 8px;
    width: 12px;
    height: 12px;
    background: #ef4444;
    border-radius: 50%;
    animation: pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    opacity: 0.75;
  }

  .wrapper.open .trigger::before {
    display: none;
  }

  /* Responsive adjustments */
  @media (max-width: 480px) {
    iframe {
      width: calc(100vw - 40px);
      height: calc(100vh - 100px);
      right: -10px;
      bottom: 75px;
    }
  }
</style>

<div class="wrapper">
  <iframe
    src="${this.config.baseUrl}/widget/chat?${params.toString()}"
    title="${this.config.name}"
    allow="clipboard-write"
    loading="eager"
  ></iframe>

  <button class="trigger" aria-label="Open chat">
    ${this.getChatIcon()}
  </button>
</div>
`;
    }
  }

  function initChatPilot() {
    if (window.ChatPilotWidget) return;
    console.log("[ChatPilot] Initializing widget...");
    window.ChatPilotWidget = new ChatPilotWidget();
  }

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    initChatPilot();
  } else {
    document.addEventListener("DOMContentLoaded", initChatPilot);
  }
})();
