import { createClient } from "@/lib/supabase/server";

export async function trackEvent(
  botId: string,
  event: string,
  metadata: Record<string, any> = {},
) {
  const supabase = await createClient();

  await supabase.from("widget_analytics").insert({
    bot_id: botId,
    event_type: event,
    metadata,
  });
}
