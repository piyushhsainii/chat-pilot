"use client";

import React, { useEffect, useId, useRef, useState } from "react";

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  variant?: "default" | "widgetIcon";
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: "R" | "G" | "B";
  yChannel?: "R" | "G" | "B";
  mixBlendMode?:
    | "normal"
    | "multiply"
    | "screen"
    | "overlay"
    | "darken"
    | "lighten"
    | "color-dodge"
    | "color-burn"
    | "hard-light"
    | "soft-light"
    | "difference"
    | "exclusion"
    | "hue"
    | "saturation"
    | "color"
    | "luminosity"
    | "plus-darker"
    | "plus-lighter";
  className?: string;
  style?: React.CSSProperties;
  contentClassName?: string;

  // Optional tint applied to the surface background (useful for widget icons).
  tint?: string;
  // 0..1 alpha for tint (defaults depend on variant).
  tintOpacity?: number;
}

const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  variant = "default",
  width,
  height,
  borderRadius,
  borderWidth,
  brightness,
  opacity,
  blur,
  displace,
  backgroundOpacity,
  saturation,
  distortionScale,
  redOffset,
  greenOffset,
  blueOffset,
  xChannel,
  yChannel,
  mixBlendMode,
  className = "",
  style = {},
  contentClassName = "",
  tint,
  tintOpacity,
}) => {
  const id = useId();
  const filterId = `glass-filter-${id}`;
  const redGradId = `red-grad-${id}`;
  const blueGradId = `blue-grad-${id}`;

  const [svgSupported, setSvgSupported] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);
  const redChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const greenChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const blueChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null);

  const resolvedWidth = width ?? (variant === "widgetIcon" ? 64 : 200);
  const resolvedHeight = height ?? (variant === "widgetIcon" ? 64 : 80);
  const resolvedBorderRadius =
    borderRadius ?? (variant === "widgetIcon" ? 999 : 20);
  const resolvedBorderWidth = borderWidth ?? 0.07;
  const resolvedBrightness = brightness ?? (variant === "widgetIcon" ? 62 : 50);
  const resolvedOpacity = opacity ?? (variant === "widgetIcon" ? 0.86 : 0.93);
  const resolvedBlur = blur ?? (variant === "widgetIcon" ? 12 : 11);
  const resolvedDisplace = displace ?? 0;

  // backgroundOpacity is used as alpha channel in CSS; normalize 0..100 inputs.
  const rawFrost = backgroundOpacity ?? (variant === "widgetIcon" ? 0.12 : 0);
  const normalizedFrost = rawFrost > 1 ? rawFrost / 100 : rawFrost;

  const resolvedSaturation = saturation ?? (variant === "widgetIcon" ? 1.25 : 1);
  const resolvedDistortionScale =
    distortionScale ?? (variant === "widgetIcon" ? -130 : -180);
  const resolvedRedOffset = redOffset ?? 0;
  const resolvedGreenOffset = greenOffset ?? 10;
  const resolvedBlueOffset = blueOffset ?? 20;
  const resolvedXChannel = xChannel ?? "R";
  const resolvedYChannel = yChannel ?? "G";
  const resolvedMixBlendMode = mixBlendMode ?? "difference";
  const resolvedTintOpacity = tintOpacity ?? (variant === "widgetIcon" ? 0.2 : 0);

  const supportsSVGFilters = () => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return false;
    }

    const isWebkit =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    if (isWebkit || isFirefox) return false;

    const div = document.createElement("div");
    (div.style as any).backdropFilter = `url(#${filterId})`;
    return Boolean((div.style as any).backdropFilter);
  };

  const toRgba = (hex: string, a: number) => {
    const v = String(hex || "").trim();
    const cleaned = v.replace(/^#/, "");
    if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, a))})`;
  };

  const generateDisplacementMap = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    const actualWidth = rect?.width || 400;
    const actualHeight = rect?.height || 200;
    const edgeSize =
      Math.min(actualWidth, actualHeight) * (resolvedBorderWidth * 0.5);

    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${resolvedBorderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${resolvedBorderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${resolvedMixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${resolvedBorderRadius}" fill="hsl(0 0% ${resolvedBrightness}% / ${resolvedOpacity})" style="filter:blur(${resolvedBlur}px)" />
      </svg>
    `;

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  };

  const updateDisplacementMap = () => {
    feImageRef.current?.setAttribute("href", generateDisplacementMap());
  };

  useEffect(() => {
    updateDisplacementMap();

    [
      { ref: redChannelRef, offset: resolvedRedOffset },
      { ref: greenChannelRef, offset: resolvedGreenOffset },
      { ref: blueChannelRef, offset: resolvedBlueOffset },
    ].forEach(({ ref, offset }) => {
      if (!ref.current) return;
      ref.current.setAttribute(
        "scale",
        (resolvedDistortionScale + offset).toString(),
      );
      ref.current.setAttribute("xChannelSelector", resolvedXChannel);
      ref.current.setAttribute("yChannelSelector", resolvedYChannel);
    });

    gaussianBlurRef.current?.setAttribute(
      "stdDeviation",
      resolvedDisplace.toString(),
    );
  }, [
    resolvedBlueOffset,
    resolvedBorderRadius,
    resolvedBorderWidth,
    resolvedBrightness,
    resolvedDisplace,
    resolvedDistortionScale,
    resolvedGreenOffset,
    resolvedHeight,
    resolvedMixBlendMode,
    resolvedOpacity,
    resolvedBlur,
    resolvedRedOffset,
    resolvedWidth,
    resolvedXChannel,
    resolvedYChannel,
  ]);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(updateDisplacementMap, 0);
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    setTimeout(updateDisplacementMap, 0);
  }, [resolvedWidth, resolvedHeight]);

  useEffect(() => {
    setSvgSupported(supportsSVGFilters());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerStyle: React.CSSProperties = {
    ...style,
    width: typeof resolvedWidth === "number" ? `${resolvedWidth}px` : resolvedWidth,
    height:
      typeof resolvedHeight === "number" ? `${resolvedHeight}px` : resolvedHeight,
    borderRadius: `${resolvedBorderRadius}px`,
    ["--glass-frost" as any]: normalizedFrost,
    ["--glass-saturation" as any]: resolvedSaturation,
    ["--filter-id" as any]: `url(#${filterId})`,
  };

  const tintColor = tint ? toRgba(tint, resolvedTintOpacity) : null;
  if (tintColor) {
    (containerStyle as any).backgroundColor = tintColor;
  }

  return (
    <div
      ref={containerRef}
      className={`glass-surface ${svgSupported ? "glass-surface--svg" : "glass-surface--fallback"} ${
        variant === "widgetIcon" ? "glass-surface--widget-icon" : ""
      } ${className}`}
      style={containerStyle}
    >
      <svg className="glass-surface__filter" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          >
            <feImage
              ref={feImageRef}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="map"
            />

            <feDisplacementMap
              ref={redChannelRef}
              in="SourceGraphic"
              in2="map"
              id="redchannel"
              result="dispRed"
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="red"
            />

            <feDisplacementMap
              ref={greenChannelRef}
              in="SourceGraphic"
              in2="map"
              id="greenchannel"
              result="dispGreen"
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="green"
            />

            <feDisplacementMap
              ref={blueChannelRef}
              in="SourceGraphic"
              in2="map"
              id="bluechannel"
              result="dispBlue"
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="blue"
            />

            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur
              ref={gaussianBlurRef}
              in="output"
              stdDeviation="0.7"
            />
          </filter>
        </defs>
      </svg>

      <div className={`glass-surface__content ${contentClassName}`.trim()}>
        {children}
      </div>
    </div>
  );
};

export default GlassSurface;
