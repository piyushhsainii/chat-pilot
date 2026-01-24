import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";

export const runtime = "edge"; // Enable Edge Runtime for streaming

export async function POST(req: NextRequest) {
  try {
    const { bot, query, contextChunks } = await req.json();

    const context = contextChunks.join("\n\n");

    const systemInstruction = `
You are an AI assistant for ${bot.name}.
Tone: ${bot.tone}
Answer Style: ${bot.answerStyle}

Rules:
- Answer ONLY from the provided context.
- If the answer is not in the context, say: "${bot.fallbackBehavior}"
- Tone should strictly be ${bot.tone}.
- Provide ${bot.answerStyle} answers.

Context:
${context}
    `.trim();

    const result = await streamText({
      model: openai(bot.model || "gpt-4o-mini"),
      system: systemInstruction,
      prompt: query,
      temperature: 0.1,
    });

    // Create a readable stream for SSE (Server-Sent Events)
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const textPart of result.textStream) {
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
