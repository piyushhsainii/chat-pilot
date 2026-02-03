import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const TRIAL_CREDITS = 50;

export async function ensureTrialCreditsForUser(userId: string) {
  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("user_credits")
    .select("user_id,balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing;

  const { data: inserted, error: insertError } = await supabase
    .from("user_credits")
    .insert({ user_id: userId, balance: TRIAL_CREDITS })
    .select("user_id,balance")
    .single();

  if (insertError) throw insertError;
  return inserted;
}

export async function getCreditsForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_credits")
    .select("user_id,balance,alert_20_sent,alert_5_sent,updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Privileged: consumes credits for the bot owner (used by public widget/chat endpoints).
export async function consumeCreditsForOwner({
  ownerId,
  botId,
  amount,
  reason,
}: {
  ownerId: string;
  botId?: string;
  amount: number;
  reason: string;
}) {
  const admin = createAdminClient();

  // Ensure row exists (trial credits for first-time users)
  const { data: existing, error: existingError } = await admin
    .from("user_credits")
    .select("user_id")
    .eq("user_id", ownerId)
    .maybeSingle();
  if (existingError) throw existingError;

  if (!existing) {
    const { error: insertError } = await admin
      .from("user_credits")
      .insert({ user_id: ownerId, balance: TRIAL_CREDITS });
    if (insertError) throw insertError;
  }

  const { data: current, error: currentError } = await admin
    .from("user_credits")
    .select("balance")
    .eq("user_id", ownerId)
    .single();

  if (currentError) throw currentError;

  const nextBalance = Math.max(0, (current?.balance ?? 0) - Math.abs(amount));

  const { data: updated, error: updateError } = await admin
    .from("user_credits")
    .update({ balance: nextBalance, updated_at: new Date().toISOString() })
    .eq("user_id", ownerId)
    .select("balance")
    .single();

  if (updateError) throw updateError;

  // Best-effort transaction log (if table exists in your DB)
  await admin.from("credit_transactions").insert({
    user_id: ownerId,
    bot_id: botId ?? null,
    amount: -Math.abs(amount),
    type: "usage",
    reason,
  } as any);

  return updated.balance;
}

export async function getOwnerCreditsPrivileged(ownerId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("user_credits")
    .select("balance")
    .eq("user_id", ownerId)
    .maybeSingle();
  if (error) throw error;
  return data?.balance ?? null;
}
