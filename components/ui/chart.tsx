"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label: string;
    color?: string;
  }
>;

function styleForChartConfig(config: ChartConfig) {
  const style: Record<string, string> = {};
  for (const [key, v] of Object.entries(config)) {
    if (v?.color) style[`--color-${key}`] = v.color;
  }
  return style as React.CSSProperties;
}

export function ChartContainer({
  config,
  className,
  children,
}: {
  config: ChartConfig;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("h-full w-full", className)}
      style={styleForChartConfig(config)}
    >
      {children}
    </div>
  );
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean;
  payload?: Array<{ value?: number } & Record<string, any>>;
  label?: string | number;
  valueFormatter?: (value: number) => string;
}) {
  if (!active) return null;
  const row = payload?.[0];
  const color =
    (row as any)?.fill ||
    (row as any)?.color ||
    (row as any)?.payload?.fill ||
    "#6366f1";
  const valueRaw = Number(row?.value ?? 0);
  const value = valueFormatter ? valueFormatter(valueRaw) : String(valueRaw);

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div className="text-xs font-semibold text-slate-500">{label}</div>
      </div>
      <div className="mt-0.5 text-sm font-black tracking-tight text-slate-900">
        {value}
      </div>
    </div>
  );
}
