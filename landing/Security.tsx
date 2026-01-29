
import React from "react";

const Security: React.FC = () => {
  const securityFeatures = [
    {
      title: "Your data stays yours",
      desc: "We don’t use your content to train base models. You control retention and access.",
    },
    {
      title: "Encryption by default",
      desc: "Traffic is encrypted in transit and data is encrypted at rest.",
    },
    {
      title: "Scoped integrations",
      desc: "Connect tools with least-privilege access and clear audit trails.",
    },
    {
      title: "Monitoring & controls",
      desc: "Operational guardrails for reliability and security posture.",
    },
  ];

  return (
    <section id="security" className="py-20 md:py-28 bg-white border-y border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid gap-10 lg:grid-cols-3 lg:items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Security
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-zinc-950">
              Enterprise-grade security and privacy
            </h2>
            <p className="mt-4 text-base text-zinc-600 leading-relaxed">
              Designed to protect your customer data and your internal systems.
              Clear controls, predictable behavior.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold text-zinc-700">
                SOC 2 Type II
              </span>
              <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold text-zinc-700">
                GDPR
              </span>
              <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold text-zinc-700">
                TLS
              </span>
              <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold text-zinc-700">
                Encryption at rest
              </span>
            </div>

            <a
              href="#"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-950 hover:opacity-80 transition"
            >
              Trust center
              <span className="text-zinc-400">→</span>
            </a>
          </div>

          <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
            {securityFeatures.map((f) => (
              <div
                key={f.title}
                className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-2xl border border-zinc-200 bg-white flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-sky-400" />
                  </div>
                  <div className="text-sm font-semibold text-zinc-950">
                    {f.title}
                  </div>
                </div>
                <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
