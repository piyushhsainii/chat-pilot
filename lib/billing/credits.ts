import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const TRIAL_CREDITS = 50;

function debugCredits(...args: any[]) {
  if (process.env.DEBUG_CREDITS !== "1") return;
  // eslint-disable-next-line no-console
  console.info("[credits]", ...args);
}

export class OutOfCreditsError extends Error {
  code = "OUT_OF_CREDITS" as const;
  constructor(message = "Out of credits") {
    super(message);
    this.name = "OutOfCreditsError";
  }
}

export function isOutOfCreditsError(err: unknown) {
  return (
    err instanceof OutOfCreditsError ||
    (typeof err === "object" &&
      err !== null &&
      (err as any).code === "OUT_OF_CREDITS")
  );
}

async function ensureOwnerCreditsRow(admin: ReturnType<typeof createAdminClient>, ownerId: string) {
  // Ensure row exists (trial credits for first-time users)
  const { data: existing, error: existingError } = await admin
    .from("user_credits")
    .select("user_id")
    .eq("user_id", ownerId)
    .maybeSingle();
  if (existingError) throw existingError;

  if (existing) return;

  debugCredits("creating trial credits row", { ownerId, balance: TRIAL_CREDITS });

  const { error: insertError } = await admin
    .from("user_credits")
    .insert({ user_id: ownerId, balance: TRIAL_CREDITS });
  if (insertError) throw insertError;
}

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

  const amountAbs = Math.abs(amount);
  if (!amountAbs) return null;

  debugCredits("consume start", { ownerId, botId: botId ?? null, amount: amountAbs, reason });

  await ensureOwnerCreditsRow(admin, ownerId);

  // Optimistic concurrency loop to avoid lost updates under parallel requests.
  // This makes credit consumption effectively atomic without requiring a DB RPC.
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: current, error: currentError } = await admin
      .from("user_credits")
      .select("balance")
      .eq("user_id", ownerId)
      .single();
    if (currentError) throw currentError;

    const balance = Number(current?.balance ?? 0);
    debugCredits("read balance", { ownerId, attempt, balance });
    if (balance < amountAbs) throw new OutOfCreditsError();

    const nextBalance = balance - amountAbs;

    const { data: updated, error: updateError } = await admin
      .from("user_credits")
      .update({ balance: nextBalance, updated_at: new Date().toISOString() })
      .eq("user_id", ownerId)
      .eq("balance", balance)
      .select("balance")
      .maybeSingle();
    if (updateError) throw updateError;

    if (!updated) continue;

    debugCredits("consume success", {
      ownerId,
      botId: botId ?? null,
      reason,
      prevBalance: balance,
      nextBalance: nextBalance,
    });

    // Best-effort transaction log (if table exists in your DB)
    await admin.from("credit_transactions").insert({
      user_id: ownerId,
      bot_id: botId ?? null,
      amount: -amountAbs,
      type: "usage",
      reason,
    } as any);

    return updated.balance;
  }

  throw new Error("Failed to consume credits (contention)");
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
