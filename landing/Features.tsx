
import React from "react";

const features = [
  {
    title: "Sync your knowledge",
    desc: "Keep your agent current with docs from Notion, Drive, and your website.",
    img: "https://picsum.photos/seed/sync/900/600",
    wide: true,
  },
  {
    title: "Take actions",
    desc: "Connect tools like Stripe and Salesforce so your agent can resolve, not just reply.",
    img: "https://picsum.photos/seed/action/900/600",
    wide: false,
  },
  {
    title: "Model flexibility",
    desc: "Choose the best model for cost, latency, and accuracy.",
    img: "https://picsum.photos/seed/models/900/600",
    wide: false,
  },
  {
    title: "Smart escalation",
    desc: "Hand off complex cases to humans with full context.",
    img: "https://picsum.photos/seed/esc/900/600",
    wide: false,
  },
  {
    title: "Analytics that matter",
    desc: "See what users ask, what resolves, and where to improve.",
    img: "https://picsum.photos/seed/report/900/600",
    wide: false,
  },
];

const integrations = [
  "Zendesk",
  "Notion",
  "Slack",
  "Stripe",
  "Salesforce",
  "Zapier",
  "WhatsApp",
  "Intercom",
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Product
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-zinc-950">
            Everything you need to ship a reliable agent
          </h2>
          <p className="mt-4 text-base text-zinc-600 leading-relaxed">
            Built for support teams who want fewer tickets and more confidence.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className={`rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_14px_50px_-40px_rgba(0,0,0,0.35)] hover:shadow-[0_20px_70px_-50px_rgba(0,0,0,0.45)] transition ${
                f.wide ? "md:col-span-2" : ""
              }`}
            >
              <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50">
                <img
                  src={f.img}
                  alt={f.title}
                  className="w-full h-44 md:h-48 object-cover saturate-0 contrast-110"
                />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-zinc-950">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-zinc-200 bg-zinc-50 p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-zinc-950">
                Integrates with your stack
              </h3>
              <p className="mt-2 text-sm text-zinc-600">
                Connect the systems you already use. Keep workflows simple.
              </p>
            </div>
            <div className="text-sm font-semibold text-zinc-950">
              One-click connections
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {integrations.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="text-sm font-semibold text-zinc-950">API</div>
              <div className="mt-1 text-xs text-zinc-600">
                Extend actions and data flows.
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="text-sm font-semibold text-zinc-950">White-label</div>
              <div className="mt-1 text-xs text-zinc-600">
                Match your brand in minutes.
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="text-sm font-semibold text-zinc-950">Observability</div>
              <div className="mt-1 text-xs text-zinc-600">
                Audit logs and quality tools.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
