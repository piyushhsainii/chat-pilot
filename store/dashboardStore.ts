import { Tables } from "@/lib/supabase/database.types";
import { BotWithRelations, WorkspaceUserWithWorkspace } from "@/lib/types";
import { User } from "@supabase/supabase-js";
import { create } from "zustand";

interface DashboardState {
  user: User | null;
  workspaces: WorkspaceUserWithWorkspace | null;
  bots: BotWithRelations[] | null;

  setDashboard: (data: Partial<DashboardState>) => void;
  clearDashboard: () => void;
}

interface DashboardData {
  user: User;
  workspace: Tables<"workspace_users"> | null;
  bots: Tables<"bots">[] | null;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  user: null,
  workspaces: null,
  bots: null,

  setDashboard: (data) =>
    set((state) => ({
      ...state,
      ...data,
    })),

  clearDashboard: () =>
    set({
      user: null,
      workspaces: null,
      bots: null,
    }),
}));
