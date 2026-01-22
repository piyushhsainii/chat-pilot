
import React from 'react';

const DocsViewer: React.FC = () => {
  const sections = [
    {
      title: "System Architecture",
      content: "KnovaAI utilizes an Edge-Runtime Chat API for sub-200ms latency. The retrieval-augmented generation (RAG) pipeline is isolated per bot ID."
    },
    {
      title: "Knowledge Ingestion",
      content: "Documents uploaded are processed by n8n. Text is normalized, stripped of noise, and chunked into 400-token segments with 10% overlap."
    },
    {
      title: "Widget Integration",
      content: "The chat widget is a lightweight (<15kb) script that lazy-loads the UI only upon user interaction to preserve your site's SEO and Core Web Vitals."
    }
  ];

  return (
    <div className="max-w-4xl space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-2xl mb-2">🏗️</div>
          <h4 className="font-bold text-slate-800">Architecture</h4>
          <p className="text-xs text-slate-500 mt-1">Multi-tenant RAG design docs.</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-2xl mb-2">⚡</div>
          <h4 className="font-bold text-slate-800">API Access</h4>
          <p className="text-xs text-slate-500 mt-1">Webhooks and REST endpoints.</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-2xl mb-2">🔌</div>
          <h4 className="font-bold text-slate-800">Web Widget</h4>
          <p className="text-xs text-slate-500 mt-1">UI customization guides.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Technical Documentation</h3>
        </div>
        <div className="p-8 space-y-10">
          {sections.map((s, i) => (
            <div key={i} className="space-y-3">
              <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600">#</span> {s.title}
              </h4>
              <p className="text-slate-600 leading-relaxed text-sm">
                {s.content}
              </p>
              <div className="h-px bg-slate-100 w-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocsViewer;
