import { createClient } from "../supabase/server";

function hostnameFromUrlLike(value?: string | null): string | null {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  // Accept full URLs (https://example.com/page) or origins (https://example.com)
  // and also handle bare domains (example.com, localhost:3000).
  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    try {
      return new URL(`http://${raw}`).hostname.toLowerCase();
    } catch {
      return null;
    }
  }
}

function normalizeAllowedDomain(value: string): string | null {
  const v = String(value || "").trim().toLowerCase();
  if (!v) return null;

  // Support entries like:
  // - example.com
  // - https://example.com
  // - *.example.com
  if (v.startsWith("*.")) {
    const base = hostnameFromUrlLike(v.slice(2));
    return base ? `*.${base}` : null;
  }

  return hostnameFromUrlLike(v);
}

function isHostnameAllowed(hostname: string, allowedDomains: string[]) {
  const h = hostname.toLowerCase();
  return allowedDomains.some((allowedRaw) => {
    const allowed = normalizeAllowedDomain(allowedRaw);
    if (!allowed) return false;

    if (allowed.startsWith("*.")) {
      const base = allowed.slice(2);
      return h === base || h.endsWith(`.${base}`);
    }

    return h === allowed || h.endsWith(`.${allowed}`);
  });
}

export async function validateBot(
  botId: string,
  originOrReferer?: string | null,
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
        text_color
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
  const hostname = hostnameFromUrlLike(originOrReferer);
  if (!hostname) return null;

  if (!isHostnameAllowed(hostname, allowedDomains)) return null;

  return data;
}
