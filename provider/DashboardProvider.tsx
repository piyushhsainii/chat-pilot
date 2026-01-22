"use client";

import { DashboardContext, DashboardData } from "./DashboardContext";

export default function DashboardProvider({
  data,
  children,
}: {
  data: DashboardData;
  children: React.ReactNode;
}) {
  return (
    <DashboardContext.Provider value={data}>
      {children}
    </DashboardContext.Provider>
  );
}
