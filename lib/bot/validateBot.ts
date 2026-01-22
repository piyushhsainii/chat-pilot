import { createClient } from "../supabase/server";

export async function validateBot(botId: string, referer?: string | null) {
  const supabaseServer = await createClient();

  const { data, error } = await supabaseServer
    .from("bots")
    .select(
      `
      id,
      name,
      system_prompt,
      fallback_behavior,
      widgets (
        title,
        greeting_message,
        theme,
        primary_color,
        button_color
      ),
      bot_settings (
        allowed_domains
      )
    `,
    )
    .eq("id", botId)
    .single();

  if (error || !data) return null;

  const allowedDomains =
    data?.bot_settings &&
    data?.bot_settings?.allowed_domains?.map((data) => data);

  if (allowedDomains && allowedDomains.length > 0 && referer) {
    const domain = new URL(referer).hostname;

    const allowed = allowedDomains.some(
      (allowed: string) => domain === allowed || domain.endsWith(`.${allowed}`),
    );

    if (!allowed) return null;
  }

  return data;
}
