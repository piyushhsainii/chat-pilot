import { NextRequest, NextResponse } from "next/server";
import { validateBot } from "@/lib/bot/validateBot";

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

  // Redirect to the dedicated widget UI. Returning an HTML shell that loads
  // `widget.js` can cause nested widget injection when used inside iframes.
  const url = new URL("/widget/chat", req.url);
  url.searchParams.set("botId", botId);
  url.searchParams.set("embedded", "true");
  return NextResponse.redirect(url, 307);
}
