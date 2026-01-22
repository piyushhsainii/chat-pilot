
import React from 'react';

const FinalCTA: React.FC = () => {
  return (
    <section className="py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto gradient-bg rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-900/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1]">
            Make customer experience your <br className="hidden md:block" /> competitive edge
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
            Join 10,000+ companies delivering instant, accurate, and empathetic support with Chatbase.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="bg-white text-indigo-600 px-10 py-5 rounded-full font-bold text-xl hover:bg-indigo-50 transition-all hover:scale-105 shadow-xl">
              Build your agent
            </button>
            <button className="bg-white/10 backdrop-blur border border-white/20 text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-white/20 transition-all">
              Schedule Demo
            </button>
          </div>
          <p className="mt-8 text-white/60 text-sm font-medium">No credit card required. Setup in 5 minutes.</p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
