import { createClient } from "@/lib/supabase/server";

export async function requireAuthedSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { supabase, user: null as any, workspaceId: null as any };
  }

  const { data: workspaceUser } = await supabase
    .from("workspace_users")
    .select("workspace_id")
    .eq("auth_user_id", session.user.id)
    .single();

  return {
    supabase,
    user: session.user,
    workspaceId: (workspaceUser as any)?.workspace_id as string | null,
  };
}

export function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}
