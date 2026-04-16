"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Users, Truck, ShieldAlert, 
  Clock, CheckCircle2, XCircle, 
  ArrowRight, Loader2, Footprints,
  Car
} from "lucide-react";
import { cn } from "@/lib/utils";
import { securityApi } from "@/services/modules/security";
import { visitorsApi } from "@/services/modules/visitors";
import { toast } from "react-hot-toast";
import AddVisitorModal from "@/components/modals/add-visitor-modal";
import { useRouter } from "next/navigation";

export default function GateDashboard() {
  const router = useRouter();
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ inside: 0, today: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [visitorModal, setVisitorModal] = useState<{ open: boolean; type: "guest" | "delivery" | "maid" | "other" }>({
    open: false,
    type: "guest"
  });

  const fetchRecentActivity = async () => {
    try {
      const res: any = await visitorsApi.getActive();
      if (res.success) {
        setRecentActivity(res.data.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to fetch activity");
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res: any = await securityApi.getDuty();
        if (res.success && res.isOnDuty) {
          setIsOnDuty(true);
        }
        fetchRecentActivity();
      } catch (error) {
        console.error("Failed to fetch duty status");
      } finally {
        setLoading(false);
      }
    };
    init();

    // Auto refresh every 30 seconds
    const interval = setInterval(fetchRecentActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDutyToggle = async () => {
    try {
      setLoading(true);
      if (isOnDuty) {
        await securityApi.checkOut({ notes: "Shift ended" });
        setIsOnDuty(false);
        toast.success("Duty marked OFF");
      } else {
        await securityApi.checkIn({ notes: "Shift started" });
        setIsOnDuty(true);
        toast.success("Duty marked ON");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update duty status");
    } finally {
      setLoading(false);
    }
  };

  const handleEmergency = async () => {
    if (!window.confirm("ARE YOU SURE? This will notify all residents!")) return;
    
    try {
      await securityApi.triggerEmergency({ message: "IMMEDIATE ATTENTION REQUIRED AT MAIN GATE" });
      toast.success("Alert broadcasted successfully", { 
        duration: 5000,
        style: { background: '#ef4444', color: '#fff' }
      });
    } catch (error) {
      toast.error("Failed to trigger alert");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Duty Status Card */}
      <div className={cn(
        "p-6 rounded-[2.5rem] border transition-all duration-500 flex items-center justify-between",
        isOnDuty 
          ? "bg-emerald-500 text-white border-emerald-400 shadow-xl shadow-emerald-500/20" 
          : "bg-white text-slate-900 border-slate-100 shadow-soft"
      )}>
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-2xl",
            isOnDuty ? "bg-white/20" : "bg-slate-100"
          )}>
            <ShieldAlert className={cn("w-6 h-6", isOnDuty ? "text-white" : "text-slate-400")} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{isOnDuty ? "YOU ARE ON DUTY" : "DUTY IS OFF"}</h2>
            <p className={cn("text-xs font-medium", isOnDuty ? "text-white/80" : "text-slate-500")}>
              {isOnDuty ? "All gate activities are being logged" : "Please mark duty ON to start logging"}
            </p>
          </div>
        </div>
        <button 
          onClick={handleDutyToggle}
          disabled={loading}
          className={cn(
            "px-8 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg",
            isOnDuty 
              ? "bg-white text-emerald-600 hover:bg-emerald-50" 
              : "bg-primary text-white hover:bg-blue-600"
          )}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isOnDuty ? "Mark OFF" : "Mark ON")}
        </button>
      </div>

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-soft">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 pl-2">Quick Log</h3>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { title: "GUEST", icon: Users, color: "bg-blue-50 text-blue-600", type: "guest" as const },
                { title: "DELIVERY", icon: Truck, color: "bg-amber-50 text-amber-600", type: "delivery" as const },
                { title: "STAFF/MAID", icon: Footprints, color: "bg-emerald-50 text-emerald-600", type: "maid" as const },
                { title: "VEHICLE", icon: Car, color: "bg-purple-50 text-purple-600", type: "other" as const }
              ].map((act, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    if (act.type === 'other') {
                      router.push('/vehicles');
                    } else {
                      setVisitorModal({ open: true, type: act.type });
                    }
                  }}
                  className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-[2rem] hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100 group"
                >
                  <div className={cn("p-4 rounded-3xl group-hover:scale-110 transition-transform", act.color)}>
                    <act.icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-black tracking-wider uppercase text-slate-700">{act.title}</span>
                </button>
              ))}
           </div>
        </div>

        {/* Emergency Alert - Massive Button */}
        <button 
          onClick={handleEmergency}
          className="col-span-2 group relative overflow-hidden bg-rose-500 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-rose-500/30 hover:bg-rose-600 transition-all active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
             <ShieldAlert className="w-32 h-32" />
          </div>
          <div className="relative z-10 text-center flex flex-col items-center gap-2">
             <div className="p-3 bg-white/20 rounded-full animate-pulse border-4 border-white/20">
                <ShieldAlert className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-black uppercase tracking-tighter">EMERGENCY ALERT</h2>
             <p className="text-xs font-bold text-rose-100 uppercase tracking-widest">TAP IN CASE OF SECURITY BREECH / EMERGENCY</p>
          </div>
        </button>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Recent Gate Activity</h3>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">LIVE ACTIVITY</span>
        </div>
        <div className="divide-y divide-slate-50">
            {recentActivity.length > 0 ? recentActivity.map((act, i) => (
              <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-all cursor-default group">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                       <Clock className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                    </div>
                    <div>
                       <p className="font-bold text-slate-900 text-sm tracking-tight">{act.name}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{act.purpose || 'Visitor Entry'}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      act.status === 'checked_in' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {act.status.replace('_', ' ')}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-300 transition-transform group-hover:translate-x-1" />
                 </div>
              </div>
            )) : (
              <div className="p-10 text-center text-slate-400 text-sm italic font-medium">No recent movements logged.</div>
            )}
        </div>
        <button 
          onClick={() => router.push('/visitors')}
          className="w-full py-4 text-xs font-black uppercase tracking-widest text-primary hover:bg-slate-50 transition-colors border-t border-slate-50"
        >
          View Full Activity Log
        </button>
      </div>

      <AddVisitorModal 
        isOpen={visitorModal.open}
        type={visitorModal.type}
        onClose={() => setVisitorModal({ ...visitorModal, open: false })}
      />
    </div>
  );
}
