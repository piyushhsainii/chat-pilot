
import React from 'react';

const benefitItems = [
  { icon: '✨', title: "Personalized answers", desc: "Trained on your specific data for maximum relevance." },
  { icon: '⚡', title: "Instant actions", desc: "Not just talk — your agent performs tasks via API." },
  { icon: '🤝', title: "Empathetic & on-brand", desc: "Customizable personality to match your brand voice." },
  { icon: '🚀', title: "Smart escalations", desc: "Knows when to hand off to a human expert." },
  { icon: '📊', title: "Observability", desc: "Full audit logs and quality monitoring tools." },
];

const Benefits: React.FC = () => {
  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/10 blur-[120px] rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Works like the best customer service agents</h2>
            <p className="text-slate-400 text-lg mb-12">Combine human-level understanding with machine-level speed and scale.</p>
            
            <div className="space-y-8">
              {benefitItems.map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-all">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1 group-hover:text-indigo-300 transition-colors">{item.title}</h4>
                    <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="relative rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl">
              <img src="https://picsum.photos/seed/agent/600/800" alt="Agent Working" className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Agent Online</span>
                 </div>
                 <p className="text-sm italic">"I've successfully updated your subscription and applied the discount for next month. Anything else I can help with?"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
