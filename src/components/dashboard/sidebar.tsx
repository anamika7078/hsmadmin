"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  UserPlus, 
  ClipboardList, 
  Receipt, 
  MessageSquare, 
  Building2, 
  ShieldCheck, 
  Users, 
  UserCircle, 
  Car, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    label: "MAIN MENU",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Member Requests", href: "/members", icon: UserPlus, badge: 12 },
      { title: "Notice Board", href: "/notices", icon: ClipboardList },
      { title: "Maintenance & Dues", href: "/billing", icon: Receipt },
      { title: "Complaints", href: "/complaints", icon: MessageSquare },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { title: "Flats & Wings", href: "/flats", icon: Building2 },
      { title: "Security & Guards", href: "/security", icon: ShieldCheck },
      { title: "Visitor Log", href: "/visitors", icon: Users },
      { title: "Staff Management", href: "/staff", icon: UserCircle },
      { title: "Vehicle Log", href: "/vehicles", icon: Car },
    ],
  },
  {
    label: "REPORTS",
    items: [
      { title: "Reports & Analytics", href: "/reports", icon: BarChart3 },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-[#0A0F1E] text-slate-300 transition-all duration-300 z-50 flex flex-col border-r border-slate-800/50",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          {!isCollapsed && <span className="text-xl font-bold text-white tracking-tight">SocietyConnect</span>}
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 bg-primary text-white p-1 rounded-full shadow-lg border-4 border-[#0A0F1E] hover:scale-110 transition-transform hidden lg:block"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" /> }
      </button>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 space-y-8 scrollbar-hide">
        {menuItems.map((section) => (
          <div key={section.label} className="space-y-2">
            {!isCollapsed && (
              <p className="px-4 text-[10px] font-bold text-slate-500 tracking-[0.2em] mb-4">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative group",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-slate-800/50 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "text-slate-400 group-hover:text-white")} />
                    {!isCollapsed && <span className="font-medium text-sm">{item.title}</span>}
                    {!isCollapsed && item.badge && (
                      <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-4 ring-[#0A0F1E]">
                        {item.badge}
                      </span>
                    )}
                    
                    {/* Tooltip for collapsed mode */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-white text-slate-900 text-xs font-semibold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-[60] whitespace-nowrap">
                        {item.title}
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rotate-45" />
                      </div>
                    )}
                    
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Account */}
      <div className="p-4 border-t border-slate-800/50 space-y-1">
        <Link 
          href="/settings"
          className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all"
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-medium text-sm">Settings</span>}
        </Link>
        <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-400/10 transition-all">
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
