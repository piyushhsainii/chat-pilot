
import React from 'react';

const advantages = [
  { title: "Works across channels", desc: "Deploy to Slack, WhatsApp, Messenger, and more with one click.", img: "https://picsum.photos/seed/ch/400/250" },
  { title: "Secure by default", desc: "Data encryption in transit and at rest. SOC 2 compliant storage.", img: "https://picsum.photos/seed/sc/400/250" },
  { title: "Enterprise quality guardrails", desc: "Control response constraints and block unwanted topics effortlessly.", img: "https://picsum.photos/seed/gr/400/250" },
  { title: "Handles unclear requests", desc: "Asks clarifying questions instead of guessing intent.", img: "https://picsum.photos/seed/uq/400/250" },
  { title: "80+ Languages", desc: "Multilingual support for global customer bases out of the box.", img: "https://picsum.photos/seed/lang/400/250" },
];

const Advantages: React.FC = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-16 text-center">Unlock the power of AI-driven Agents</h2>
        
        <div className="flex gap-6 overflow-x-auto pb-12 snap-x hide-scrollbar">
          {advantages.map((adv, i) => (
            <div key={i} className="min-w-[320px] md:min-w-[400px] snap-center bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="rounded-2xl overflow-hidden mb-6 aspect-video bg-slate-200">
                <img src={adv.img} alt={adv.title} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">{adv.title}</h3>
              <p className="text-slate-600 leading-relaxed">{adv.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advantages;
