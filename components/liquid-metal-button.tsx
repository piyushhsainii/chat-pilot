"use client";

import { Sparkles } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

const PAPER_SHADERS_CDN_URL =
    "https://cdn.jsdelivr.net/npm/@paper-design/shaders@0.0.71/dist/index.js";

interface LiquidMetalButtonProps {
    label?: string;
    onClick?: () => void;
    viewMode?: "text" | "icon";
    /**
     * Visual mode.
     * - cta: existing pill CTA button (default)
     * - surface: subtle hover-activated liquid metal interaction surface
     */
    variant?: "cta" | "surface";
    /** Render custom content (surface variant only). */
    children?: React.ReactNode;
    /** Extra classes applied to the clickable element (surface variant only). */
    className?: string;
    /** Border radius class for the liquid surface (surface variant only). */
    surfaceRadiusClassName?: string;
    /** Shader overlay opacity at rest (surface variant only). */
    surfaceIdleOpacityClassName?: string;
    /** Shader overlay opacity when `active` (surface variant only). */
    surfaceActiveOpacityClassName?: string;
    /** Shader overlay opacity on hover (surface variant only). */
    surfaceHoverOpacityClassName?: string;
    disabled?: boolean;
    /** Keep a very subtle idle animation (surface variant only). */
    active?: boolean;
    /** Optional tint for the metal surface (surface variant only). */
    tint?: string;
    tintOpacity?: number;
    /** Optional base fill under shader (surface variant only). */
    baseTintOpacity?: number;
    type?: "button" | "submit" | "reset";
}

