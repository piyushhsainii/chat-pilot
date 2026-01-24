import { BotWithRelations, WorkspaceUserWithWorkspace } from "@/lib/types";
import { User } from "@supabase/supabase-js";
import { create } from "zustand";

interface DashboardState {
  user: User | null;
  workspace: WorkspaceUserWithWorkspace | null;
  bots: BotWithRelations[] | null;

  setDashboard: (data: Partial<DashboardData>) => void;
  clearDashboard: () => void;
}

interface DashboardData {
  user: User;
  workspace: WorkspaceUserWithWorkspace | null;
  bots: BotWithRelations[] | null;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  user: null,
  workspace: null,
  bots: null,

  setDashboard: (data) =>
    set((state) => ({
      ...state,
      ...data,
    })),

  clearDashboard: () =>
    set({
      user: null,
      workspace: null,
      bots: null,
    }),
}));
