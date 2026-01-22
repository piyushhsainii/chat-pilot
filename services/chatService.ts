
import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Bot } from '../types';

/**
 * Chat Runtime using Vercel AI SDK and OpenAI
 * This mimics the logic required for the Edge Runtime chat endpoint.
 */
export const executeChatQuery = async (bot: Bot, query: string, contextChunks: string[]) => {
  const context = contextChunks.join('\n\n');
  
  const systemInstruction = `
    You are an AI assistant for ${bot.name}.
    Tone: ${bot.tone}
    
    Rules:
    - Answer ONLY from the provided context.
    - If the answer is not in the context, say: "${bot.fallbackBehavior}"
    - Offer escalation when confidence is low.
    - Tone should strictly be ${bot.tone}.

    Context:
    ${context}
  `;

  // Using GPT-4o-mini as requested in tech stack (Fast + Practical)
  const result = await generateText({
    model: openai('gpt-4o-mini'),
    system: systemInstruction,
    prompt: query,
    temperature: 0.1, // Low temperature for high factual accuracy in RAG
  });

  return {
    text: result.text,
    usage: result.usage,
    finishReason: result.finishReason
  };
};

/**
 * Streaming version for the Chat UI
 */
export const streamChatQuery = async (bot: Bot, query: string, contextChunks: string[]) => {
  const context = contextChunks.join('\n\n');
  
  return streamText({
    model: openai('gpt-4o-mini'),
    system: `AI for ${bot.name}. Tone: ${bot.tone}. Context: ${context}`,
    prompt: query,
  });
};
