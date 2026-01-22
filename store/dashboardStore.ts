import { Tables } from "@/lib/supabase/database.types";
import { User } from "@supabase/supabase-js";
import { create } from "zustand";

interface DashboardState {
  user: User | null;
  workspace: Tables<"workspace_users"> | null;
  bots: Tables<"bots">[] | null;

  setDashboard: (data: Partial<DashboardData>) => void;
  clearDashboard: () => void;
}
interface DashboardData {
  user: User;
  workspace: Tables<"workspace_users"> | null;
  bots: Tables<"bots">[] | null;
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
