
import React from 'react';

const Highlights: React.FC = () => {
  const cards = [
    {
      title: "Purpose-built for LLMs",
      desc: "Our architecture is optimized for large language models to ensure accuracy and speed in every conversation.",
      img: "https://picsum.photos/seed/llm/400/300"
    },
    {
      title: "Designed for simplicity",
      desc: "From training on your help docs to customizing the UI, everything is designed to be set up in minutes.",
      img: "https://picsum.photos/seed/ui/400/300"
    },
    {
      title: "Engineered for security",
      desc: "Enterprise-grade safety features and compliance built in. Your data is encrypted and stays yours.",
      img: "https://picsum.photos/seed/sec/400/300"
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">The complete platform for AI support agents</h2>
          <p className="text-slate-600 text-lg">Powerful tools to solve customer problems before they reach your inbox.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="rounded-xl overflow-hidden mb-6 h-48 bg-slate-100">
                <img src={card.img} alt={card.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{card.title}</h3>
              <p className="text-slate-600 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Highlights;
