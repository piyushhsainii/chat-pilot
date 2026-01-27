"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import PlugConnectedIcon from "./icons/plug-connectec-icon";
import { BotIcon } from "./icons/agent-icon";
import LayoutDashboardIcon from "./icons/layout-dashboard";
import BookIcon from "./icons/books";
import ChartLineIcon from "./icons/analytics-icon";
import RocketIcon from "./icons/launch";
import GearIcon from "./icons/settings-icon";
import BulbSvg from "./icons/bulb";
import { LayoutDashboard } from "lucide-react";

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("");
  const [mounted, setMounted] = useState(false);
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

  // Prevent hydration mismatch - render placeholder during SSR
  if (!mounted) {
    return (
      <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col sticky top-0 z-40">

        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/logo2.png"
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
      className={`${isCollapsed ? "w-20" : "w-64"} bg-white border-r border-slate-200 h-screen flex flex-col sticky top-0 z-40 transition-all duration-300 ease-in-out`}
    >
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        {!isCollapsed && (
          <Link href={'/'} >
            <div className="flex items-center gap-2">
              <img
                src="/logo2.png"
                alt=""
                className="max-h-12 w-full select-none"
              />
            </div>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-all ${isCollapsed ? "mx-auto" : ""}`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? "➡️" : "⬅️"}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item)}
            className={`w-full  flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${activeTab === item.id
              ? "bg-indigo-50 text-indigo-700 font-bold shadow-sm"
              : "text-slate-500 hover:bg-slate-50"
              }`}
          >
            <span className="text-xl shrink-0 ">{item.icon}</span>
            {!isCollapsed && (
              <span className="text-sm tracking-tighter truncate opacity-100 transition-opacity duration-300">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="p-4 border-t border-slate-100 animate-in fade-in duration-500">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-tighter">
              Current Plan
            </p>
            <p className="text-sm font-black text-indigo-600 tracking-tighter">
              Pro Monthly
            </p>
            <button className="text-[10px] text-indigo-500 mt-2 font-bold hover:underline tracking-tighter">
              Upgrade Plan →
            </button>
          </div>
        </div>
      )}
      {isCollapsed && (
        <div className="p-4 border-t border-slate-100 text-center">
          <span className="text-xl">⭐</span>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
