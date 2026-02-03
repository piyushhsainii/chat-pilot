import { createAdminClient } from "@/lib/supabase/admin";

export async function insertChatLog({
  botId,
  question,
  answer,
  environment,
  metadata,
}: {
  botId: string;
  question: string;
  answer: string;
  environment?: string;
  metadata?: Record<string, any>;
}) {
  const admin = createAdminClient();

  await admin.from("chat_logs").insert({
    bot_id: botId,
    question,
    answer,
    environment: environment ?? null,
    metadata: metadata ?? {},
  } as any);
}
