"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Receipt, 
  MessageSquare, 
  Users 
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileItems = [
  { title: "Home", href: "/dashboard", icon: LayoutDashboard },
  { title: "Notices", href: "/notices", icon: ClipboardList },
  { title: "Billing", href: "/billing", icon: Receipt },
  { title: "Complaints", href: "/complaints", icon: MessageSquare },
  { title: "Visitors", href: "/visitors", icon: Users },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex items-center justify-around z-50 lg:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {mobileItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
              isActive ? "text-primary" : "text-slate-400"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.title}</span>
            {isActive && <div className="w-1 h-1 bg-primary rounded-full" />}
          </Link>
        );
      })}
    </nav>
  );
}
