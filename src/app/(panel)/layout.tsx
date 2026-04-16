"use client";

import React from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 flex">
        <div className="hidden lg:block fixed inset-y-0 left-0 w-72 h-screen z-40 bg-[#0B1121]">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-h-screen lg:ml-72 transition-all duration-300">
          <Header />
          <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
            {children}
          </main>
          <BottomNav />
        </div>
      </div>
    </ProtectedRoute>
  );
}

