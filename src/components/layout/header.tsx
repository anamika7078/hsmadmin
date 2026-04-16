"use client";

import React, { useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Bell, Menu, Check, BellOff } from 'lucide-react';
import PostNoticeModal from '@/components/modals/post-notice-modal';
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_ICON: Record<string, string> = {
  notice:    '📢',
  complaint: '🛠️',
  billing:   '💰',
  visitor:   '🚪',
  general:   '🔔',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Header() {
  const { user } = useAuthStore();
  const [isPostNoticeOpen, setIsPostNoticeOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isOpen,
    toggleOpen,
    closePanel,
    markAllRead,
  } = useNotifications();

  // Close panel on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closePanel();
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen, closePanel]);

  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Mobile menu */}
        <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
          <Menu className="w-5 h-5" />
        </button>

        {/* Actions spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Post Notice button - Only for Committee */}
          {user?.role === 'committee' && (
            <button
              onClick={() => setIsPostNoticeOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-semibold rounded-full transition-colors shadow-sm shadow-orange-500/20"
            >
              <span className="text-lg leading-none">+</span> Post Notice
            </button>
          )}

          {/* ── Notification Bell ──────────────────────────────────────── */}
          <div className="relative" ref={panelRef}>
            <button
              id="notification-bell-btn"
              onClick={toggleOpen}
              className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className={cn('w-5 h-5', unreadCount > 0 ? 'text-primary' : 'text-slate-600')} />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      <span className="font-bold text-sm text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[10px] font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-blue-700 transition-colors"
                        title="Mark all as read"
                      >
                        <Check className="w-3 h-3" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 py-10 px-4 text-center">
                        <BellOff className="w-8 h-8 text-slate-200" />
                        <p className="text-slate-400 text-sm font-medium">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 20).map((n) => (
                        <div
                          key={n.id}
                          className={cn(
                            'flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50 cursor-default',
                            !n.is_read && 'bg-blue-50/40'
                          )}
                        >
                          {/* Icon */}
                          <div className="w-9 h-9 flex-shrink-0 bg-slate-100 rounded-xl flex items-center justify-center text-base">
                            {TYPE_ICON[n.type] ?? '🔔'}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-xs font-bold text-slate-900 leading-tight truncate', !n.is_read && 'text-primary')}>
                              {n.title}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">
                              {timeAgo(n.created_at)}
                            </p>
                          </div>

                          {/* Unread dot */}
                          {!n.is_read && (
                            <div className="w-2 h-2 mt-1.5 flex-shrink-0 bg-primary rounded-full" />
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/70">
                      <p className="text-center text-[11px] text-slate-400 font-medium">
                        Showing {Math.min(notifications.length, 20)} of {notifications.length} notifications
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-tight">{user?.name || 'Admin Account'}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role || 'Society Manager'}</p>
            </div>
          </div>
        </div>
      </div>

      <PostNoticeModal
        isOpen={isPostNoticeOpen}
        onClose={() => setIsPostNoticeOpen(false)}
      />
    </header>
  );
}

export default Header;
