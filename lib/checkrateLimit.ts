import { createClient } from "./supabase/server";

type RateLimitRow = {
  id: string;
  bot_id: string;
  ip: string;
  count: number;
  window_start: string;
};

export async function checkRateLimit(
  botId: string,
  ip: string,
  limit: number,
): Promise<boolean> {
  const supabase = await createClient();

  const now = new Date();
  const windowStart = new Date(now.getTime() - 60_000);

  const { data, error } = await supabase
    .from("rate_limits")
    .select("*")
    .eq("bot_id", botId)
    .eq("ip", ip)
    .maybeSingle<RateLimitRow>();

  // ✅ First request → create row
  if (!data) {
    await supabase.from("rate_limits").insert({
      bot_id: botId,
      ip,
      count: 1,
      window_start: now.toISOString(),
    });
    return true;
  }

  const currentWindowStart = new Date(data.window_start);

  // ✅ Reset window
  if (currentWindowStart < windowStart) {
    await supabase
      .from("rate_limits")
      .update({
        count: 1,
        window_start: now.toISOString(),
      })
      .eq("id", data.id);

    return true;
  }

  // ❌ Rate limit exceeded
  if (data.count >= limit) {
    return false;
  }

  // ✅ Increment count
  await supabase
    .from("rate_limits")
    .update({ count: data.count + 1 })
    .eq("id", data.id);

  return true;
}
