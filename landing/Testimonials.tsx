
import React from 'react';

const testimonials = [
  { quote: "Chatbase has completely changed how we handle basic support queries. Our team can now focus on high-impact work.", author: "Marc Manara", role: "OpenAI", img: "https://picsum.photos/seed/p1/100/100" },
  { quote: "The easiest way to put a custom AI on your website. Period.", author: "Logan Kilpatrick", role: "Google", img: "https://picsum.photos/seed/p2/100/100" },
  { quote: "It literally takes 5 minutes to set up. Incredible ROI.", author: "Greg Kogan", role: "Pinecone", img: "https://picsum.photos/seed/p3/100/100" },
  { quote: "The multilingual support is what won us over. Seamless experience across 14 countries.", author: "Martin Terskin", role: "OfferMarket", img: "https://picsum.photos/seed/p4/100/100" }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
       {/* Decorative circles */}
       <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
       <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/5 rounded-full translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">What people say</h2>
        <p className="text-slate-600 text-lg mb-16">With over 10,000 clients served, here's what they have to say</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
               <img src={t.img} alt={t.author} className="w-16 h-16 rounded-full mb-6 ring-4 ring-indigo-50" />
               <p className="text-slate-700 italic mb-6 leading-relaxed">"{t.quote}"</p>
               <div className="mt-auto">
                 <div className="font-bold text-slate-900">{t.author}</div>
                 <div className="text-sm text-indigo-600 font-medium">{t.role}</div>
               </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="p-10 rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center">
             <div className="text-5xl font-black gradient-text mb-2">10,000+</div>
             <div className="text-slate-500 font-bold uppercase tracking-widest text-xs">Businesses trust Chatbase</div>
          </div>
          <div className="p-10 rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center">
             <div className="text-5xl font-black gradient-text mb-2">140+</div>
             <div className="text-slate-500 font-bold uppercase tracking-widest text-xs">Countries served</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
