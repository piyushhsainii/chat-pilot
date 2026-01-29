(function () {
  if (window.ChatPilotWidget) return;

  class ChatPilotWidget {
    constructor() {
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
      // Log all script tags for debugging
      const allScripts = document.querySelectorAll("script");
      console.log("[ChatPilot] Total scripts found:", allScripts.length);

      const script = document.querySelector("script[data-bot-id]");
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
                widgetScript.getAttribute("data-base-url") ||
                "https://chat-pilot-agent.vercel.app",
              theme: widgetScript.getAttribute("data-theme") || "light",
              primary: widgetScript.getAttribute("data-primary") || "6366f1",
              textColor: widgetScript.getAttribute("data-text") || "ffffff",
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

      return {
        botId,
        baseUrl:
          script.getAttribute("data-base-url") ||
          "https://chat-pilot-agent.vercel.app",
        theme: script.getAttribute("data-theme") || "light",
        primary: script.getAttribute("data-primary") || "6366f1",
        textColor: script.getAttribute("data-text") || "ffffff",
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
    }

    bindEvents() {
      this.trigger.addEventListener("click", () => this.toggle());

      window.addEventListener("message", (e) => {
        if (e.origin !== this.config.baseUrl) return;
        if (e.data?.type === "chatpilot:close") this.close();
      });
    }

    toggle() {
      this.isOpen ? this.close() : this.open();
    }

    open() {
      this.isOpen = true;
      this.wrapper.classList.add("open");
      this.trigger.innerHTML =
        '<span style="font-size: 24px; font-weight: bold;">✕</span>';
    }

    close() {
      this.isOpen = false;
      this.wrapper.classList.remove("open");
      this.trigger.innerHTML = '<span style="font-size: 30px;">💬</span>';
    }

    getTemplate() {
      const params = new URLSearchParams({
        botId: this.config.botId,
        embedded: "true",
      });

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

      const rgb = hexToRgb(`#${this.config.primary}`);
      const shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
      const shadowColorHover = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;

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
    background: #${this.config.primary};
    color: #fff;
    border: none;
    cursor: pointer;
    font-size: 26px;
    box-shadow: 0 10px 25px ${shadowColor};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI Rounded', 'Segoe UI', Roboto, system-ui, sans-serif;
    font-weight: 500;
    letter-spacing: -0.02em;
  }

  .trigger:hover {
    transform: scale(1.1);
    box-shadow: 0 15px 35px ${shadowColorHover};
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
    loading="lazy"
  ></iframe>

  <button class="trigger" aria-label="Open chat">
    <span style="font-size: 30px;">💬</span>
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
