import Link from "next/link";
import { Sparkles } from "lucide-react";

import GoogleCalendarConnectorCard from "./google-calendar-connector-card";
import CalendlyConnectorCard from "./calendly-connector-card";

export default function ConnectorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <header className="flex items-end justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Dashboard
            </p>
            <h1 className="text-2xl font-normal  tracking-tight text-slate-900">Connectors</h1>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Connect scheduling tools so ChatPilot can book meetings on your behalf.
            </p>
          </div>

          <Link
            href="/dashboard/agents"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:border-slate-300 hover:shadow-sm transition"
          >
            <Sparkles className="h-4 w-4" />
            Manage agents
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GoogleCalendarConnectorCard />
          <CalendlyConnectorCard />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-black tracking-tight text-slate-900">How booking works</p>
          <p className="mt-2 text-sm text-slate-600">
            Pick one: connect Google Calendar (OAuth) or provide Calendly credentials. The booking
            agent will use the connected provider to check availability and schedule meetings.
          </p>
          <div className="mt-3 text-xs text-slate-600">
            <span className="font-bold">DB setup:</span> see `docs/supabase/scheduling-connectors.md`.
          </div>
        </div>
      </div>
    </div>
  );
}
