
import React from "react";

const advantages = [
  {
    title: "Works across channels",
    desc: "Deploy to web, Slack, WhatsApp, and more with one configuration.",
    img: "https://picsum.photos/seed/ch/900/600",
    wide: true,
  },
  {
    title: "Secure by default",
    desc: "Encryption in transit and at rest, with modern access controls.",
    img: "https://picsum.photos/seed/sc/900/600",
  },
  {
    title: "Quality guardrails",
    desc: "Constrain answers, block topics, and reduce hallucinations.",
    img: "https://picsum.photos/seed/gr/900/600",
  },
  {
    title: "Clarifies uncertainty",
    desc: "Asks the right question before it answers.",
    img: "https://picsum.photos/seed/uq/900/600",
  },
  {
    title: "Global ready",
    desc: "Multilingual support for worldwide customer bases.",
    img: "https://picsum.photos/seed/lang/900/600",
  },
];

const Advantages: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Built for deployment
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-zinc-950">
            Powerful fundamentals, no complexity
          </h2>
          <p className="mt-4 text-base text-zinc-600 leading-relaxed">
            The features that matter to reliability, safety, and scale.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {advantages.map((adv: any) => (
            <div
              key={adv.title}
              className={`rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_14px_50px_-40px_rgba(0,0,0,0.35)] hover:shadow-[0_20px_70px_-50px_rgba(0,0,0,0.45)] transition ${
                adv.wide ? "md:col-span-2" : ""
              }`}
            >
              <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50">
                <img
                  src={adv.img}
                  alt={adv.title}
                  className="w-full h-40 md:h-44 object-cover saturate-0 contrast-110"
                />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-zinc-950">
                {adv.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                {adv.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advantages;
