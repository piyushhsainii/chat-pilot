
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const data = [
  { name: 'Mon', queries: 400, confidence: 85, cost: 0.12 },
  { name: 'Tue', queries: 300, confidence: 88, cost: 0.09 },
  { name: 'Wed', queries: 200, confidence: 92, cost: 0.06 },
  { name: 'Thu', queries: 278, confidence: 90, cost: 0.08 },
  { name: 'Fri', queries: 189, confidence: 86, cost: 0.05 },
  { name: 'Sat', queries: 239, confidence: 89, cost: 0.07 },
  { name: 'Sun', queries: 349, confidence: 91, cost: 0.10 },
];

const Analytics: React.FC = () => {
  const [trainingLogs, setTrainingLogs] = useState([
    { id: 1, q: "How do I cancel my annual subscription?", count: 12, status: 'unanswered', suggestion: "Update Pricing Policy section" },
    { id: 2, q: "Is there a student discount available?", count: 8, status: 'low_confidence', suggestion: "Add FAQ: Student Pricing" },
    { id: 3, q: "Do you support integration with Slack?", count: 5, status: 'wrong_answer', suggestion: "Review Integrations guide" },
  ]);

  const handleResolve = (id: number) => {
    setTrainingLogs(trainingLogs.filter(log => log.id !== id));
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Queries', value: '1,284', trend: '+12%', color: 'indigo' },
          { label: 'Avg Confidence', value: '89.2%', trend: '+2.1%', color: 'emerald' },
          { label: 'Est. Cost/Bot', value: '$42.10', trend: '+5%', color: 'slate' },
          { label: 'Success Rate', value: '94.5%', trend: '+1.2%', color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <div className="flex items-end gap-2 mt-2">
              <h4 className="text-2xl font-bold text-slate-900">{stat.value}</h4>
              <span className={`text-xs font-bold mb-1 ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-amber-500'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Daily Volume vs Cost ($)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="queries" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Suggested Knowledge Updates</h3>
          <div className="space-y-3">
            {trainingLogs.slice(0, 3).map((item) => (
              <div key={item.id} className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-indigo-700 uppercase">Recommended</p>
                  <p className="text-sm font-medium text-slate-800 mt-1">{item.suggestion}</p>
                </div>
                <button className="text-indigo-600 text-xs font-bold hover:underline">Apply</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800">Advanced Training Loop</h3>
            <p className="text-xs text-slate-500">Unanswered or problematic queries that need manual intervention.</p>
          </div>
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
            {trainingLogs.length} Actions Required
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {trainingLogs.map((item) => (
            <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    item.status === 'unanswered' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">Asked {item.count} times</span>
                </div>
                <p className="text-sm font-bold text-slate-800 leading-tight">"{item.q}"</p>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleResolve(item.id)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 whitespace-nowrap"
                >
                  Add Answer to KB
                </button>
                <button 
                  onClick={() => handleResolve(item.id)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 whitespace-nowrap"
                >
                  Mark as Wrong
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
