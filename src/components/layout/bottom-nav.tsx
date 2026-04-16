"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  UserCheck,
  Bell,
  MessageSquare,
  CreditCard,
} from 'lucide-react';

const bottomNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['committee', 'member', 'security'] },
  { name: 'Visitors', href: '/visitors', icon: UserCheck, roles: ['committee', 'member', 'security'] },
  { name: 'Billing', href: '/billing', icon: CreditCard, roles: ['committee', 'member'] },
  { name: 'Notices', href: '/notices', icon: Bell, roles: ['committee', 'member', 'security'] },
  { name: 'Complaints', href: '/complaints', icon: MessageSquare, roles: ['committee', 'member'] },
];

function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="flex items-center justify-around py-2">
        {bottomNavigation
          .filter(item => user && item.roles.includes(user.role))
          .map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive
                  ? 'text-primary'
                  : 'text-slate-600'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
      </div>
    </div>
  );
}

export default BottomNav;
