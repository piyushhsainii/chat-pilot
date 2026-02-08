import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function hostnameFromUrlLike(value?: string | null): string | null {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
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

function isAllowedHostname(hostname: string, allowed: string[]) {
  const h = hostname.toLowerCase();
  return allowed.some((raw) => {
    const a = hostnameFromUrlLike(raw);
    if (!a) return false;
    return h === a || h.endsWith(`.${a}`);
  });
}

function extractSupabaseStorageObject(urlRaw: string): { bucket: string; path: string } | null {
  try {
    const u = new URL(urlRaw);
    const markers = [
      "/storage/v1/object/public/",
      "/storage/v1/object/sign/",
      "/storage/v1/object/",
    ];

    for (const m of markers) {
      const idx = u.pathname.indexOf(m);
      if (idx < 0) continue;
      const rest = u.pathname.slice(idx + m.length).replace(/^\/+/, "");
      const parts = rest.split("/").filter(Boolean);
      const bucket = parts.shift();
      if (!bucket) continue;
      const path = parts.join("/");
      if (!path) continue;
      return { bucket, path };
    }
  } catch {
    // ignore
  }

  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId");

  if (!botId) {
    return NextResponse.json({ error: "Missing botId" }, { status: 400 });
  }

  const supabase = await createClient();

  // 1. Load bot
  const { data: bot } = await supabase
    .from("bots")
    .select("id, name, owner_id, tone, avatar_url")
    .eq("id", botId)
    .single();
  if (!bot) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  // 2. Load settings + widget
  const [{ data: settings }, { data: widget }] = await Promise.all([
    supabase.from("bot_settings").select("*").eq("bot_id", botId).single(),

    supabase.from("widgets").select("*").eq("bot_id", botId).single(),
  ]);

  // Enforce domain restrictions when configured.
  const allowedDomains = (settings as any)?.allowed_domains?.filter(Boolean) ?? [];
  if (allowedDomains.length) {
    const serverHostname = new URL(req.url).hostname.toLowerCase();
    const reqHostname = hostnameFromUrlLike(
      req.headers.get("origin") || req.headers.get("referer"),
    );

    const ok =
      !!reqHostname &&
      (reqHostname === serverHostname ||
        reqHostname.endsWith(`.${serverHostname}`) ||
        isAllowedHostname(reqHostname, allowedDomains));

    if (!ok) {
      return NextResponse.json({ error: "Unauthorized origin" }, { status: 403 });
    }
  }

  const { count: sourcesCount } = await supabase
    .from("knowledge_sources" as any)
    .select("id", { count: "exact", head: true })
    .eq("bot_id", botId)
    .neq("status", "failed");

  // 3. Create anonymous session
  const { data: session } = await supabase
    .from("chat_sessions")
    .insert({
      bot_id: botId,
      is_anonymous: true,
    })
    .select("id")
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Avatar URL may point to a private Storage object. If so, return a signed URL.
  let avatarUrl: string | null = (bot as any)?.avatar_url ?? null;
  if (avatarUrl && typeof avatarUrl === "string") {
    const obj = extractSupabaseStorageObject(avatarUrl);
    if (obj) {
      try {
        const admin = createAdminClient();
        const { data } = await admin.storage
          .from(obj.bucket)
          .createSignedUrl(obj.path, 60 * 60);
        if (data?.signedUrl) avatarUrl = data.signedUrl;
      } catch {
        // If service role key is missing or signing fails, fall back to stored URL.
      }
    }
  }

  return NextResponse.json({
    session_id: session.id,
    bot: {
      id: bot.id,
      name: bot.name,
      tone: (bot as any)?.tone ?? null,
      avatar_url: avatarUrl,
    },
    widget: {
      title: widget?.title ?? "AI Assistant",
      greeting: widget?.greeting_message,
      theme: widget?.theme,
      primary_color: widget?.primary_color,
      button_color: widget?.button_color,
      text_color: widget?.text_color,
    },
    limits: {
      rate_limit: settings?.rate_limit ?? 60,
      rate_limit_hit_message: settings?.rate_limit_hit_message,
    },
    knowledge: {
      sources_count: sourcesCount ?? 0,
    },
  });
}
