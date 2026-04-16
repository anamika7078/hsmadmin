"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Users,
  Building,
  Shield,
  UserCheck,
  FileText,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  Car,
} from 'lucide-react';

const menuGroups = [
  {
    title: "MAIN MENU",
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['committee', 'member', 'security'] },
      { name: 'Member Requests', href: '/members', icon: Users, roles: ['committee'], badge: 12 },
      { name: 'Notice Board', href: '/notices', icon: FileText, roles: ['committee', 'member', 'security'] },
      { name: 'Maintenance & Dues', href: '/billing', icon: CreditCard, roles: ['committee', 'member'] },
      { name: 'Complaints', href: '/complaints', icon: MessageSquare, roles: ['committee', 'member'] },
    ]
  },
  {
    title: "MANAGEMENT",
    items: [
      { name: 'Flats & Wings', href: '/society', icon: Building, roles: ['committee'] },
      { name: 'Security & Guards', href: '/guards', icon: Shield, roles: ['committee'] },
      { name: 'Visitor Log', href: '/visitors', icon: UserCheck, roles: ['committee', 'member', 'security'] },
      { name: 'Vehicle Log', href: '/vehicles', icon: Car, roles: ['committee', 'security'] },
      { name: 'Settings', href: '/settings', icon: Settings, roles: ['committee', 'member', 'security'] },
    ]
  }
];

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="w-72 bg-[#0B1121] border-r-0 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-tight">SocietyConnect</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-6 mt-2 overflow-y-auto custom-scrollbar pb-4">
        {menuGroups.map((group, idx) => {
          const visibleItems = group.items.filter(item => user && item.roles.includes(user.role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx}>
              <div className="px-2 py-2">
                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{group.title}</p>
              </div>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                        ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                        }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-semibold text-sm flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
