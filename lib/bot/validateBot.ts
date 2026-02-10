import { createClient } from "../supabase/server";
import {
  hasLocalhostInAllowedDomains,
  hostnameFromUrlLike,
  isHostnameAllowed,
  isLocalhostHostname,
} from "./allowedDomains";

export async function validateBot(
  botId: string,
  originOrReferer?: string | null,
  requestHostname?: string | null,
) {
  const supabaseServer = await createClient();

  const { data, error } = await supabaseServer
    .from("bots")
    .select(
      `
      id,
      name,
      owner_id,
      system_prompt,
      fallback_behavior,
      widgets (
        title,
        greeting_message,
        theme,
        primary_color,
        button_color,
        text_color,
        launcher_surface,
        panel_surface
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
    (data as any)?.bot_settings?.allowed_domains?.filter(Boolean) ?? [];

  // If no allowed domains are configured, allow from any origin.
  if (!allowedDomains.length) return data;

  // If domains are configured, require a request origin/referrer we can validate.
  const allowLocalhost = hasLocalhostInAllowedDomains(allowedDomains);
  const hostname = hostnameFromUrlLike(originOrReferer);

  if (hostname) {
    if (allowLocalhost && isLocalhostHostname(hostname)) return data;
    if (!isHostnameAllowed(hostname, allowedDomains)) return null;
    return data;
  }

  // Some script/iframe embeds can omit Origin/Referer due to host Referrer-Policy.
  // If the bot explicitly allows localhost and the request is served from localhost,
  // treat it as allowed for local development.
  if (allowLocalhost && requestHostname && isLocalhostHostname(requestHostname)) {
    return data;
  }

  return null;

  return data;
}
