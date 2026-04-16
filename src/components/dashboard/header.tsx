"use client";

import React from "react";
import { Bell, Plus, User, Menu } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function Header() {
  const { user } = useAuthStore();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between">
      {/* Actions spacer */}
      <div className="flex-1" />

      {/* Mobile Menu Button */}
      <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl">
        <Menu className="w-6 h-6" />
      </button>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 lg:gap-4">
        {user?.role === "committee" && (
          <button className="hidden sm:flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-4 h-4" />
            <span>Post Notice</span>
          </button>
        )}

        <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block" />

        <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl relative group transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white ring-2 ring-orange-100" />
        </button>

        <button className="flex items-center gap-3 p-1.5 pr-3 hover:bg-slate-100 rounded-2xl transition-all group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <User className="w-5 h-5" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-none mb-1">Admin Account</p>
            <p className="text-[10px] text-slate-500 font-medium">Society Manager</p>
          </div>
        </button>
      </div>
    </header>
  );
}
