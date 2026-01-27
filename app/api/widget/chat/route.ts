import { NextRequest, NextResponse } from "next/server";
import { validateBot } from "@/lib/bot/validateBot";
import { generateChatHTML } from "@/lib/widget/generateChatHTML";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId");

  if (!botId) {
    return new NextResponse("Missing botId", { status: 400 });
  }

  const bot = await validateBot(botId, req.headers.get("referer"));
  if (!bot) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const allowedDomains = bot.bot_settings?.allowed_domains?.length
    ? bot.bot_settings.allowed_domains
        .map((d: string) => `https://${d}`)
        .join(" ")
    : "*";

  const csp = `
    default-src 'none';
    style-src 'unsafe-inline';
    img-src data:;
    script-src 'unsafe-inline';
    connect-src https://api.openai.com https://chatpilot.ai;
    frame-ancestors ${allowedDomains};
  `.replace(/\s+/g, " ");

  const html = generateChatHTML({
    botId,
    name: bot.widgets?.title || bot.name,
    theme: (bot.widgets?.theme as "light" | "dark") || "light",
    primary: bot.widgets?.primary_color || "6366f1",
    textColor: "ffffff",
    embedded: true,
    welcomeMessage: bot.widgets?.greeting_message || "Hi! How can I help you?",
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Security-Policy": csp,
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
