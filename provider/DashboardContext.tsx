"use client";

import { createContext, useContext } from "react";

export interface DashboardData {
  user: any;
  workspace: any;
  bots: any[];
}

export const DashboardContext = createContext<DashboardData | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used inside DashboardProvider");
  }
  return ctx;
}
