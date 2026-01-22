
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white pt-24 pb-12 px-4 md:px-8 border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="lg:col-span-1">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white font-bold italic">C</div>
                <span className="text-xl font-bold text-slate-900">Chatbase</span>
             </div>
             <p className="text-slate-500 mb-8 leading-relaxed max-w-xs">
               The world's leading AI support agent platform. Empowering teams to provide better service at scale.
             </p>
             <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all">YT</a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all">LI</a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all">X</a>
             </div>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Product</h5>
            <ul className="space-y-4 text-slate-500 font-medium">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Customer Service</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Experts</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Affiliates</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Resources</h5>
            <ul className="space-y-4 text-slate-500 font-medium">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">User Guide</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Changelog</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Company</h5>
            <ul className="space-y-4 text-slate-500 font-medium">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Trust Center</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="text-slate-400 text-sm font-medium">
             © 2026 Chatbase, Inc. All rights reserved.
           </div>
           <div className="flex gap-6 items-center">
              <div className="px-3 py-1 rounded-md bg-slate-50 text-slate-400 font-bold text-[8px] uppercase border border-slate-200">SOC 2 Type II</div>
              <div className="px-3 py-1 rounded-md bg-slate-50 text-slate-400 font-bold text-[8px] uppercase border border-slate-200">GDPR Compliant</div>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
