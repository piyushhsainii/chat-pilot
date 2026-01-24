import { Tables } from "./supabase/database.types";

export interface Bot {
  id: string;
  workspaceId: string;
  name: string;
  systemPrompt: string;
  tone: BotTone;
  status: string;
  answerStyle: AnswerStyle;
  fallbackBehavior: string;
  embedSettings: { theme: string; primaryColor: string };
  model?: string;
  contextChunks?: string[];
}
export interface KnowledgeSource {
  id: string;
  botId: string;
  type: "pdf" | "url" | "text";
  name: string;
  status: "indexed" | "processing" | "failed";
  lastIndexed: string;
}

export enum BotTone {
  PROFESSIONAL = "Professional",
  FRIENDLY = "Friendly",
  SALES = "Sales",
  TECHNICAL = "Technical",
}

export enum AnswerStyle {
  SHORT = "Short & Concise",
  DETAILED = "Detailed & Explanatory",
}

export type BotStatus = "indexing" | "active" | "error";

export type WorkspaceUserWithWorkspace = Tables<"workspace_users"> & {
  workspaces: Tables<"workspaces"> | null;
};

/* Bot with relations */
export type BotWithRelations = Tables<"bots"> & {
  widgets: Tables<"widgets"> | null;
  bot_settings: Tables<"bot_settings"> | null;
};
