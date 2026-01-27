"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import { Tables } from "@/lib/supabase/database.types";
import { User } from "@supabase/supabase-js";
import { BotWithRelations } from "@/lib/types";

type WorkspaceUserWithWorkspace = Tables<"workspace_users"> & {
  workspaces: Tables<"workspaces">;
};

export default function DashboardHydrator({
  data,
}: {
  data: {
    user: User;
    workspaces: WorkspaceUserWithWorkspace | null;
    bots: BotWithRelations[] | null;
  };
}) {
  const setDashboard = useDashboardStore((s) => s.setDashboard);

  useEffect(() => {
    setDashboard(data);
  }, [data, setDashboard]);

  return null;
}
