"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { notificationsApi, AppNotification } from '@/services/modules/notifications';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // ── Fetch notifications from REST API ──────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationsApi.getAll();
      if (res?.data) {
        setNotifications(res.data.notifications ?? []);
        setUnreadCount(res.data.unread_count ?? 0);
      }
    } catch {
      // silently fail — no toast on background poll
    }
  }, []);

  // ── Connect Socket.IO once on mount ────────────────────────────────────────
  useEffect(() => {
    fetchNotifications();

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Notification socket connected');
    });

    socket.on('new_notice', (notice: {
      id: number;
      title: string;
      notice_type: string;
      priority: string;
      created_by_name?: string;
    }) => {
      // Show toast to committee/admin viewing the dashboard
      toast.custom((t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white shadow-xl rounded-2xl p-4 border border-slate-100 flex gap-3`}
        >
          <div className="w-10 h-10 flex-shrink-0 bg-blue-50 rounded-xl flex items-center justify-center text-lg">
            🔔
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">New Notice Posted</p>
            <p className="text-xs text-slate-500 truncate">{notice.title}</p>
          </div>
        </div>
      ), { duration: 5000, position: 'bottom-right' });

      // Prepend a local notification item for immediate UI feedback
      const newItem: AppNotification = {
        id: Date.now(),
        user_id: 0,
        title: notice.title,
        message: `New ${notice.notice_type} notice posted by ${notice.created_by_name ?? 'Admin'}`,
        type: 'notice',
        reference_id: notice.id,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      setNotifications((prev) => [newItem, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Notification socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchNotifications]);

  // ── Mark all as read ───────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    try {
      await notificationsApi.markRead([]);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen((o) => !o);
  }, []);

  const closePanel = useCallback(() => setIsOpen(false), []);

  return { notifications, unreadCount, isOpen, toggleOpen, closePanel, markAllRead, fetchNotifications };
}
