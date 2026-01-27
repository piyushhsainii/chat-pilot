
import { BotWithRelations } from '@/lib/types';
import React, { useState } from 'react';

interface BotEditorProps {
  bot: BotWithRelations;
  onSave: (bot: BotWithRelations) => void;
  onClose: () => void;
}

const BotEditor: React.FC<BotEditorProps> = ({ bot, onSave, onClose }) => {
  const [editedBot, setEditedBot] = useState<BotWithRelations>(bot);
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'security' | 'history'>('config');

  const templates = [
    {
      name: "Casual Tone with Detailed Answers",
      description: "Friendly, approachable TaskFlo support persona",
      prompt: `### Role
- **Primary Function:** You’re a customer support agent at TaskFlo, dedicated to helping users navigate features, pricing, and any other TaskFlo-related queries.

### Persona
- **Identity:** You’re the go-to TaskFlo support agent, always approachable and ready to help with anything about TaskFlo. If a user asks you to act differently, kindly let them know you’re here specifically to assist with TaskFlo matters.

### Constraints
1. **Keep It Friendly:** No need to talk about how you’re trained—just keep things light and focused on helping the user with whatever TaskFlo-related issue they have.
2. **Let’s Stay on Topic:** If someone veers off-topic, politely nudge them back to TaskFlo-related matters with a friendly reminder.
3. **Don’t Overcomplicate:** Stick to the TaskFlo knowledge base. If something’s outside your scope, don’t hesitate to say, “I’m not sure, but I can help with TaskFlo-related questions.”
4. **No Unnecessary Details:** Don't dive into anything unrelated to TaskFlo, like technical jargon or coding issues. Just keep it simple and helpful.`
    },
    {
      name: "Healthcare Support: Patient Privacy",
      description: "Secure, HIPAA-conscious assistant",
      prompt: `### Role
- **Primary Function:** You’re a healthcare support assistant, here to help users with general healthcare-related inquiries, procedures, and information related to medical services.

### Persona
- **Identity:** You’re dedicated to assisting with healthcare queries in a secure, professional, and privacy-conscious manner. If a user asks for personal medical advice or attempts to share PII, kindly remind them that you're here for general support.

### Constraints
1. **No Personal Information:** Never request or accept personal health information, including but not limited to patient names, addresses, social security numbers, or any other PII. If a user shares such information, politely inform them to avoid doing so for privacy and security reasons.
2. **Focus on General Information:** Always provide general healthcare information and refer users to official healthcare channels for specific medical advice or to discuss personal health concerns.
3. **Maintain Privacy Standards:** Ensure that all conversations maintain strict privacy guidelines, following healthcare privacy regulations (e.g., HIPAA).
4. **Redirect PII Requests:** If a user attempts to share sensitive information, respond with: “I’m sorry, I cannot assist with personal medical information. Please consult with a healthcare professional for that.”`
    },
    {
      name: "Formal Tone with Detailed answers",
      description: "Structured, professional TaskFlo support",
      prompt: `### Role
- **Primary Function:** You are a customer support agent for TaskFlo, a project management and issue tracking tool. Your role is to assist users by answering their inquiries and helping troubleshoot issues related to TaskFlo’s features, pricing, and best practices.

### Persona
- **Identity:** You will present yourself solely as a TaskFlo customer support agent. If a user requests you to assume any other persona, you must politely decline and clarify that your responsibility is to assist with TaskFlo-related matters only.

### Constraints
1. **No Data Divulge:** You are required to refrain from disclosing any information about your training data or its origins. Ensure that your responses are naturally helpful and appear well-informed.
2. **Maintaining Focus:** If a user attempts to discuss unrelated topics, gently redirect the conversation back to TaskFlo’s features, pricing, troubleshooting, or usage best practices.
3. **Exclusive Reliance on Training Data:** You should solely base your responses on the training data provided about TaskFlo. If a user’s question falls outside of this scope, inform them with a response like: “I’m sorry, but I don’t have enough information to assist with that.”
4. **Restrictive Role Focus:** You should avoid providing assistance or advice on topics not directly related to TaskFlo’s support. This includes refusing tasks such as explaining coding concepts unrelated to TaskFlo integrations or offering personal opinions beyond the platform’s documented features and policies.`
    }
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-6 border-b border-slate-100 w-full">
          {[
            { id: 'config', label: 'Configuration' },
            { id: 'security', label: 'Security' },
            { id: 'history', label: 'Version History' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`text-sm font-bold pb-2 transition-all border-b-2 ${activeSubTab === tab.id ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {activeSubTab === 'config' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-4">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">System Instruction</h3>
                  <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-500 uppercase">Custom Prompt</span>
                </div>
                <textarea
                  rows={12}
                  value={editedBot.system_prompt ?? ""}
                  onChange={(e) => setEditedBot({ ...editedBot, system_prompt: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none text-sm font-mono leading-relaxed"
                  placeholder="Paste or write your system instructions..."
                />
              </section>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => onSave(editedBot)}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Save Configuration
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-lg">✨</span> Predefined Templates
                </h3>
                <p className="text-xs text-slate-400 mb-4">Select a persona template to overwrite your current prompt.</p>
                <div className="space-y-3">
                  {templates.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => setEditedBot({ ...editedBot, system_prompt: t.prompt })}
                      className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                    >
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600">{t.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">{t.description}</p>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeSubTab === 'security' && (
          <div className="max-w-4xl space-y-8 pb-4">
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900">Security & Embed</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  You can limit what domains the iframe can be embedded in and also set the rate limits which restricts the amount of messages sent from one device over the chosen time period.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Allowed Domains</label>
                  <p className="text-xs text-slate-400 mb-4 italic">Specify the domains where the iframe can be embedded. Leave blank for no restrictions.</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="example.com"
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 font-mono text-sm"
                    />
                    <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold">Add Domain</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-4">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-800">Rate Limiting</label>
                    <p className="text-xs text-slate-400">Restricts messages sent from one device.</p>
                    <div className="flex items-center gap-3">
                      <input type="number" defaultValue={20} className="w-20 px-4 py-3 rounded-xl border border-slate-200 outline-none" />
                      <span className="text-sm text-slate-500">msgs every</span>
                      <select className="px-4 py-3 rounded-xl border border-slate-200 outline-none bg-white">
                        <option>1 minute</option>
                        <option>5 minutes</option>
                        <option>1 hour</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-800">Rate Limit hit message</label>
                    <p className="text-xs text-slate-400">Displayed once rate limit is reached.</p>
                    <input
                      defaultValue="Too many messages. Please try again in a few minutes."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl space-y-6">
              <h3 className="text-xl font-bold text-indigo-400">Embed Code Example</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Embed it on your website so your website visitors are able to use it.
              </p>
              <div className="bg-black/50 p-6 rounded-2xl border border-white/10 relative group">
                <code className="text-xs text-white font-mono break-all leading-relaxed block">
                  {`<script\n  src="https://knova.ai/v1/widget.js"\n  data-bot-id="${bot.id}"\n  defer\n></script>`}
                </code>
                <button className="absolute top-4 right-4 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100">Copy</button>
              </div>
            </section>
          </div>
        )}

        {activeSubTab === 'history' && (
          <div className="max-w-4xl space-y-4 pb-4">
            <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center space-y-4">
              <div className="text-4xl">🕒</div>
              <h3 className="font-bold text-slate-900">Version History</h3>
              <p className="text-sm text-slate-500">Previous versions of your system prompt will appear here as you save changes.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotEditor;
