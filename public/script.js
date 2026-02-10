(function () {
  if (window.__LIQUID_METAL_WIDGET__) return;
  window.__LIQUID_METAL_WIDGET__ = true;

  const PAPER_SHADERS_CDN_URL =
    "https://cdn.jsdelivr.net/npm/@paper-design/shaders@0.0.71/dist/index.js";

  /* ---------------- ROOT ---------------- */

  const root = document.createElement("div");
  document.body.appendChild(root);

  Object.assign(root.style, {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    zIndex: 999999,
  });

  /* ---------------- STYLES ---------------- */

  const style = document.createElement("style");
  style.textContent = `
.shader-container-exploded canvas {
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  position: absolute !important;
  inset: 0 !important;
  border-radius: 100px !important;
}

@keyframes ripple-animation {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(4);
    opacity: 0;
  }
}
`;
  document.head.appendChild(style);

  /* ---------------- DIMENSIONS ---------------- */

  const SIZE = 46;
  const INNER = 42;

  /* ---------------- PERSPECTIVE ---------------- */

  const perspective = document.createElement("div");
  root.appendChild(perspective);

  Object.assign(perspective.style, {
    perspective: "1000px",
    perspectiveOrigin: "50% 50%",
  });

  const stack = document.createElement("div");
  perspective.appendChild(stack);

  Object.assign(stack.style, {
    position: "relative",
    width: `${SIZE}px`,
    height: `${SIZE}px`,
    transformStyle: "preserve-3d",
  });

  /* ---------------- ICON LAYER ---------------- */

  const iconLayer = document.createElement("div");
  stack.appendChild(iconLayer);

  Object.assign(iconLayer.style, {
    position: "absolute",
    inset: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: "translateZ(20px)",
    zIndex: 30,
    pointerEvents: "none",
    color: "white",
    fontSize: "18px",
    textShadow: "0 1px 2px rgba(0,0,0,.5)",
  });

  iconLayer.innerHTML = "✨";

  /* ---------------- INNER PILL ---------------- */

  const innerLayer = document.createElement("div");
  stack.appendChild(innerLayer);

  Object.assign(innerLayer.style, {
    position: "absolute",
    inset: "0",
    transform: "translateZ(10px)",
    zIndex: 20,
  });

  const inner = document.createElement("div");
  innerLayer.appendChild(inner);

  Object.assign(inner.style, {
    width: `${INNER}px`,
    height: `${INNER}px`,
    margin: "2px",
    borderRadius: "100px",
    background: "linear-gradient(180deg, #202020 0%, #000 100%)",
  });

  /* ---------------- OUTER LIQUID SHELL ---------------- */

  const shellLayer = document.createElement("div");
  stack.appendChild(shellLayer);

  Object.assign(shellLayer.style, {
    position: "absolute",
    inset: "0",
    transform: "translateZ(0)",
    zIndex: 10,
  });

  const shell = document.createElement("div");
  shellLayer.appendChild(shell);

  Object.assign(shell.style, {
    width: `${SIZE}px`,
    height: `${SIZE}px`,
    borderRadius: "100px",
    boxShadow: "0 0 0 1px rgba(0,0,0,.3), 0 20px 12px rgba(0,0,0,.15)",
    overflow: "hidden",
    position: "relative",
  });

  const shaderContainer = document.createElement("div");
  shell.appendChild(shaderContainer);

  shaderContainer.className = "shader-container-exploded";
  Object.assign(shaderContainer.style, {
    width: `${SIZE}px`,
    height: `${SIZE}px`,
    borderRadius: "100px",
  });

  /* ---------------- CLICK LAYER ---------------- */

  const button = document.createElement("button");
  stack.appendChild(button);

  Object.assign(button.style, {
    position: "absolute",
    inset: "0",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    transform: "translateZ(25px)",
    zIndex: 40,
  });

  /* ---------------- SHADER ---------------- */

  let shaderMount;

  async function mountShader() {
    if (shaderMount) return;
    const { liquidMetalFragmentShader, ShaderMount } = await import(
      PAPER_SHADERS_CDN_URL
    );

    shaderMount = new ShaderMount(
      shaderContainer,
      liquidMetalFragmentShader,
      {
        u_repetition: 4,
        u_softness: 0.5,
        u_shiftRed: 0.3,
        u_shiftBlue: 0.3,
        u_angle: 45,
        u_scale: 8,
        u_shape: 1,
        u_offsetX: 0.1,
        u_offsetY: -0.1,
      },
      undefined,
      0.6,
    );
  }

  /* ---------------- INTERACTION ---------------- */

  button.addEventListener("mouseenter", async () => {
    await mountShader();
    shaderMount?.setSpeed?.(1);
  });

  button.addEventListener("mouseleave", () => {
    shaderMount?.setSpeed?.(0.6);
  });

  button.addEventListener("click", () => {
    shaderMount?.setSpeed?.(2.4);
    const cb = document.currentScript?.dataset?.onclick;
    if (cb && typeof window[cb] === "function") window[cb]();
  });
})();
