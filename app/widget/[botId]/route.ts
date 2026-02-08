import { NextRequest, NextResponse } from "next/server";
import { validateBot } from "@/lib/bot/validateBot";
import { generateChatHTML } from "@/lib/widget/generateChatHTML";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ botId: string }> },
) {
  const { botId } = await context.params;

  const bot = await validateBot(
    botId,
    req.headers.get("origin") || req.headers.get("referer"),
  );
  if (!bot) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const html = generateChatHTML({
    botId,
    name: bot.widgets?.title || bot.name,
    theme: (bot.widgets?.theme as "light" | "dark") || "light",
    primary: bot.widgets?.primary_color || "",
    textColor: bot.widgets?.text_color || "ffffff",
    embedded: false,
    welcomeMessage: bot.widgets?.greeting_message || "Hi! How can I help you?",
  });

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
