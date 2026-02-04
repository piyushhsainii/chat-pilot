import { NextRequest, NextResponse } from "next/server";
import { validateBot } from "@/lib/bot/validateBot";

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (origin) headers.Vary = "Origin";

  return headers;
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req),
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId");

  if (!botId) {
    return NextResponse.json(
      { error: "Missing botId" },
      { status: 400, headers: corsHeaders(req) },
    );
  }

  const bot = await validateBot(botId, req.headers.get("referer"));
  if (!bot) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403, headers: corsHeaders(req) },
    );
  }

  return NextResponse.json(
    {
      bot: {
        id: bot.id,
        name: bot.name,
      },
      widget: {
        title: bot.widgets?.title ?? null,
        theme: (bot.widgets?.theme as any) ?? null,
        primary_color: bot.widgets?.primary_color ?? null,
        button_color: bot.widgets?.button_color ?? null,
        text_color: (bot.widgets as any)?.text_color ?? null,
        greeting_message: bot.widgets?.greeting_message ?? null,
      },
    },
    { headers: corsHeaders(req) },
  );
}
