import Link from "next/link";
import { CalendarDays, ShoppingBag, Sparkles } from "lucide-react";

export default function ConnectorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <header className="flex items-end justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Dashboard
            </p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Connectors
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Connect your tools so your agents can take actions (book meetings, sync events,
              and more) on behalf of leads and users.
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm font-black tracking-tight text-slate-900">
                    Appointment booking agent
                  </p>
                  <p className="text-xs font-semibold text-emerald-700">Available</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-bold uppercase">
                Scheduling
              </span>
            </div>

            <p className="mt-4 text-sm text-slate-600">
              Let your chatbot book meetings programmatically for potential leads and users
              seeking help by connecting a calendar provider and setting meeting rules.
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Planned setup
              </p>
              <ul className="mt-2 text-sm text-slate-700 space-y-1">
                <li>Google Calendar connect (OAuth)</li>
                <li>Calendly API key connect</li>
                <li>Meeting basics: duration, timezone, buffer, availability, questions</li>
                <li>Agent actions: check availability, create event, send confirmations</li>
              </ul>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold opacity-60 cursor-not-allowed"
                aria-disabled="true"
              >
                Configure (next)
              </button>
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold opacity-60 cursor-not-allowed"
                aria-disabled="true"
              >
                View docs
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm opacity-85">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm font-black tracking-tight text-slate-900">
                    Shopify salesman
                  </p>
                  <p className="text-xs font-semibold text-slate-500">Coming soon</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-bold uppercase">
                Commerce
              </span>
            </div>

            <p className="mt-4 text-sm text-slate-600">
              Connect Shopify so your agent can answer product questions, nudge conversions,
              and assist with orders.
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Planned capabilities
              </p>
              <ul className="mt-2 text-sm text-slate-700 space-y-1">
                <li>Product catalog search + recommendations</li>
                <li>Cart building and checkout handoff</li>
                <li>Order status + returns policy assistance</li>
              </ul>
            </div>

            <div className="mt-5">
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-sm font-bold cursor-not-allowed"
                aria-disabled="true"
              >
                Coming soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
