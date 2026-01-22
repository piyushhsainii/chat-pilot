
import React from 'react';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$0',
      credits: '500',
      features: ['1 AI Agent', 'URL Crawling', 'Basic Analytics', 'Standard Support'],
      button: 'Current Plan',
      isCurrent: true
    },
    {
      name: 'Pro',
      price: '$49',
      credits: '5,000',
      features: ['5 AI Agents', 'PDF & Doc Ingestion', 'Advanced RAG', 'API Access', 'Priority Support'],
      button: 'Upgrade to Pro',
      isCurrent: false,
      popular: true
    },
    {
      name: 'Business',
      price: '$199',
      credits: '25,000',
      features: ['Unlimited Agents', 'Custom Branding', 'SLA Guarantee', 'Dedicated Manager', 'White-label Widget'],
      button: 'Contact Sales',
      isCurrent: false
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black tracking-tighter text-slate-900">Simple, Credit-Based Pricing</h2>
        <p className="text-slate-500 max-w-xl mx-auto tracking-tighter">
          Every response from your AI agent consumes 1 credit. Scale your knowledge base as your business grows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`relative p-8 rounded-[2.5rem] border bg-white transition-all hover:shadow-xl ${
              plan.popular ? 'border-indigo-600 ring-4 ring-indigo-50 shadow-lg shadow-indigo-100' : 'border-slate-200'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Most Popular
              </span>
            )}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 tracking-tighter">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                <span className="text-slate-400 font-bold text-sm">/month</span>
              </div>
              <p className="mt-4 text-indigo-600 font-black text-sm tracking-tighter">
                {plan.credits} Monthly Credits
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-slate-600 font-medium tracking-tighter">
                  <span className="text-indigo-500 text-lg">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              className={`w-full py-4 rounded-2xl font-bold transition-all tracking-tighter ${
                plan.isCurrent 
                  ? 'bg-slate-100 text-slate-400 cursor-default' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
              }`}
            >
              {plan.button}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-2">
          <h4 className="text-xl font-bold tracking-tighter">Need more credits?</h4>
          <p className="text-slate-400 text-sm tracking-tighter">Top up your balance anytime without changing plans.</p>
        </div>
        <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all tracking-tighter">
          Buy 1,000 Credits ($15)
        </button>
      </div>
    </div>
  );
};

export default Pricing;
