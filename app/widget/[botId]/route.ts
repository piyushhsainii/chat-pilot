import { NextRequest, NextResponse } from "next/server";
import { validateBot } from "@/lib/bot/validateBot";
import { generateChatHTML } from "@/lib/widget/generateChatHTML";

export async function GET(
  req: NextRequest,
  { params }: { params: { botId: string } },
) {
  const bot = await validateBot(params.botId, req.headers.get("referer"));
  if (!bot) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const html = generateChatHTML({
    botId: params.botId,
    name: bot.widgets?.title || bot.name,
    theme: "light",
    primary: bot.widgets?.primary_color || "6366f1",
    textColor: "ffffff",
    embedded: false,
    welcomeMessage: bot.widgets?.greeting_message || "Hi! How can I help you?",
  });

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
