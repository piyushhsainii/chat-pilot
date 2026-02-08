import { NextRequest } from "next/server";
import { validateBot } from "@/lib/bot/validateBot";

function isSafeCallbackName(name: string) {
  // Allow identifiers like __chatpilot_cfg_123
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId");
  const callback = searchParams.get("callback");

  if (!botId || !callback || !isSafeCallbackName(callback)) {
    return new Response("// invalid request\n", {
      status: 400,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const bot = await validateBot(
    botId,
    req.headers.get("origin") || req.headers.get("referer"),
  );
  if (!bot) {
    const body = `try { window[${JSON.stringify(callback)}](null); } catch (e) {}`;
    return new Response(body, {
      status: 403,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const payload = {
    bot: {
      id: bot.id,
      name: bot.name,
    },
    widget: {
      title: bot.widgets?.title ?? null,
      theme: (bot.widgets?.theme as any) ?? null,
      primary_color: bot.widgets?.primary_color ?? null,
      button_color: bot.widgets?.button_color ?? null,
      text_color: bot.widgets?.text_color ?? null,
      greeting_message: bot.widgets?.greeting_message ?? null,
    },
  };

  const body = `try { window[${JSON.stringify(callback)}](${JSON.stringify(payload)}); } catch (e) {}`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
