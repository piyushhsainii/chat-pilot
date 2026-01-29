
import React from "react";

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
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Built for quality
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-zinc-950">
            A complete platform for customer-facing AI
          </h2>
          <p className="mt-4 text-base text-zinc-600 leading-relaxed">
            Powerful controls, clean workflows, and the reliability you need to
            ship.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_12px_40px_-30px_rgba(0,0,0,0.35)] hover:shadow-[0_18px_60px_-40px_rgba(0,0,0,0.45)] transition"
            >
              <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50">
                <img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-44 object-cover saturate-0 contrast-110"
                />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-zinc-950">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Highlights;
