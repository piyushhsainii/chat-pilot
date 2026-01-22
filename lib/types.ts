export interface Bot {
  id: string;
  workspaceId: string;
  name: string;
  systemPrompt: string;
  tone: BotTone;
  answerStyle: AnswerStyle;
  fallbackBehavior: string;
  status: BotStatus;
  embedSettings: {
    theme: "light" | "dark";
    primaryColor: string;
  };
  versionHistory?: { version: string; date: string; note: string }[];
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

export interface Bot {
  id: string;
  workspaceId: string;
  name: string;
  systemPrompt: string;
  tone: BotTone;
  answerStyle: AnswerStyle;
  fallbackBehavior: string;
  status: BotStatus;
  embedSettings: {
    theme: "light" | "dark";
    primaryColor: string;
  };
  versionHistory?: { version: string; date: string; note: string }[];
}
