"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import PlugConnectedIcon from "./icons/plug-connectec-icon";
import { BotIcon } from "./icons/agent-icon";
import BookIcon from "./icons/books";
import ChartLineIcon from "./icons/analytics-icon";
import RocketIcon from "./icons/launch";
import GearIcon from "./icons/settings-icon";
import BulbSvg from "./icons/bulb";
import { ArrowLeft, ArrowRight, LayoutDashboard } from "lucide-react";
import { supabase } from "@/services/supabase";

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("");
  const [mounted, setMounted] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsError, setCreditsError] = useState<string | null>(null);
  const router = useRouter();

  const navItems = [
    { id: "overview", label: "Home", path: "/dashboard", icon: <LayoutDashboard /> },
    { id: "bots", label: "My Agents", path: "/dashboard/agents", icon: <BotIcon /> },
    {
      id: "knowledge",
      label: "Knowledge Base",
      path: "/dashboard/knowledge",
      icon: <BookIcon />,
    },
    {
      id: "analytics",
      label: "Analytics",
      path: "/dashboard/analytics",
      icon: <ChartLineIcon />,
    },
    { id: "deploy", label: "Deploy", path: "/dashboard/deploy", icon: <RocketIcon /> },
    { id: "connectors", label: "Connectors", path: "/dashboard/connectors", icon: <PlugConnectedIcon /> },
    {
      id: "guide",
      label: "User Guide",
      path: "/dashboard/guide",
      icon: <BulbSvg />,
    },
    {
      id: "settings",
      label: "Settings",
      path: "/dashboard/settings",
      icon: <GearIcon />,
    },
  ];

  // Initialize state from localStorage after mount
  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem("isSidebarCollapsed");
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    }

    // Set active tab based on current path
    const currentPath = window.location.pathname;
    const activeItem = navItems.find((item) => item.path === currentPath);
    if (activeItem) {
      setActiveTab(activeItem.id);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/credits");
        if (!res.ok) return;
        const json = await res.json();
        const balance = json?.credits?.balance;
        if (!cancelled && typeof balance === "number") setCredits(balance);
      } catch (e: any) {
        if (!cancelled) setCreditsError(e?.message ?? "Failed to load credits");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Toggle sidebar and save to localStorage
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("isSidebarCollapsed", String(newState));
  };

  // Handle navigation
  const handleNavigation = (item: (typeof navItems)[0]) => {
    setActiveTab(item.id);
    router.push(item.path);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  // Prevent hydration mismatch - render placeholder during SSR
  if (!mounted) {
    return (
      <div className="w-64 relative overflow-hidden border-r border-slate-200/70 h-screen flex flex-col sticky top-0 z-40 bg-gradient-to-b from-white via-slate-50 to-indigo-50/60">
        <div className="pointer-events-none absolute inset-0 opacity-80 [background:radial-gradient(600px_circle_at_20%_0%,rgba(99,102,241,0.22),transparent_60%),radial-gradient(500px_circle_at_20%_90%,rgba(14,165,233,0.14),transparent_65%)]" />

        <div className="relative p-5 border-b border-white/60 bg-white/55 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/chat-pilot-logo.png"
              alt=""
              className="max-h-12 w-full select-none"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${isCollapsed ? "w-20" : "w-64"} relative overflow-hidden border-r border-slate-200/70 h-screen flex flex-col sticky top-0 z-40 transition-all duration-300 ease-in-out bg-gradient-to-b from-white via-slate-50 to-indigo-50/60`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-80 [background:radial-gradient(600px_circle_at_20%_0%,rgba(99,102,241,0.22),transparent_60%),radial-gradient(500px_circle_at_20%_90%,rgba(14,165,233,0.14),transparent_65%)]" />

      <div className="relative p-5 border-b border-white/60 bg-white/55 backdrop-blur-sm flex items-center justify-between">
        {!isCollapsed && (
          <Link href={'/'} >
            <div className="flex items-center gap-2">
              <img
                src="/chat-pilot-logo.png"
                alt=""
                className="max-h-12 w-full select-none"
              />
            </div>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-xl ring-1 ring-slate-200/60 bg-white/60 hover:bg-white/80 text-slate-500 hover:text-slate-900 transition-all ${isCollapsed ? "mx-auto" : ""}`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ArrowRight /> : <ArrowLeft />}
        </button>
      </div>

      <nav className="relative flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`w-full flex items-center gap-3 rounded-2xl transition-all group ${isCollapsed ? "justify-center px-2 py-2" : "px-3 py-2"} ${isActive
                ? "bg-white/70 text-slate-900 shadow-sm ring-1 ring-indigo-500/10"
                : "text-slate-600 hover:bg-white/55 hover:text-slate-900"
                }`}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl transition-all ring-1 [&_svg]:h-5 [&_svg]:w-5 ${isActive
                  ? "bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-sm ring-indigo-500/20"
                  : "bg-white/60 text-slate-500 ring-slate-200/60 group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:ring-indigo-200/70"
                  }`}
              >
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="text-sm font-semibold tracking-tight truncate opacity-100 transition-opacity duration-300">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="relative p-4 border-t border-white/60 bg-white/45 backdrop-blur-sm animate-in fade-in duration-500">
          <div
            className={`p-3 rounded-2xl border ${credits !== null && credits <= 20
                ? "bg-amber-50 border-amber-200"
                : "bg-gradient-to-br from-white/70 to-indigo-50/70 border-white/60 ring-1 ring-indigo-500/10"
              }`}
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-tighter">
              Credits
            </p>
            <p
              className={`text-sm font-black tracking-tighter ${credits !== null && credits <= 20 ? "text-amber-700" : "text-indigo-600"
                }`}
            >
              {creditsError ? "-" : credits === null ? "…" : credits}
            </p>
            <p className="text-[10px] text-slate-500 mt-2 font-semibold tracking-tighter">
              1 bot reply = 1 credit
            </p>
            {credits !== null && credits <= 20 && (
              <p className="text-[10px] mt-2 font-bold tracking-tighter text-amber-700">
                {credits <= 5 ? "Very low balance" : "Low balance"}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white"
          >
            Logout
          </button>
        </div>
      )}
      {isCollapsed && (
        <div className="relative p-4 border-t border-white/60 bg-white/45 backdrop-blur-sm text-center">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/70 text-slate-700 hover:bg-white"
            title="Logout"
          >
            ⎋
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
