
import React from "react";

const testimonials = [
  {
    quote:
      "We reduced repetitive tickets without changing our workflow. The agent feels consistent and dependable.",
    author: "Marc Manara",
    role: "OpenAI",
    img: "https://picsum.photos/seed/p1/120/120",
  },
  {
    quote:
      "The fastest path from docs to a production-ready agent. Simple setup, serious results.",
    author: "Logan Kilpatrick",
    role: "Google",
    img: "https://picsum.photos/seed/p2/120/120",
  },
  {
    quote:
      "We finally have visibility into what customers ask and where the agent needs refinement.",
    author: "Greg Kogan",
    role: "Pinecone",
    img: "https://picsum.photos/seed/p3/120/120",
  },
  {
    quote:
      "Multilingual support was a must. The experience is consistent across teams and countries.",
    author: "Martin Terskin",
    role: "OfferMarket",
    img: "https://picsum.photos/seed/p4/120/120",
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-zinc-50 text-black">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black">
            Testimonials
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-zinc-950">
            Loved for simplicity. Trusted for outcomes.
          </h2>
          <p className="mt-4 text-base text-zinc-600 leading-relaxed">
            Teams choose a calm, predictable system that feels professional to
            their customers.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4 text-black">
          {testimonials.map((t) => (
            <figure
              key={t.author}
              className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_14px_50px_-40px_rgba(0,0,0,0.35)]"
            >
              <blockquote className="text-sm text-zinc-700 leading-relaxed">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <img
                  src={t.img}
                  alt={t.author}
                  className="h-10 w-10 rounded-full border border-zinc-200 grayscale"
                />
                <div>
                  <div className="text-sm font-semibold text-zinc-950">
                    {t.author}
                  </div>
                  <div className="text-xs text-zinc-500">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <div className="text-3xl font-semibold tracking-tight text-zinc-950">
              10,000+
            </div>
            <div className="mt-1 text-sm text-zinc-600">
              Teams using agents in production
            </div>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <div className="text-3xl font-semibold tracking-tight text-zinc-950">
              140+
            </div>
            <div className="mt-1 text-sm text-zinc-600">Countries served</div>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <div className="text-3xl font-semibold tracking-tight text-zinc-950">
              Minutes
            </div>
            <div className="mt-1 text-sm text-zinc-600">
              From docs to a deployed agent
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
