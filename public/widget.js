(function () {
  if (window.ChatPilotWidget) return;

  class ChatPilotWidget {
    constructor() {
      this.config = this.extractConfig();
      if (!this.config?.botId) return;

      this.isOpen = false;
      this.init();
    }
    extractConfig() {
      // Try both selectors
      const script =
        document.querySelector("script[data-bot-id]") ||
        document.querySelector("script[data-chat-pilot][src*='widget.js']");

      if (!script) {
        console.warn("[ChatPilot] Script tag not found");
        return null;
      }

      const botId = script.getAttribute("data-bot-id");

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
    }

    close() {
      this.isOpen = false;
      this.wrapper.classList.remove("open");
    }

    getTemplate() {
      const params = new URLSearchParams({
        botId: this.config.botId,
        embedded: "true",
      });

      return `
<style>
  .wrapper {
    position: relative;
  }

  iframe {
    width: 380px;
    height: 600px;
    border: none;
    border-radius: 18px;
    box-shadow: 0 20px 50px rgba(0,0,0,.25);
    position: absolute;
    bottom: 80px;
    right: 0;
    opacity: 0;
    transform: scale(.9);
    pointer-events: none;
    transition: all .25s ease;
    background: white;
  }

  .wrapper.open iframe {
    opacity: 1;
    transform: scale(1);
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
    box-shadow: 0 10px 25px rgba(0,0,0,.3);
  }
</style>

<div class="wrapper">
  <iframe
    src="${this.config.baseUrl}/widget/chat?${params.toString()}"
    title="${this.config.name}"
    allow="clipboard-write"
  ></iframe>

  <button class="trigger">💬</button>
</div>
`;
    }
  }
  function initChatPilot() {
    if (window.ChatPilotWidget) return;
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

  // window.ChatPilotWidget = new ChatPilotWidget();
})();
