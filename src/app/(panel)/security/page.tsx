"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Plus, UserCircle, Phone, Clock, MapPin, Trash2, Edit2, Loader2, X, AlertCircle } from "lucide-react";
import { securityApi, Guard, GuardStats } from "@/services/modules/security";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function SecurityPage() {
  const [guards, setGuards] = useState<Guard[]>([]);
  const [stats, setStats] = useState<GuardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuard, setEditingGuard] = useState<Guard | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    shift: "day" as "day" | "night",
    is_active: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [guardsRes, statsRes] = await Promise.all([
        securityApi.getAll(),
        securityApi.getStats()
      ]) as any[];

      if (guardsRes.success) setGuards(guardsRes.data.guards || []);
      if (statsRes.success) setStats(statsRes.data);
    } catch (error) {
      toast.error("Failed to fetch security data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (guard: Guard | null = null) => {
    if (guard) {
      setEditingGuard(guard);
      setFormData({
        name: guard.name,
        mobile: guard.mobile,
        email: guard.email || "",
        shift: guard.shift,
        is_active: guard.is_active,
      });
    } else {
      setEditingGuard(null);
      setFormData({
        name: "",
        mobile: "",
        email: "",
        shift: "day",
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGuard(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      let res: any;
      if (editingGuard) {
        res = await securityApi.update(editingGuard.id, formData);
      } else {
        res = await securityApi.create(formData);
      }

      if (res.success) {
        toast.success(editingGuard ? "Guard updated successfully" : "Guard added successfully");
        handleCloseModal();
        fetchData();
      } else {
        toast.error(res.message || "Something went wrong");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save guard");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to remove this guard?")) {
      try {
        const res: any = await securityApi.delete(id);
        if (res.success) {
          toast.success("Guard removed successfully");
          fetchData();
        }
      } catch (error) {
        toast.error("Failed to delete guard");
      }
    }
  };

  if (loading && guards.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Security & Guards</h1>
          <p className="text-slate-500 text-sm">Manage security personnel and shift schedules.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Guard</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Guards", value: stats?.total_guards || 0, icon: UserCircle, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "On Duty", value: stats?.active_guards || 0, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Day Shift", value: stats?.day_shift_guards || 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Night Shift", value: stats?.night_shift_guards || 0, icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-soft flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h4 className="text-xl font-bold text-slate-900">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {guards.map((guard) => (
          <div key={guard.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft relative overflow-hidden group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-6">
               <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <UserCircle className="w-10 h-10" />
               </div>
               <span className={cn(
                 "px-3 py-1 rounded-full text-[10px] font-bold border uppercase",
                 guard.is_active ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
               )}>
                 {guard.is_active ? "ON DUTY" : "OFF DUTY"}
               </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">{guard.name}</h3>
            <p className="text-xs font-medium text-primary mb-6 capitalize">{guard.shift} Shift Guard</p>

            <div className="space-y-3 pt-4 border-t border-slate-50">
               <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 capitalize">{guard.shift} Shift</span>
               </div>
               <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{guard.mobile}</span>
               </div>
               {guard.email && (
                 <div className="flex items-center gap-3 text-sm">
                   <AlertCircle className="w-4 h-4 text-slate-400" />
                   <span className="text-slate-600 truncate">{guard.email}</span>
                 </div>
               )}
            </div>

            <div className="mt-6 flex gap-2">
               <button 
                  onClick={() => handleOpenModal(guard)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
               >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Profile
               </button>
               <button 
                  onClick={() => handleDelete(guard.id)}
                  className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all" title="Delete Guard"
               >
                  <Trash2 className="w-5 h-5" />
               </button>
            </div>

            <ShieldCheck className="absolute -right-4 -top-4 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" />
          </div>
        ))}

        {guards.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <UserCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No security personnel found. Add your first guard above.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{editingGuard ? "Edit Guard" : "Add New Guard"}</h3>
                <p className="text-slate-500 text-xs mt-1">Fill in the professional details for the security personnel.</p>
              </div>
              <button onClick={handleCloseModal} className="p-2.5 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 font-bold">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter guard name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 font-bold">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 00000 00000"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 font-bold">Shift Type</label>
                    <select
                      value={formData.shift}
                      onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    >
                      <option value="day">Day Shift</option>
                      <option value="night">Night Shift</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 font-bold">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="guard@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                   <input 
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="w-5 h-5 rounded-lg border-none bg-white text-primary focus:ring-primary/20"
                   />
                   <label htmlFor="is_active" className="text-sm font-bold text-slate-700 cursor-pointer">Currently On Duty / Active</label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {editingGuard ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    editingGuard ? "Update Guard" : "Add Guard"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
