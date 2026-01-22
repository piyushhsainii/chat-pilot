
import React from 'react';
import { Bot } from '../types';

interface BotCardProps {
  bot: Bot;
  onSelect: (bot: Bot) => void;
}

const BotCard: React.FC<BotCardProps> = ({ bot, onSelect }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full" onClick={() => onSelect(bot)}>
      <div className="flex justify-between items-start mb-4">
        <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-2xl">
          🤖
        </div>
        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded uppercase tracking-tighter">Active</span>
      </div>
      <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors tracking-tighter">{bot.name}</h3>
      <p className="text-sm text-slate-500 mt-1 line-clamp-2 flex-grow tracking-tighter">{bot.systemPrompt}</p>
      
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-medium border-t border-slate-50 pt-4">
        <div className="flex items-center gap-2">
          <span className="bg-slate-100 px-2 py-0.5 rounded tracking-tighter">{bot.tone}</span>
          <span className="tracking-tighter">542 chats</span>
        </div>
        <button className="text-indigo-600 font-bold hover:underline tracking-tighter">Edit Bot →</button>
      </div>
    </div>
  );
};

export default BotCard;
