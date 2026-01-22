
import React from 'react';

const features = [
  { title: "Sync with real-time data", desc: "Keep your agent updated with live data from Notion, Google Drive, and your website.", img: "https://picsum.photos/seed/sync/600/400", wide: true },
  { title: "Take actions on your systems", desc: "Connect to Stripe, Salesforce, and more to perform tasks, not just answer questions.", img: "https://picsum.photos/seed/action/600/400", wide: false },
  { title: "Compare AI models", desc: "Select from Gemini, GPT, or Anthropic models to find the perfect balance for your needs.", img: "https://picsum.photos/seed/models/600/400", wide: false },
  { title: "Smart escalation", desc: "Seamlessly route customers to live agents in Zendesk, Slack, or Intercom.", img: "https://picsum.photos/seed/esc/600/400", wide: false },
  { title: "Advanced reporting", desc: "Understand exactly how your agent is performing with deep analytics.", img: "https://picsum.photos/seed/report/600/400", wide: false },
];

const integrations = ["Make", "Zendesk", "Notion", "Slack", "Stripe", "Salesforce", "Cal.com", "Calendly", "WhatsApp", "Zapier", "Messenger"];

const Features: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 text-center">Build the perfect customer-facing AI agent</h2>
        <p className="text-slate-600 text-lg text-center mb-16 max-w-3xl mx-auto">Everything you need to ship a reliable, production-ready support agent in hours, not weeks.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((f, i) => (
            <div key={i} className={`bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all ${f.wide ? 'md:col-span-2' : ''}`}>
              <div className="mb-6 rounded-2xl overflow-hidden h-48 bg-slate-50">
                <img src={f.img} alt={f.title} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Integrates with your entire stack</h3>
          <div className="flex flex-wrap justify-center gap-6">
            {integrations.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 group">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all group-hover:-translate-y-1">
                  <span className="text-slate-400 font-bold text-xs uppercase">{item.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center gap-8">
            <div className="px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100">
               <span className="font-bold text-slate-800">API</span>
               <p className="text-xs text-slate-500">Powerful developer tools</p>
            </div>
            <div className="px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100">
               <span className="font-bold text-slate-800">Whitelabel</span>
               <p className="text-xs text-slate-500">Your brand, our power</p>
            </div>
            <div className="px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100">
               <span className="font-bold text-slate-800">Always improving</span>
               <p className="text-xs text-slate-500">Auto-learning agents</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
