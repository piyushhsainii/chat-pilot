"use client";
import { useState } from "react";
import BotCard from "./BotCard";
import { AnswerStyle, BotTone } from "@/lib/types";

const DEFAULT_BOT = {
  id: "bot-persistent-test",
  workspaceId: "Demo Workspace",
  name: "Global Support Bot",
  systemPrompt: "You are an AI assistant for the global support team.",
  tone: BotTone.PROFESSIONAL,
  status: "active",
  answerStyle: AnswerStyle.DETAILED,
  fallbackBehavior: "I cannot find that in the documents.",
  embedSettings: { theme: "light", primaryColor: "#6366f1" },
};

const Agents = () => {
  const [bots, setbots] = useState([DEFAULT_BOT]);
  const [selectedBot, setSelectedBot] = useState(DEFAULT_BOT);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black tracking-tighter">My Agents</h2>
        <button
          // onClick={}
          className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-lg tracking-tighter"
        >
          + New Agent
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <BotCard key={bot.id} bot={bot} onSelect={setSelectedBot} />
        ))}
      </div>
    </div>
  );
};

export default Agents;
