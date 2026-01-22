import { NextRequest } from "next/server";
import OpenAI from "openai";
import { validateBot } from "@/lib/bot/validateBot";
import { matchDocuments } from "@/lib/rag/matchDocuments";
import { createClient } from "@/lib/supabase/server";

import { trackEvent } from "@/lib/analytics/trackEvent";
import { checkAndSendAlerts } from "@/lib/billing/checkAndSendAlerts";
import { trackMessage } from "@/lib/analytics/trackMessage";
import { checkRateLimit } from "@/lib/checkrateLimit";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { botId, message } = await req.json();
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  /* -------------------------------------------------------
     1️⃣ Validate bot + domain
  ------------------------------------------------------- */
  const bot = await validateBot(botId, req.headers.get("referer"));
  if (!bot) {
    return new Response("Unauthorized", { status: 403 });
  }

  /* -------------------------------------------------------
     2️⃣ Rate limiting (bot_settings)
  ------------------------------------------------------- */
  const allowed = await checkRateLimit(botId, ip, bot.settings.rate_limit);

  if (!allowed) {
    return new Response(
      bot.settings.rate_limit_hit_message || "Too many requests",
      { status: 429 },
    );
  }

  /* -------------------------------------------------------
     3️⃣ RAG context retrieval
  ------------------------------------------------------- */
  const contextDocs = await matchDocuments(botId, message);

  /* -------------------------------------------------------
     4️⃣ Start LLM streaming
  ------------------------------------------------------- */
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [
      { role: "system", content: bot.system_prompt ?? "" },
      {
        role: "system",
        content: `Use ONLY the context below:\n${contextDocs}`,
      },
      { role: "user", content: message },
    ],
  });

  const encoder = new TextEncoder();
  let fullAnswer = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        /* -------------------------------------------------------
           5️⃣ Stream tokens to client
        ------------------------------------------------------- */
        for await (const chunk of stream) {
          const token = chunk.choices[0]?.delta?.content;
          if (!token) continue;

          fullAnswer += token;
          controller.enqueue(encoder.encode(token));
        }

        /* -------------------------------------------------------
           6️⃣ Persist analytics (SUCCESSFUL response)
        ------------------------------------------------------- */
        await trackMessage({
          botId,
          question: message,
          answer: fullAnswer,
        });

        await trackEvent(botId, "message_answered", {
          chars: fullAnswer.length,
        });

        /* -------------------------------------------------------
           7️⃣ 🔥 BILLING — deduct 1 credit (ATOMIC)
        ------------------------------------------------------- */
        const supabase = await createClient();

        const { data: success } = await supabase.rpc("deduct_credit", {
          p_user_id: bot.owner_id,
        });

        if (!success) {
          console.warn("⚠️ User ran out of credits:", bot.owner_id);
          // Optional: log or flag account
        }

        /* -------------------------------------------------------
           8️⃣ 🔔 Low-credit email alerts
        ------------------------------------------------------- */
        await checkAndSendAlerts(bot.owner_id);
      } catch (err) {
        console.error("❌ Streaming error:", err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
