
import React, { useState } from 'react';

const steps = [
  { id: 1, title: "Build & deploy your agent", desc: "Upload docs, sync your help center, or point to your URL. Deploy in minutes.", img: "https://picsum.photos/seed/step1/800/600" },
  { id: 2, title: "Agent solves your customers' problems", desc: "Your agent uses real-time context to provide accurate answers instantly.", img: "https://picsum.photos/seed/step2/800/600" },
  { id: 3, title: "Refine & optimize", desc: "Use human-in-the-loop to teach your agent and improve response quality.", img: "https://picsum.photos/seed/step3/800/600" },
  { id: 4, title: "Route complex issues to a human", desc: "Smart escalation automatically hands off complex tickets to your support team.", img: "https://picsum.photos/seed/step4/800/600" },
  { id: 5, title: "Review analytics & insights", desc: "Deep visibility into agent performance and customer satisfaction trends.", img: "https://picsum.photos/seed/step5/800/600" }
];

const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-16 text-center">An end-to-end solution for conversational AI</h2>
        
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="w-full lg:w-1/2 space-y-4">
            {steps.map((step, idx) => (
              <div 
                key={step.id} 
                onMouseEnter={() => setActiveStep(idx)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${activeStep === idx ? 'bg-indigo-50 border-indigo-200 shadow-md translate-x-2' : 'border-transparent hover:bg-slate-50'}`}
              >
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${activeStep === idx ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {step.id}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold mb-2 transition-colors ${activeStep === idx ? 'text-indigo-900' : 'text-slate-900'}`}>{step.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-1/2">
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-100 animate-fade-in transition-all duration-500">
              <img 
                key={activeStep}
                src={steps[activeStep].img} 
                alt={steps[activeStep].title} 
                className="w-full h-full object-cover transition-opacity duration-300" 
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
