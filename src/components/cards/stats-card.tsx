"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  badge?: {
    text: string;
    variant: "new" | "pending" | "open" | "live";
  };
}

const badgeVariants = {
  new: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  open: "bg-blue-100 text-blue-700 border-blue-200",
  live: "bg-red-100 text-red-700 border-red-200 animate-pulse",
};

export default function StatsCard({ title, value, icon: Icon, color, badge }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl transition-colors shrink-0", color)}>
          <Icon className="w-6 h-6" />
        </div>
        {badge && (
          <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border", badgeVariants[badge.variant])}>
            {badge.text.toUpperCase()}
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors">{value}</h3>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute right-0 bottom-0 overflow-hidden rounded-3xl -z-10 opacity-0 group-hover:opacity-10 scale-0 group-hover:scale-110 transition-all duration-500">
         <Icon className="w-24 h-24 -mr-4 -mb-4 grayscale" />
      </div>
    </div>
  );
}