export function LiquidMetalButton({
    label = "Get Started",
    onClick,
    viewMode = "text",
    variant = "cta",
    children,
    className,
    surfaceRadiusClassName = "rounded-2xl",
    surfaceIdleOpacityClassName = "opacity-0",
    surfaceActiveOpacityClassName = "opacity-0",
    surfaceHoverOpacityClassName = "opacity-60",
    disabled,
    active,
    tint,
    tintOpacity = 0.22,
    baseTintOpacity = 0.14,
    type = "button",
}: LiquidMetalButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [ripples, setRipples] = useState<
        Array<{ x: number; y: number; id: number }>
    >([]);
    const shaderRef = useRef<HTMLDivElement>(null);
    // biome-ignore lint/suspicious/noExplicitAny: External library without types
    const shaderMount = useRef<any>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const rippleId = useRef(0);

    // Mouse-reactive subtle uniform updates (surface)
    const rafPending = useRef(false);
    const pendingPointer = useRef<{ x: number; y: number } | null>(null);

    const dimensions = useMemo(() => {
        if (viewMode === "icon") {
            return {
                width: 46,
                height: 46,
                innerWidth: 42,
                innerHeight: 42,
                shaderWidth: 46,
                shaderHeight: 46,
            };
        } else {
            return {
                width: 142,
                height: 46,
                innerWidth: 138,
                innerHeight: 42,
                shaderWidth: 142,
                shaderHeight: 46,
            };
        }
    }, [viewMode]);

    const ctaUniforms = useMemo(
        () => ({
            u_repetition: 4,
            u_softness: 0.5,
            u_shiftRed: 0.3,
            u_shiftBlue: 0.3,
            u_distortion: 0,
            u_contour: 0,
            u_angle: 45,
            u_scale: 8,
            u_shape: 1,
            u_offsetX: 0.1,
            u_offsetY: -0.1,
        }),
        [],
    );

    const surfaceUniforms = useMemo(
        () => ({
            // Keep chroma low and motion calm.
            u_repetition: 2.2,
            u_softness: 0.82,
            u_shiftRed: 0.06,
            u_shiftBlue: 0.05,
            u_distortion: 0,
            u_contour: 0,
            u_angle: 20,
            u_shape: 1,
        }),
        [],
    );

    const tintUniforms = useMemo(() => {
        const v = String(tint || "").trim().replace(/^#/, "");
        if (!/^[0-9a-fA-F]{6}$/.test(v)) return null;
        const r = parseInt(v.slice(0, 2), 16) / 255;
        const g = parseInt(v.slice(2, 4), 16) / 255;
        const b = parseInt(v.slice(4, 6), 16) / 255;
        const a = Math.max(0, Math.min(1, tintOpacity));
        return {
            u_colorBack: [0, 0, 0, 0],
            u_colorTint: [r, g, b, a],
        };
    }, [tint, tintOpacity]);

    const baseTintStyle = useMemo(() => {
        const v = String(tint || "").trim().replace(/^#/, "");
        if (!/^[0-9a-fA-F]{6}$/.test(v)) return null;
        const r = parseInt(v.slice(0, 2), 16);
        const g = parseInt(v.slice(2, 4), 16);
        const b = parseInt(v.slice(4, 6), 16);
        const a = Math.max(0, Math.min(1, baseTintOpacity));
        return { backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})` } as React.CSSProperties;
    }, [baseTintOpacity, tint]);

    useEffect(() => {
        const styleId = "shader-canvas-style-exploded";
        if (!document.getElementById(styleId)) {
            const style = document.createElement("style");
            style.id = styleId;
            style.textContent = `
        .shader-container-exploded canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
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
        }
    }, []);

    // Lazy-mount WebGL only when needed (perf with many surfaces).
    useEffect(() => {
        let cancelled = false;

        const shouldMount =
            variant !== "surface" ||
            (!disabled && (isHovered || Boolean(active)));

        if (!shouldMount) {
            if (shaderMount.current?.destroy) {
                shaderMount.current.destroy();
                shaderMount.current = null;
            }
            return;
        }

        if (shaderMount.current) return;

        const loadShader = async () => {
            try {
                // CDN ESM import: avoids local module resolution issues in some embeds.
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - dynamic CDN import
                const { liquidMetalFragmentShader, ShaderMount } = await import(
          /* webpackIgnore: true */ PAPER_SHADERS_CDN_URL
                );
                if (cancelled) return;
                if (!shaderRef.current) return;

                shaderMount.current = new ShaderMount(
                    shaderRef.current,
                    liquidMetalFragmentShader,
                    {
                        ...(variant === "surface" ? surfaceUniforms : ctaUniforms),
                        ...(variant === "surface" && tintUniforms ? tintUniforms : {}),
                    },
                    undefined,
                    variant === "surface" ? 0 : 0.6,
                );

                if (variant === "surface") {
                    shaderMount.current?.setSpeed?.(isHovered ? 0.55 : active ? 0.08 : 0);
                }
            } catch (error) {
                console.error("[v0] Failed to load shader:", error);
            }
        };

        loadShader();

        return () => {
            cancelled = true;
        };
    }, [active, ctaUniforms, disabled, isHovered, surfaceUniforms, tintUniforms, variant]);

    useEffect(() => {
        if (variant !== "surface") return;
        if (!shaderMount.current?.setUniformValues) return;
        if (!tintUniforms) return;
        shaderMount.current.setUniformValues(tintUniforms);
    }, [tintUniforms, variant]);

    useEffect(() => {
        return () => {
            if (shaderMount.current?.destroy) {
                shaderMount.current.destroy();
                shaderMount.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (variant !== "surface") return;
        if (!shaderMount.current?.setSpeed) return;
        if (disabled) {
            shaderMount.current.setSpeed(0);
            return;
        }
        if (isHovered) {
            shaderMount.current.setSpeed(0.55);
            return;
        }
        shaderMount.current.setSpeed(active ? 0.08 : 0);
    }, [active, disabled, isHovered, variant]);

    const handleMouseEnter = () => {
        if (disabled) return;
        setIsHovered(true);
        shaderMount.current?.setSpeed?.(variant === "surface" ? 0.55 : 1);
    };

    const handleMouseLeave = () => {
        if (disabled) return;
        setIsHovered(false);
        setIsPressed(false);
        if (variant === "surface") {
            shaderMount.current?.setSpeed?.(active ? 0.08 : 0);
        } else {
            shaderMount.current?.setSpeed?.(0.6);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (variant !== "surface" || disabled) return;
        if (!buttonRef.current || !shaderMount.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / Math.max(1, rect.width);
        const y = (e.clientY - rect.top) / Math.max(1, rect.height);
        pendingPointer.current = { x, y };

        if (rafPending.current) return;
        rafPending.current = true;
        requestAnimationFrame(() => {
            rafPending.current = false;
            const p = pendingPointer.current;
            if (!p || !shaderMount.current) return;

            // Only touch uniforms that actually exist to avoid console spam.
            const locs = shaderMount.current?.uniformLocations;
            const updated: Record<string, number> = {};

            if (locs?.u_angle) updated.u_angle = 12 + p.x * 22;
            if (locs?.u_contour) updated.u_contour = 0.08 + p.y * 0.08;
            if (locs?.u_distortion) updated.u_distortion = 0.04 + (p.x * 0.06);
            if (locs?.u_offsetX) updated.u_offsetX = (p.x - 0.5) * 0.35;
            if (locs?.u_offsetY) updated.u_offsetY = (p.y - 0.5) * 0.35;

            if (Object.keys(updated).length > 0) {
                shaderMount.current?.setUniformValues?.(updated);
            }
        });
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;
        if (shaderMount.current?.setSpeed) {
            shaderMount.current.setSpeed(variant === "surface" ? 1.2 : 2.4);
            setTimeout(() => {
                if (isHovered) {
                    shaderMount.current?.setSpeed?.(variant === "surface" ? 0.55 : 1);
                } else {
                    if (variant === "surface") {
                        shaderMount.current?.setSpeed?.(active ? 0.08 : 0);
                    } else {
                        shaderMount.current?.setSpeed?.(0.6);
                    }
                }
            }, 300);
        }

        if (variant !== "surface" && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const ripple = { x, y, id: rippleId.current++ };

            setRipples((prev) => [...prev, ripple]);
            setTimeout(() => {
                setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
            }, 600);
        }

        onClick?.();
    };


    if (variant === "surface") {
        const overlayOpacity = disabled
            ? "opacity-0"
            : isHovered
                ? surfaceHoverOpacityClassName
                : active
                    ? surfaceActiveOpacityClassName
                    : surfaceIdleOpacityClassName;

        const overlaySaturationClass = tintUniforms ? "saturate-[0.65]" : "saturate-0";

        return (
            <div className={"relative " + surfaceRadiusClassName}>
                {baseTintStyle && (
                    <div
                        className={
                            "pointer-events-none absolute inset-0 " +
                            surfaceRadiusClassName +
                            " border border-white/20"
                        }
                        style={baseTintStyle}
                    />
                )}
                <div
                    ref={shaderRef}
                    className={
                        "pointer-events-none absolute inset-0 overflow-hidden mix-blend-soft-light opacity-0 transition-opacity duration-700 " +
                        surfaceRadiusClassName +
                        " " +
                        overlaySaturationClass +
                        " " +
                        overlayOpacity
                    }
                />
                <button
                    ref={buttonRef}
                    type={type}
                    disabled={disabled}
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                    onMouseDown={() => !disabled && setIsPressed(true)}
                    onMouseUp={() => !disabled && setIsPressed(false)}
                    className={
                        "relative z-10 outline-none " +
                        (isPressed && !disabled ? "translate-y-px" : "") +
                        " " +
                        surfaceRadiusClassName +
                        (className ? ` ${className}` : "")
                    }
                    aria-label={typeof label === "string" ? label : "Liquid metal button"}
                >
                    {children}
                </button>
            </div>
        );
    }

    return (
        <div className="relative inline-block text-white">
            <div
                style={{
                    perspective: "1000px",
                    perspectiveOrigin: "50% 50%",
                }}
            >
                <div
                    style={{
                        position: "relative",
                        width: `${dimensions.width}px`,
                        height: `${dimensions.height}px`,
                        transformStyle: "preserve-3d",
                        transition:
                            "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
                        transform: "none",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: `${dimensions.width}px`,
                            height: `${dimensions.height}px`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            transformStyle: "preserve-3d",
                            transition:
                                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, gap 0.4s ease",
                            transform: "translateZ(20px)",
                            zIndex: 30,
                            pointerEvents: "none",
                        }}
                    >
                        {viewMode === "icon" && (
                            <div>
                                {label}
                            </div>
                        )}
                        {viewMode === "text" && (
                            <span
                                style={{
                                    fontSize: "14px",
                                    fontWeight: 400,
                                    textShadow: "0px 1px 2px rgba(0, 0, 0, 0.5)",
                                    transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                    transform: "scale(1)",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {label}
                            </span>
                        )}
                    </div>

                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: `${dimensions.width}px`,
                            height: `${dimensions.height}px`,
                            transformStyle: "preserve-3d",
                            transition:
                                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
                            transform: `translateZ(10px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
                            zIndex: 20,
                        }}
                    >
                        <div
                            style={{
                                width: `${dimensions.innerWidth}px`,
                                height: `${dimensions.innerHeight}px`,
                                margin: "2px",
                                borderRadius: "100px",
                                background: "linear-gradient(180deg, #202020 0%, #000000 100%)",
                                boxShadow: isPressed
                                    ? "inset 0px 2px 4px rgba(0, 0, 0, 0.4), inset 0px 1px 2px rgba(0, 0, 0, 0.3)"
                                    : "none",
                                transition:
                                    "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                        />
                    </div>

                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: `${dimensions.width}px`,
                            height: `${dimensions.height}px`,
                            transformStyle: "preserve-3d",
                            transition:
                                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
                            transform: `translateZ(0px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
                            zIndex: 10,
                        }}
                    >
                        <div
                            style={{
                                height: `${dimensions.height}px`,
                                width: `${dimensions.width}px`,
                                borderRadius: "100px",
                                boxShadow: isPressed
                                    ? "0px 0px 0px 1px rgba(0, 0, 0, 0.5), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)"
                                    : isHovered
                                        ? "0px 0px 0px 1px rgba(0, 0, 0, 0.4), 0px 12px 6px 0px rgba(0, 0, 0, 0.05), 0px 8px 5px 0px rgba(0, 0, 0, 0.1), 0px 4px 4px 0px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.2)"
                                        : "0px 0px 0px 1px rgba(0, 0, 0, 0.3), 0px 36px 14px 0px rgba(0, 0, 0, 0.02), 0px 20px 12px 0px rgba(0, 0, 0, 0.08), 0px 9px 9px 0px rgba(0, 0, 0, 0.12), 0px 2px 5px 0px rgba(0, 0, 0, 0.15)",
                                transition:
                                    "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                                background: "rgb(0 0 0 / 0)",
                            }}
                        >
                            <div
                                ref={shaderRef}
                                className="shader-container-exploded"
                                style={{
                                    borderRadius: "100px",
                                    overflow: "hidden",
                                    position: "relative",
                                    width: `${dimensions.shaderWidth}px`,
                                    maxWidth: `${dimensions.shaderWidth}px`,
                                    height: `${dimensions.shaderHeight}px`,
                                    transition: "width 0.4s ease, height 0.4s ease",
                                }}
                            />
                        </div>
                    </div>

                    <button
                        ref={buttonRef}
                        type={type}
                        onClick={handleClick}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onMouseDown={() => setIsPressed(true)}
                        onMouseUp={() => setIsPressed(false)}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: `${dimensions.width}px`,
                            height: `${dimensions.height}px`,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            outline: "none",
                            zIndex: 40,
                            transformStyle: "preserve-3d",
                            transform: "translateZ(25px)",
                            transition:
                                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
                            overflow: "hidden",
                            borderRadius: "100px",
                        }}
                        aria-label={label}
                    >
                        {ripples.map((ripple) => (
                            <span
                                key={ripple.id}
                                style={{
                                    position: "absolute",
                                    left: `${ripple.x}px`,
                                    top: `${ripple.y}px`,
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "50%",
                                    background:
                                        "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)",
                                    pointerEvents: "none",
                                    animation: "ripple-animation 0.6s ease-out",
                                }}
                            />
                        ))}
                    </button>
                </div>
            </div>
        </div>
    );
}
