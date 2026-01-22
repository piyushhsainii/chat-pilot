
import React from 'react';

const Security: React.FC = () => {
  const securityFeatures = [
    { icon: '🗄️', title: "Your data stays yours", desc: "We never use your data to train our base models." },
    { icon: '🔒', title: "Data encryption", desc: "All data is encrypted in transit (TLS 1.2+) and at rest (AES-256)." },
    { icon: '🧊', title: "Secure integrations", desc: "Isolated sandboxes for all API actions and executions." },
    { icon: '🛡️', title: "Active monitoring", desc: "24/7 automated vulnerability scanning and SOC reporting." }
  ];

  return (
    <section className="py-24 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="w-full lg:w-1/3">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Enterprise-grade security & privacy</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">We maintain the highest standards of security to ensure your customers' data and your business assets are always protected.</p>
            <div className="flex gap-4 mb-8">
               <div className="w-16 h-16 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-400">SOC 2 TYPE II</div>
               <div className="w-16 h-16 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-400">GDPR</div>
            </div>
            <a href="#" className="text-indigo-600 font-bold hover:underline flex items-center gap-2">
              Learn more about our trust center →
            </a>
          </div>

          <div className="w-full lg:w-2/3 grid sm:grid-cols-2 gap-8">
             {securityFeatures.map((f, i) => (
               <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                 <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">{f.icon}</div>
                 <h4 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h4>
                 <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
