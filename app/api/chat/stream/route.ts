import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildKnowledgeContext } from "@/lib/knowledge/buildKnowledgeContext";

export const runtime = "edge"; // Enable Edge Runtime for streaming

export async function POST(req: NextRequest) {
  try {
    const { botId, query, history } = await req.json();

    if (!botId || !query) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = await createClient();

    const { data: bot, error: botError } = await supabase
      .from("bots" as any)
      .select("id, name, tone, model, fallback_behavior, system_prompt")
      .eq("id", botId)
      .single();

    if (botError || !bot) {
      return new Response(JSON.stringify({ error: "Bot not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const botData = bot as any;

    const { data: sources } = await supabase
      .from("knowledge_sources" as any)
      .select("name, type, status, doc_url")
      .eq("bot_id", botId)
      .neq("status", "failed")
      .order("created_at", { ascending: false });

    const { contextText } = await buildKnowledgeContext(
      ((sources as any[]) ?? []) as any,
    );

    const systemInstruction = `
You are an AI assistant for "${botData.name}".
Tone: ${botData.tone || "professional"}

Instructions (from bot configuration):
${botData.system_prompt || "Be helpful and concise."}

Rules:
- Use the knowledge context below to answer.
- If you cannot find the answer in the knowledge, reply with: "${
      botData.fallback_behavior || "Sorry, I could not answer that."
    }"

${contextText}
`.trim();

    const normalizedHistory = Array.isArray(history)
      ? history
          .slice(-12)
          .map((m: any) => ({
            role: m.role === "bot" ? "assistant" : "user",
            content: String(m.text ?? ""),
          }))
          .filter((m: any) => m.content.trim().length > 0)
      : [];

    const messages = [
      { role: "system", content: systemInstruction },
      ...normalizedHistory,
      { role: "user", content: String(query) },
    ] as any;

    const result = await streamText({
      model: openai(botData.model || "gpt-4o-mini"),
      messages,
      temperature: 0.1,
    });

    // Create a readable stream for SSE (Server-Sent Events)
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const textPart of result.textStream) {
            if (!textPart) continue;

            const data = JSON.stringify({ content: textPart });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          // Send done signal
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat stream:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
