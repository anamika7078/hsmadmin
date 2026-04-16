"use client";

import React, { useState } from 'react';
import { X, Megaphone, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { noticesApi } from '@/services/modules/notices';
import { toast } from 'react-hot-toast';

interface PostNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostNoticeModal({ isOpen, onClose }: PostNoticeModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [sendTo, setSendTo] = useState('all');
  const [message, setMessage] = useState('');

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => noticesApi.create({
      title,
      content: message,
      notice_type: category,
      target_audience: sendTo,
      priority: 'normal'
    }),
    onSuccess: () => {
      toast.success('Notice posted successfully');
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      onClose();
      // Reset form
      setTitle('');
      setCategory('general');
      setSendTo('all');
      setMessage('');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'Failed to post notice');
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error('Title and message are required');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#f97316] p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            <h2 className="font-bold text-lg">Post New Notice</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <form id="post-notice-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                Notice Title <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Water Supply Cut on Friday"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="general">General</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="event">Event</option>
                  <option value="emergency">Emergency</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Send To</label>
                <select 
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="all">All Members</option>
                  <option value="committee">Committee</option>
                  <option value="security">Security</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type notice details here... (Members will see this on their app)"
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm resize-none"
              ></textarea>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="post-notice-form"
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-orange-500/30"
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Megaphone className="w-4 h-4" />
            )}
            Post & Notify All
          </button>
        </div>
      </div>
    </div>
  );
}
