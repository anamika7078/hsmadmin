"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  MessageSquare,
  Bell,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Building2,
  Clock,
  Plus,
  Send,
  Loader2, FileText, Settings, Car,
  TrendingUp, Sparkles, Eye, Activity,
  ChevronRight, UserCheck, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { reportsApi, DashboardStats } from "@/services/modules/reports";
import { noticesApi, Notice } from "@/services/modules/notices";
import { visitorsApi, Visitor } from "@/services/modules/visitors";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import GateDashboard from "@/components/dashboard/gate-dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isSecurity = user?.role === "security";
  const isCommittee = user?.role === "committee";
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentNotices, setRecentNotices] = useState<Notice[]>([]);
  const [liveVisitors, setLiveVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, noticesRes, visitorsRes] = await Promise.all([
        reportsApi.getDashboardStats(),
        isCommittee ? noticesApi.getAll({ limit: 3 }) : noticesApi.getMyNotices(),
        isCommittee ? visitorsApi.getActive() : (user?.role === 'member' ? visitorsApi.getMyVisitors() : Promise.resolve({ success: true, data: [] }))
      ]) as any[];

      if (statsRes.success) setStats(statsRes.data);
      if (noticesRes.success) {
        const notices = Array.isArray(noticesRes.data) ? noticesRes.data : (noticesRes.data?.notices || []);
        setRecentNotices(notices.slice(0, 3));
      }
      if (visitorsRes.success) setLiveVisitors(visitorsRes.data || []);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }

  const allActions = [
    { title: "Member Requests", icon: Users, gradient: "from-blue-500 to-cyan-400", link: "/members", roles: ['committee'] },
    { title: "Post Notice", icon: Bell, gradient: "from-amber-500 to-orange-400", link: "/notices", roles: ['committee'] },
    { title: "Notice Board", icon: FileText, gradient: "from-amber-500 to-orange-400", link: "/notices", roles: ['member', 'security'] },
    { title: "Vehicle Log", icon: Car, gradient: "from-violet-500 to-purple-400", link: "/vehicles", roles: ['committee', 'security'] },
    { title: "Visitor Log", icon: UserCheck, gradient: "from-indigo-500 to-blue-400", link: "/visitors", roles: ['committee', 'member', 'security'] },
    { title: "Billing & Dues", icon: CreditCard, gradient: "from-emerald-500 to-teal-400", link: "/billing", roles: ['committee', 'member'] },
    { title: "Society & Flats", icon: Building2, gradient: "from-sky-500 to-blue-400", link: "/society", roles: ['committee'] },
    { title: "Staff & Help", icon: Users, gradient: "from-pink-500 to-rose-400", link: "/staff", roles: ['committee', 'member'] },
    { title: "Reports", icon: TrendingUp, gradient: "from-slate-600 to-slate-500", link: "/reports", roles: ['committee'] },
    { title: "Log Complaint", icon: MessageSquare, gradient: "from-rose-500 to-red-400", link: "/complaints", roles: ['committee', 'member'] },
    { title: "Settings", icon: Settings, gradient: "from-gray-500 to-slate-400", link: "/settings", roles: ['committee', 'member', 'security'] }
  ];

  const quickActions = allActions.filter(action => action.roles.includes(user?.role || ""));

  if (isSecurity) {
    return <GateDashboard />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const pendingVisitors = liveVisitors.filter(v => v.status === 'pending');

  return (
    <div className="space-y-8 pb-10 relative">
      {/* Ambient Background Orbs */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-400/8 via-purple-400/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-400/8 via-teal-400/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 lg:p-10 shadow-2xl">
        {/* Glassmorphic Orbs */}
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-30%] left-[10%] w-72 h-72 bg-purple-500/15 rounded-full blur-[80px]" />
        <div className="absolute top-[20%] left-[40%] w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px]" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest">Live Dashboard</span>
              </div>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              {getGreeting()}, <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Admin'}</span>
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Real-time pulse of your housing society • {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          
          {/* Mini Stat Pills */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-5 py-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-3 hover:bg-white/15 transition-all cursor-default">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Members</p>
                <p className="text-lg font-black text-white leading-none">{stats?.members?.total_members || 0}</p>
              </div>
            </div>
            <div className="px-5 py-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-3 hover:bg-white/15 transition-all cursor-default">
              <div className="p-2 bg-emerald-500/20 rounded-xl">
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Today</p>
                <p className="text-lg font-black text-white leading-none">{liveVisitors.length}</p>
              </div>
            </div>
            {pendingVisitors.length > 0 && (
              <div className="px-5 py-3 bg-amber-500/10 backdrop-blur-xl rounded-2xl border border-amber-500/20 flex items-center gap-3 animate-pulse cursor-pointer hover:bg-amber-500/20 transition-all" onClick={() => router.push('/visitors')}>
                <div className="p-2 bg-amber-500/20 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Pending</p>
                  <p className="text-lg font-black text-white leading-none">{pendingVisitors.length}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Core Stat Cards + Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resident Stats - Glassmorphic */}
        <div className="relative group cursor-default overflow-hidden rounded-[2rem] p-7 bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(59,130,246,0.12)] transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl shadow-lg shadow-blue-500/20">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Residents</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 rounded-full">
                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-600">+8%</span>
              </div>
            </div>
            <h3 className="text-5xl font-black text-slate-900 tracking-tight">{stats?.members?.total_members || 0}</h3>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-slate-500">{stats?.members?.verified_members || 0} Verified</span>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs font-bold text-slate-500">{(stats?.members?.total_members || 0) - (stats?.members?.verified_members || 0)} Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Stats - Glassmorphic */}
        <div className="relative group cursor-default overflow-hidden rounded-[2rem] p-7 bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(16,185,129,0.12)] transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl shadow-lg shadow-emerald-500/20">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Maintenance</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 rounded-full">
                <ArrowDownRight className="w-3 h-3 text-rose-500" />
                <span className="text-[10px] font-black text-rose-600">2%</span>
              </div>
            </div>
            <h3 className="text-5xl font-black text-slate-900 tracking-tight">₹{(stats?.billing?.total_amount || 0).toLocaleString()}</h3>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-xs font-bold text-rose-500">₹{(stats?.billing?.outstanding_amount || 0).toLocaleString()} Due</span>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-xs font-bold text-slate-500">{stats?.billing?.unpaid_bills || 0} Unpaid</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visitor Stats - Glassmorphic */}
        <div className="relative group cursor-default overflow-hidden rounded-[2rem] p-7 bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(139,92,246,0.12)] transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-400 rounded-2xl shadow-lg shadow-violet-500/20">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Visitors</span>
              </div>
              <button onClick={() => router.push('/visitors')} className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider">View All</button>
            </div>
            <h3 className="text-5xl font-black text-slate-900 tracking-tight">{liveVisitors.length}</h3>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-500">{liveVisitors.filter(v => v.status === 'checked_in').length} Inside</span>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-xs font-bold text-slate-500">{liveVisitors.filter(v => v.status === 'approved').length} Approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid - Glassmorphic */}
      <div className="relative overflow-hidden rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-8">
        <div className="absolute top-[-20%] right-[-5%] w-64 h-64 bg-gradient-to-bl from-purple-400/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[10%] w-48 h-48 bg-gradient-to-tr from-blue-400/8 to-transparent rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Quick Actions</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{quickActions.length} modules</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => router.push(action.link)}
                className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-100/80 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={cn(
                  "p-3 rounded-xl bg-gradient-to-br shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300",
                  action.gradient
                )}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors text-center leading-tight">{action.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row - Notices + Visitors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitor Approvals - For Members */}
        {user?.role === 'member' && (
          <div className="relative overflow-hidden rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-400/8 to-transparent rounded-full blur-2xl" />
             <div className="relative z-10 p-7 border-b border-slate-100/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-400 rounded-xl shadow-lg shadow-amber-500/20">
                      <AlertTriangle className="w-4 h-4 text-white" />
                   </div>
                   <h3 className="font-bold text-slate-900">Pending Approvals</h3>
                </div>
                {pendingVisitors.length > 0 && (
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse border border-amber-100">
                    {pendingVisitors.length} Waiting
                  </span>
                )}
             </div>
             <div className="relative z-10 p-5 space-y-3">
                {pendingVisitors.length > 0 ? pendingVisitors.map((v) => (
                  <div key={v.id} className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-between border border-slate-100/50 hover:shadow-md transition-all">
                     <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center font-black text-sm text-slate-500 shadow-inner">
                           {v.name.charAt(0)}
                        </div>
                        <div>
                           <p className="font-bold text-slate-900 text-sm">{v.name}</p>
                           <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{v.visitor_type || 'GUEST'} • {v.purpose}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <button 
                          onClick={async () => {
                            const res: any = await visitorsApi.respond(v.id, 'rejected');
                            if (res.success) { toast.success("Rejected"); fetchData(); }
                          }}
                          className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-[10px] font-black border border-rose-100 transition-all"
                        >Reject</button>
                        <button 
                          onClick={async () => {
                            const res: any = await visitorsApi.respond(v.id, 'approved');
                            if (res.success) { toast.success("Approved!"); fetchData(); }
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 rounded-xl text-[10px] font-black shadow-lg shadow-blue-500/20 transition-all"
                        >Approve</button>
                     </div>
                  </div>
                )) : (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                      <ShieldCheck className="w-7 h-7 text-emerald-400" />
                    </div>
                    <p className="text-slate-400 text-sm font-bold">All clear! No pending requests.</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* Recent Notices - Glassmorphic */}
        <div className={cn(
          "relative overflow-hidden rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]",
          user?.role !== 'member' && "lg:col-span-1"
        )}>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-amber-400/8 to-transparent rounded-full blur-2xl" />
          <div className="relative z-10 p-7 border-b border-slate-100/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-400 rounded-xl shadow-lg shadow-amber-500/20">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-slate-900">Recent Notices</h3>
            </div>
            <button onClick={() => router.push('/notices')} className="flex items-center gap-1 text-[10px] font-black text-primary hover:underline uppercase tracking-wider">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="relative z-10 p-5 space-y-3">
            {recentNotices.length > 0 ? recentNotices.map((notice) => (
              <div key={notice.id} onClick={() => router.push('/notices')} className="cursor-pointer p-4 bg-white/80 backdrop-blur-sm rounded-2xl hover:shadow-md transition-all group flex items-start gap-4 border border-slate-100/50">
                <div className="bg-gradient-to-br from-slate-50 to-white p-3 rounded-xl shadow-inner text-center min-w-[56px]">
                  <p className="text-[9px] font-black text-slate-400 uppercase">
                    {new Date(notice.created_at).toLocaleDateString([], { month: 'short' })}
                  </p>
                  <p className="text-xl font-black text-slate-900 leading-none mt-0.5">
                    {new Date(notice.created_at).getDate()}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase",
                      notice.priority === 'urgent' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600")}>
                      {notice.priority}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors truncate text-sm">{notice.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 font-medium">{notice.content}</p>
                </div>
                <div className="p-2 opacity-0 group-hover:opacity-100 transition-all text-primary">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            )) : (
              <div className="py-12 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
                  <Bell className="w-7 h-7 text-amber-300" />
                </div>
                <p className="text-slate-400 text-sm font-bold">No recent notices posted.</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Visitor Log - Glassmorphic */}
        <div className="relative overflow-hidden rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-emerald-400/8 to-transparent rounded-full blur-2xl" />
          <div className="relative z-10 p-7 border-b border-slate-100/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-slate-900">Live Visitor Log</h3>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-600 uppercase">Live</span>
              </div>
            </div>
            <button onClick={() => router.push('/visitors')} className="flex items-center gap-1 text-[10px] font-black text-primary hover:underline uppercase tracking-wider">
              Full Log <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="relative z-10 p-0 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-7 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Visitor</th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Flat</th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Time</th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {liveVisitors.length > 0 ? liveVisitors.slice(0, 5).map((v) => (
                  <tr key={v.id} onClick={() => router.push('/visitors')} className="cursor-pointer group hover:bg-blue-50/30 transition-all duration-300">
                    <td className="px-7 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center font-black text-[11px] text-slate-500 group-hover:from-primary/10 group-hover:to-blue-50 group-hover:text-primary transition-all shadow-inner">
                          {v.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{v.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">{v.purpose}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">{v.flat_number || '-'}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400">
                        <Clock className="w-3 h-3" />
                        {v.actual_arrival ? new Date(v.actual_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase",
                        v.status === 'checked_in' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                        v.status === 'pending' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                        "bg-blue-50 text-blue-600 border border-blue-100")}>
                        {v.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                        <ShieldCheck className="w-7 h-7 text-slate-200" />
                      </div>
                      <p className="text-slate-400 text-sm font-bold">No active visitors inside.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
