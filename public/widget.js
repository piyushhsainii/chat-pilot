(function () {
  // Prevent recursive embedding
  try {
    const isFramed = window.self !== window.top;
    const url = new URL(window.location.href);
    const isWidgetChat = url.pathname.includes("/widget/chat");
    if (isFramed && isWidgetChat) return;
  } catch {
    // ignore
  }

  if (window.ChatPilotWidget) return;

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

  const __cp_loaderScript = (() => {
    try {
      const s = document.currentScript;
      if (s && s.tagName === "SCRIPT") return s;
    } catch {
      // ignore
    }
    return null;
  })();

  const PAPER_SHADERS_CDN_URL =
    "https://cdn.jsdelivr.net/npm/@paper-design/shaders@0.0.71/dist/index.js";

  class ChatPilotWidget {
    constructor() {
      this.hasRemoteConfig = false;
      this.loaderScript = __cp_loaderScript;
      this.config = this.extractConfig();
      this.shaderMount = null;
      this.iconShaderMounts = [];

      console.log("[ChatPilot] Config extracted:", this.config);

      if (!this.config?.botId) {
        console.error("[ChatPilot] No valid botId found");
        return;
      }

      this.isOpen = false;
      this.init();
    }

    extractConfig() {
      const DEFAULT_BASE_URL = (() => {
        try {
          const origin = window.location?.origin;
          if (origin && origin !== "null") return origin;
        } catch {
          // ignore
        }
        return "https://www.chatpilot-agent.com";
      })();

      const normalizeSurface = (v, fallback) => {
        const raw = String(v || "")
          .trim()
          .toLowerCase();
        if (!raw) return fallback;
        if (raw === "solid" || raw === "glass" || raw === "liquid") return raw;
        return fallback;
      };

      if (window.__CHAT_WIDGET__ && window.__CHAT_WIDGET__.botId) {
        const cfg = window.__CHAT_WIDGET__;
        const widgetScript = document.querySelector("script[src*='widget.js']");
        const inferredBaseUrl = (() => {
          if (!widgetScript?.src) return DEFAULT_BASE_URL;
          const u = new URL(widgetScript.src, window.location.href);
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
          launcherSurface: normalizeSurface(
            cfg.launcherSurface || cfg.launcher_surface,
            "glass",
          ),
          panelSurface: normalizeSurface(
            cfg.panelSurface || cfg.panel_surface,
            "solid",
          ),
        };
      }

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

      if (!script) {
        const widgetScript = document.querySelector("script[src*='widget.js']");
        if (widgetScript) {
          const botId = widgetScript.getAttribute("data-bot-id");
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

      if (!botId) {
        return null;
      }

      const baseUrlFromSrc = (() => {
        if (!script?.src) return null;
        const u = new URL(script.src, window.location.href);
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
        launcherSurface: normalizeSurface(
          script.getAttribute("data-launcher-surface"),
          "glass",
        ),
        panelSurface: normalizeSurface(
          script.getAttribute("data-panel-surface"),
          "solid",
        ),
      };
    }

    init() {
      const host = document.createElement("div");
      host.style.position = "fixed";
      host.style.bottom = "16px";
      host.style.right = "16px";
      host.style.zIndex = "2147483647";

      const shadow = host.attachShadow({ mode: "open" });
      shadow.innerHTML = this.getTemplate();

      document.body.appendChild(host);

      this.shadow = shadow;
      this.wrapper = shadow.querySelector(".wrapper");
      this.trigger = shadow.querySelector(".trigger");
      this.panel = shadow.querySelector(".panel");
      this.iframe = shadow.querySelector("iframe");

      this.shaderHost = null;
      this.iconLiquidHosts = [];

      this.bindEvents();
      this.applyConfigToUI();
      this.loadRemoteConfig();
    }

    async mountLiquidMetal() {
      const isLiquid = this.config?.launcherSurface === "liquid";
      if (!isLiquid) return;

      try {
        // Create shader container with exact same styling as working example
        if (!this.shaderHost) {
          const container = document.createElement("div");
          container.className = "shader-container-exploded";
          Object.assign(container.style, {
            position: "absolute",
            inset: "0",
            width: "var(--cp-trigger-size)",
            height: "var(--cp-trigger-size)",
            borderRadius: "100px",
            pointerEvents: "none",
            zIndex: "1",
          });

          // Append to trigger button
          this.trigger.appendChild(container);
          this.shaderHost = container;

          // Create inner black circle (like in working script.js)
          const inner = document.createElement("div");
          Object.assign(inner.style, {
            position: "absolute",
            top: "2px",
            left: "2px",
            width: "calc(var(--cp-trigger-size) - 4px)",
            height: "calc(var(--cp-trigger-size) - 4px)",
            borderRadius: "100px",
            background: "linear-gradient(180deg, #202020 0%, #000 100%)",
            zIndex: "2",
            pointerEvents: "none",
          });

          this.trigger.appendChild(inner);
        }

        const { liquidMetalFragmentShader, ShaderMount } = await import(
          /* webpackIgnore: true */ PAPER_SHADERS_CDN_URL
        );

        // Clean up old mount
        if (this.shaderMount?.destroy) {
          this.shaderMount.destroy();
          this.shaderMount = null;
        }

        // Create shader mount exactly like working example
        this.shaderMount = new ShaderMount(
          this.shaderHost,
          liquidMetalFragmentShader,
          {
            u_repetition: 4,
            u_softness: 0.5,
            u_shiftRed: 0.3,
            u_shiftBlue: 0.3,
            u_angle: 0,
            u_scale: 8,
            u_shape: 1,
            u_offsetX: 0.0,
            u_offsetY: 0.0,
          },
          undefined,
          0.6,
        );

        console.log("[ChatPilot] Liquid metal shader mounted successfully");
        this.applyShaderColors();
      } catch (error) {
        console.error("[ChatPilot] Failed to mount liquid metal:", error);
      }
    }

    requestConfigFromIframe() {
      try {
        if (!this.iframe || !this.iframe.contentWindow) return;
        this.iframe.contentWindow.postMessage(
          { type: "chatpilot:config:request" },
          "*",
        );
      } catch {}
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
        const launcherSurface = data?.widget?.launcher_surface;
        const panelSurface = data?.widget?.panel_surface;

        if (title) this.config.name = title;
        if (primary) this.config.primary = primary;
        if (buttonColor) this.config.buttonColor = buttonColor;
        if (textColor) this.config.textColor = textColor;
        if (launcherSurface) this.config.launcherSurface = launcherSurface;
        if (panelSurface) this.config.panelSurface = panelSurface;

        this.applyConfigToUI();
        this.hasRemoteConfig = true;
        return true;
      } catch {
        return false;
      }
    }

    loadRemoteConfig() {
      if (this.iframe) {
        this.iframe.addEventListener("load", () => {
          this.requestConfigFromIframe();
          setTimeout(() => {
            if (!this.hasRemoteConfig) this.requestConfigFromIframe();
          }, 750);
        });
      }

      setTimeout(() => this.requestConfigFromIframe(), 50);

      this.loadRemoteConfigViaFetch().then((ok) => {
        if (ok) return;
        this.loadRemoteConfigViaScript();
      });
    }

    loadRemoteConfigViaScript() {
      const cb = `__chatpilot_cfg_${Math.random().toString(16).slice(2)}`;

      window[cb] = (data) => {
        try {
          delete window[cb];
        } catch {}

        if (!data) return;

        const title = data?.widget?.title || data?.bot?.name;
        const primary = data?.widget?.primary_color;
        const buttonColor = data?.widget?.button_color;
        const textColor = data?.widget?.text_color;
        const launcherSurface = data?.widget?.launcher_surface;
        const panelSurface = data?.widget?.panel_surface;

        if (title) this.config.name = title;
        if (primary) this.config.primary = primary;
        if (buttonColor) this.config.buttonColor = buttonColor;
        if (textColor) this.config.textColor = textColor;
        if (launcherSurface) this.config.launcherSurface = launcherSurface;
        if (panelSurface) this.config.panelSurface = panelSurface;

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
        } catch {}
      };

      document.head.appendChild(s);
    }

    applyConfigToUI() {
      const DEFAULT_PRIMARY = "#6366f1";

      const normalizeSurface = (v, fallback) => {
        const raw = String(v || "")
          .trim()
          .toLowerCase();
        if (!raw) return fallback;
        if (raw === "solid" || raw === "glass" || raw === "liquid") return raw;
        return fallback;
      };

      this.config.launcherSurface = normalizeSurface(
        this.config?.launcherSurface,
        "glass",
      );
      this.config.panelSurface = normalizeSurface(
        this.config?.panelSurface,
        "solid",
      );

      const normalizeHex = (hex, fallback) => {
        if (!hex) return fallback;
        const v = String(hex).trim();
        if (!v) return fallback;
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
      const shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
      const shadowColorHover = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`;

      const derivedTextColor = (() => {
        if (textColor) return textColor;
        const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return yiq >= 170 ? "#111827" : "#ffffff";
      })();

      if (this.wrapper) {
        this.wrapper.style.setProperty("--cp-primary", primary);
        this.wrapper.style.setProperty("--cp-text", derivedTextColor);
        this.wrapper.style.setProperty("--cp-shadow", shadowColor);
        this.wrapper.style.setProperty("--cp-shadow-hover", shadowColorHover);
      }

      if (this.trigger) {
        this.trigger.style.color = derivedTextColor;
        const supportsBackdrop = (() => {
          try {
            return (
              (typeof CSS !== "undefined" &&
                CSS.supports &&
                (CSS.supports("backdrop-filter: blur(10px)") ||
                  CSS.supports("-webkit-backdrop-filter: blur(10px)"))) ||
              false
            );
          } catch {
            return false;
          }
        })();

        const launcherSurface = this.config?.launcherSurface || "glass";
        if (launcherSurface === "solid") {
          this.trigger.style.background = primary;
        } else if (launcherSurface === "liquid") {
          this.trigger.style.background = "transparent";
        } else {
          this.trigger.style.background = supportsBackdrop ? "" : primary;
        }
        this.trigger.style.boxShadow = `0 20px 50px ${shadowColor}`;
        this.trigger.style.setProperty("--cp-primary", primary);
        this.trigger.style.setProperty("--cp-text", derivedTextColor);
        this.trigger.style.setProperty("--cp-shadow", shadowColor);
        this.trigger.style.setProperty("--cp-shadow-hover", shadowColorHover);
      }

      if (this.iframe) this.iframe.title = this.config.name;

      if (this.wrapper) {
        const launcherSurface = this.config?.launcherSurface || "glass";
        const panelSurface = this.config?.panelSurface || "solid";
        this.wrapper.setAttribute("data-launcher-surface", launcherSurface);
        this.wrapper.setAttribute("data-panel-surface", panelSurface);
        this.wrapper.setAttribute("data-theme", this.config?.theme || "light");
      }

      // Mount liquid metal if needed
      if (this.config?.launcherSurface === "liquid") {
        this.mountLiquidMetal();
      }

      this.applyShaderColors();
    }

    applyShaderColors() {
      if (!this.shaderMount) return;

      try {
        const normalizeHex = (hex, fallback) => {
          if (!hex) return fallback;
          const v = String(hex).trim();
          if (!v) return fallback;
          const cleaned = v.replace(/^#+/, "#");
          return cleaned.startsWith("#") ? cleaned : `#${cleaned}`;
        };

        const primary = normalizeHex(
          this.config?.buttonColor || this.config?.primary,
          "",
        );

        if (!primary) return;

        const hexToRgb = (hex) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
              }
            : null;
        };

        const rgb = hexToRgb(primary);
        if (!rgb) return;

        const setUniforms =
          this.shaderMount?.setUniformValues || this.shaderMount?.setUniforms;
        if (setUniforms) {
          setUniforms.call(this.shaderMount, {
            u_colorBack: [0, 0, 0, 0],
            u_colorTint: [rgb.r / 255, rgb.g / 255, rgb.b / 255, 0.3],
          });
        }
      } catch {}
    }

    bindEvents() {
      if (this.trigger) {
        const isLiquid = () =>
          (this.config?.launcherSurface || "glass") === "liquid";

        const setSpeed = (v) => {
          if (!isLiquid()) return;
          try {
            this.shaderMount?.setSpeed?.(v);
          } catch {}
        };

        this.trigger.addEventListener("mouseenter", async () => {
          if (!isLiquid()) return;
          if (!this.shaderMount) {
            await this.mountLiquidMetal();
          }
          setSpeed(1);
        });

        this.trigger.addEventListener("mouseleave", () => {
          setSpeed(0.6);
        });

        this.trigger.addEventListener("click", () => {
          if (isLiquid()) {
            setSpeed(2.4);
            setTimeout(() => {
              try {
                const hovered = this.trigger?.matches?.(":hover");
                setSpeed(hovered ? 1 : 0.6);
              } catch {}
            }, 300);
          }

          this.toggle();
        });
      }

      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) this.close();
      });

      window.addEventListener("message", (e) => {
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
          if (cfg.launcher_surface || cfg.launcherSurface) {
            this.config.launcherSurface =
              cfg.launcher_surface || cfg.launcherSurface;
          }
          if (cfg.panel_surface || cfg.panelSurface) {
            this.config.panelSurface = cfg.panel_surface || cfg.panelSurface;
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
      if (this.trigger) {
        this.trigger.setAttribute("aria-label", "Close chat");
        this.trigger.setAttribute("aria-expanded", "true");

        // Update icon to X/close icon
        const icon = this.trigger.querySelector(".triggerIcon");
        if (icon) {
          icon.innerHTML =
            '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>';
        }
      }
    }

    close() {
      this.isOpen = false;
      this.wrapper.classList.remove("open");
      if (this.trigger) {
        this.trigger.setAttribute("aria-label", "Open chat");
        this.trigger.setAttribute("aria-expanded", "false");

        // Update icon back to chat bubble
        const icon = this.trigger.querySelector(".triggerIcon");
        if (icon) {
          icon.innerHTML =
            '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>';
        }
      }
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
      const shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
      const shadowColorHover = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`;

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

  /* Shader canvas styles - critical for WebGL */
  .shader-container-exploded canvas {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
    position: absolute !important;
    inset: 0 !important;
    border-radius: 100px !important;
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
    --cp-trigger-size: 64px;
    --cp-gap: 16px;
  }

  .panel {
    width: 380px;
    height: 580px;
    position: absolute;
    right: 0;
    bottom: calc(var(--cp-trigger-size) + var(--cp-gap));
    opacity: 0;
    pointer-events: none;
    transform-origin: bottom right;
    transform: scale(0.75) translateY(48px);
    transition: opacity 500ms cubic-bezier(0.4, 0, 0.2, 1),
      transform 500ms cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 40px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    background: #ffffff;
    overflow: hidden;
  }

  @supports ((-webkit-backdrop-filter: blur(10px)) or (backdrop-filter: blur(10px))) {
    .wrapper[data-panel-surface="glass"] .panel {
      background: rgba(255, 255, 255, 0.72);
      border-color: rgba(255, 255, 255, 0.32);
      backdrop-filter: blur(18px) saturate(1.2);
      -webkit-backdrop-filter: blur(18px) saturate(1.2);
    }

    .wrapper[data-theme="dark"][data-panel-surface="glass"] .panel {
      background: rgba(15, 23, 42, 0.68);
      border-color: rgba(148, 163, 184, 0.18);
    }
  }

  .wrapper.open .panel {
    opacity: 1;
    transform: scale(1) translateY(0);
    pointer-events: all;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }

  .trigger {
    width: var(--cp-trigger-size);
    height: var(--cp-trigger-size);
    border-radius: 9999px;
    border: none;
    cursor: pointer;
    outline: none;
    background: var(--cp-primary);
    color: var(--cp-text);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3), 0 36px 14px 0 rgba(0, 0, 0, 0.02), 0 20px 12px 0 rgba(0, 0, 0, 0.08), 0 9px 9px 0 rgba(0, 0, 0, 0.12), 0 2px 5px 0 rgba(0, 0, 0, 0.15);
    transition: transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  @supports ((-webkit-backdrop-filter: blur(10px)) or (backdrop-filter: blur(10px))) {
    .wrapper[data-launcher-surface="glass"] .trigger {
      background: rgba(var(--cp-primary-rgb), 0.18);
      backdrop-filter: blur(14px) saturate(1.4);
      -webkit-backdrop-filter: blur(14px) saturate(1.4);
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
  }

  .wrapper[data-launcher-surface="liquid"] .trigger {
    background: transparent;
  }

  .trigger:hover {
    transform: scale(1.1);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.4), 0 12px 6px 0 rgba(0, 0, 0, 0.05), 0 8px 5px 0 rgba(0, 0, 0, 0.1), 0 4px 4px 0 rgba(0, 0, 0, 0.15), 0 1px 2px 0 rgba(0, 0, 0, 0.2);
  }

  .trigger:active {
    transform: scale(0.95);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5), 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  }

  .wrapper[data-launcher-surface="liquid"] .trigger:hover {
    transform: none;
  }

  .wrapper[data-launcher-surface="liquid"] .trigger:active {
    transform: translateY(1px);
  }

  .triggerIcon {
    width: 28px;
    height: 28px;
    display: block;
    color: currentColor;
    user-select: none;
    position: relative;
    z-index: 10;
    transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease;
  }

  .wrapper.open .triggerIcon {
    transform: rotate(90deg);
  }

  .indicator {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 12px;
    height: 12px;
    border-radius: 9999px;
    background: #ef4444;
    border: 2px solid #ffffff;
    z-index: 50;
  }

  .indicatorPing {
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    background: #f87171;
    animation: ping 1.25s cubic-bezier(0, 0, 0.2, 1) infinite;
    opacity: 0.75;
  }

  .wrapper.open .indicator {
    display: none;
  }

  @keyframes ping {
    0% {
      transform: scale(1);
      opacity: 0.75;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  @media (max-width: 480px) {
    .panel {
      width: calc(100vw - 32px);
      height: calc(100vh - 120px);
      border-radius: 32px;
    }
  }
</style>

<div class="wrapper" data-launcher-surface="${this.config.launcherSurface || "glass"}" data-panel-surface="${this.config.panelSurface || "solid"}" data-theme="${this.config.theme || "light"}">
  <div class="panel">
    <iframe
      src="${this.config.baseUrl}/api/widget/chat?${params.toString()}"
      title="${this.config.name}"
      allow="clipboard-write"
      loading="eager"
    ></iframe>
  </div>

  <button class="trigger" aria-label="Open chat" aria-expanded="false">
    <svg class="triggerIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
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
