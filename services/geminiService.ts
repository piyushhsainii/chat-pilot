
/** 
 * DEPRECATED: Please use services/chatService.ts instead.
 * This file is kept temporarily for migration reference.
 */
import { GoogleGenAI } from "@google/genai";
import { Bot } from "../types";

export const generateBotResponse = async (bot: Bot, query: string, context: string) => {
  console.warn("Using deprecated geminiService. Transition to chatService (Vercel AI SDK) recommended.");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: query,
    config: { systemInstruction: `Tone: ${bot.tone}. Context: ${context}` },
  });
  return response.text;
};
