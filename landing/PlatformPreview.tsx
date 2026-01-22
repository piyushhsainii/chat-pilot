
import React, { useState } from 'react';

const tabs = ["Playground", "Analytics", "Activity", "Sources", "Actions"];

const PlatformPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Playground");

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Discover the Chatbase platform</h2>
          <p className="text-slate-600 text-lg">A unified command center for your AI workforce.</p>
        </div>

        <div className="bg-slate-50 rounded-[2.5rem] p-4 md:p-8 border border-slate-100 shadow-inner">
          <div className="flex flex-wrap justify-center gap-2 mb-8 bg-white/50 backdrop-blur p-2 rounded-2xl border border-slate-200 w-fit mx-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:text-slate-800 hover:bg-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in transition-all duration-500">
            <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-100 bg-slate-50/50">
               <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
               </div>
               <div className="ml-4 bg-white border border-slate-200 px-3 py-1 rounded-md text-[10px] text-slate-400 font-mono w-64 truncate">
                 https://app.chatbase.co/{activeTab.toLowerCase()}
               </div>
            </div>
            <div className="p-4 md:p-10 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                 <img src={`https://picsum.photos/seed/${activeTab}/1000/600`} alt={activeTab} className="rounded-lg shadow-sm w-full max-w-4xl mx-auto" />
                 <p className="mt-8 text-slate-400 font-medium italic">Displaying {activeTab} mockup...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformPreview;
