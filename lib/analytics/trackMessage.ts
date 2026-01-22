// lib/analytics/trackMessage.ts
import { createClient } from "@/lib/supabase/server";

export async function trackMessage({
  botId,
  question,
  answer,
}: {
  botId: string;
  question: string;
  answer: string;
}) {
  const supabase = await createClient();

  await supabase.from("chat_logs").insert({
    bot_id: botId,
    question,
    answer,
  });
}
