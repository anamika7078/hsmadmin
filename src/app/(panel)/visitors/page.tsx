"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, Search, Filter, 
  ArrowUpRight, ArrowDownLeft, 
  Clock, Edit2, Trash2, 
  Loader2, X, AlertCircle,
  Check, XCircle, Plus, Truck, Footprints
} from "lucide-react";
import { visitorsApi, Visitor, VisitorStats } from "@/services/modules/visitors";
import { societyApi, Wing, Flat } from "@/services/modules/society";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

export default function VisitorLogPage() {
  const { user } = useAuthStore();
  const isCommittee = user?.role === "committee";
  const isSecurity = user?.role === "security";
  const isMember = user?.role === "member";

  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [wings, setWings] = useState<Wing[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [selectedWing, setSelectedWing] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    visitor_type: "guest" as 'guest' | 'delivery' | 'maid' | 'service' | 'other',
    purpose: "",
    vehicle_number: "",
    visiting_flat_id: "",
    visiting_member_id: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [visitorRes, statsRes] = await Promise.all([
        isMember ? visitorsApi.getMyVisitors() : visitorsApi.getAll({ status: filter === "all" ? undefined : filter }),
        (isCommittee || isSecurity) ? visitorsApi.getStats() : Promise.resolve({ success: true, data: null })
      ]) as any[];

      if (visitorRes.success) setVisitors(visitorRes.data || []);
      if (statsRes.success) setStats(statsRes.data);
    } catch (error) {
      toast.error("Failed to fetch visitor logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  useEffect(() => {
    if (showAddModal) {
      societyApi.getWings().then((res: any) => {
        if (res.success) setWings(res.data);
      });
    }
  }, [showAddModal]);

  useEffect(() => {
    if (selectedWing) {
      societyApi.getFlats({ wing_id: selectedWing }).then((res: any) => {
        if (res.success) setFlats(res.data);
      });
    } else {
      setFlats([]);
    }
  }, [selectedWing]);

  const handleResponse = async (id: number, status: 'approved' | 'rejected') => {
    try {
      const res: any = await visitorsApi.respond(id, status);
      if (res.success) {
        toast.success(`Visitor ${status} successfully`);
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to update visitor status");
    }
  };

  const handleCheckOut = async (id: number) => {
    try {
      const res: any = await visitorsApi.checkOut(id);
      if (res.success) {
        toast.success("Visitor checked out successfully");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to check out visitor");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this visitor record?")) return;
    try {
      const res: any = await visitorsApi.delete(id);
      if (res.success) {
        toast.success("Visitor record deleted");
        fetchData();
      }
    } catch (error) {
       toast.error("Failed to delete record");
    }
  };

  const handleEdit = (visitor: Visitor) => {
    setFormData({
      name: visitor.name,
      mobile: visitor.mobile,
      visitor_type: visitor.visitor_type || "guest",
      purpose: visitor.purpose || "",
      vehicle_number: visitor.vehicle_number || "",
      visiting_flat_id: (visitor as any).visiting_flat_id?.toString() || "",
      visiting_member_id: (visitor as any).visiting_member_id?.toString() || ""
    });
    setEditingId(visitor.id);
    setShowAddModal(true);
  };

  const handleAddVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.visiting_flat_id || !formData.visiting_member_id) {
      toast.error("Please select a flat and member");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        name: formData.name,
        mobile: formData.mobile,
        visitor_type: formData.visitor_type,
        purpose: formData.purpose || formData.visitor_type,
        vehicle_number: formData.vehicle_number,
        visiting_flat_id: parseInt(formData.visiting_flat_id),
        ...((isSecurity || isCommittee) ? { visiting_member_id: parseInt(formData.visiting_member_id) } : {})
      };

      const res: any = editingId 
        ? await visitorsApi.update(editingId, data)
        : await visitorsApi.createRequest(data as any);

      if (res.success) {
        toast.success(editingId ? "Visitor record updated" : "Visitor entry created. Waiting for member approval.");
        setShowAddModal(false);
        setEditingId(null);
        setFormData({ name: "", mobile: "", visitor_type: "guest", purpose: "", vehicle_number: "", visiting_flat_id: "", visiting_member_id: "" });
        fetchData();
      }
    } catch (error) {
       toast.error(editingId ? "Failed to update record" : "Failed to create visitor entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVisitors = visitors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.mobile.includes(searchQuery) ||
    v.flat_number?.includes(searchQuery)
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'checked_in': return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case 'checked_out': return "bg-slate-100 text-slate-500 border-slate-200";
      case 'approved': return "bg-blue-100 text-blue-700 border-blue-200";
      case 'rejected': return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  if (loading && visitors.length === 0) {
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
          <h1 className="text-2xl font-bold text-slate-900">Visitor Log</h1>
          <p className="text-slate-500 text-sm">
            {isMember ? "Manage approval requests and history." : "Real-time tracking of society entries."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(isSecurity || isCommittee) && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" />
              <span>Add Visitor</span>
            </button>
          )}
          {!isMember && (
            <div className="bg-white p-1 rounded-2xl border border-slate-200 flex shadow-sm">
               <button 
                onClick={() => setFilter("all")}
                className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", filter === "all" ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-slate-50 text-slate-600")}
               >All</button>
               <button 
                onClick={() => setFilter("checked_in")}
                className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", filter === "checked_in" ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-slate-50 text-slate-600")}
               >Inside</button>
               <button 
                onClick={() => setFilter("pending")}
                className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", filter === "pending" ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-slate-50 text-slate-600")}
               >Pending</button>
            </div>
          )}
        </div>
      </div>

      {!isMember && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Entries", value: stats?.total_visitors || 0, icon: ArrowDownLeft, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Currently Inside", value: stats?.checked_in_visitors || 0, icon: Users, color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Approved Today", value: stats?.approved_visitors || 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
            { label: "Pending Requests", value: stats?.pending_visitors || 0, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" }
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-soft">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 font-bold", stat.bg, stat.color)}>
                 <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <h4 className="text-2xl font-bold text-slate-900">{stat.value}</h4>
            </div>
          ))}
        </div>
      )}

      {/* Visitor Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
           <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search visitors..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 text-left">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-8">Visitor Detail</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Purpose</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">To Meet</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVisitors.length > 0 ? (
                filteredVisitors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 pl-8">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase", v.status === 'checked_in' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500')}>
                          {v.name.charAt(0)}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-900">{v.name}</p>
                           <p className="text-[10px] text-slate-500 font-medium">{v.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-600 capitalize">{v.purpose || "General Visit"}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">{v.wing_name}-{v.flat_number}</span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{v.member_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1 text-[11px] font-medium text-slate-500">
                        <div className="flex items-center gap-1.5"><ArrowDownLeft className="w-3 h-3 text-emerald-500"/> {v.actual_arrival ? new Date(v.actual_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Pending"}</div>
                        {v.actual_departure && <div className="flex items-center gap-1.5"><ArrowUpRight className="w-3 h-3 text-rose-500"/> {new Date(v.actual_departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold border uppercase", getStatusStyle(v.status))}>
                        {v.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        {v.status === 'pending' && isMember && (
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleResponse(v.id, 'approved')}
                              className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleResponse(v.id, 'rejected')}
                              className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-all"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {v.status === 'checked_in' && (isSecurity || isCommittee) && (
                          <button 
                            onClick={() => handleCheckOut(v.id)}
                            className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border border-rose-100"
                          >
                            Check Out
                          </button>
                        )}
                         {v.status === 'approved' && (isSecurity || isCommittee) && (
                          <button 
                            onClick={async () => {
                              try {
                                await visitorsApi.checkIn(v.id);
                                toast.success("Visitor checked in");
                                fetchData();
                              } catch(e) { toast.error("Check-in failed"); }
                            }}
                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border border-emerald-100"
                          >
                            Check In
                          </button>
                        )}
                        {(isSecurity || isCommittee) && (
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleEdit(v)}
                              className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            >
                               <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(v.id)}
                              className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-10 h-10 text-slate-100" />
                        <p className="text-slate-400 text-sm font-medium italic">No visitor logs found</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Visitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-8">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{editingId ? 'Edit Visitor' : 'Add Visitor'}</h3>
                      <p className="text-slate-500 text-sm font-medium">{editingId ? 'Update details for this entry' : 'Register a visitor at the gate'}</p>
                    </div>
                    <button 
                      onClick={() => { 
                        setShowAddModal(false); 
                        setEditingId(null); 
                        setFormData({ name: "", mobile: "", visitor_type: "guest", purpose: "", vehicle_number: "", visiting_flat_id: "", visiting_member_id: "" }); 
                        setSelectedWing(null);
                      }} 
                      className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
                    >
                       <X className="w-5 h-5" />
                    </button>
                 </div>

                 <form onSubmit={handleAddVisitor} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-slate-500 uppercase ml-1">Visitor Name</label>
                         <input 
                          type="text" required
                          className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold placeholder:text-slate-300"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-slate-500 uppercase ml-1">Mobile No.</label>
                         <input 
                          type="text" required
                          className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold placeholder:text-slate-300"
                          placeholder="Phone Number"
                          value={formData.mobile}
                          onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                         />
                      </div>
                    </div>

                    {/* Visitor Type Icons */}
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Visitor Type</label>
                       <div className="grid grid-cols-5 gap-2">
                          {[
                            { id: 'guest', icon: Users, label: 'Guest' },
                            { id: 'delivery', icon: Truck, label: 'Delivery' },
                            { id: 'maid', icon: Footprints, label: 'Staff' },
                            { id: 'service', icon: Edit2, label: 'Work' },
                            { id: 'other', icon: Plus, label: 'Other' }
                          ].map(t => {
                            const Icon = t.icon;
                            return (
                              <button 
                                key={t.id}
                                type="button"
                                onClick={() => setFormData({...formData, visitor_type: t.id as any})}
                                className={cn(
                                  "flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all",
                                  formData.visitor_type === t.id 
                                    ? "bg-primary/5 border-primary text-primary shadow-sm" 
                                    : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                                )}
                              >
                                <Icon className="w-5 h-5" />
                                <span className="text-[9px] font-black uppercase">{t.label}</span>
                              </button>
                            );
                          })}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-slate-500 uppercase ml-1">Details (Optional)</label>
                         <input 
                          type="text"
                          className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold placeholder:text-slate-300"
                          placeholder="e.g. Amazon, Zomato"
                          value={formData.purpose}
                          onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-slate-500 uppercase ml-1">Vehicle No.</label>
                         <input 
                          type="text" 
                          className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold placeholder:text-slate-300 uppercase"
                          placeholder="MH 01 AB 1234"
                          value={formData.vehicle_number}
                          onChange={(e) => setFormData({...formData, vehicle_number: e.target.value})}
                         />
                      </div>
                    </div>

                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-4">
                       <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-1">Destination Details</p>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 ml-1">Select Wing</label>
                            <select 
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                              value={selectedWing || ""}
                              onChange={(e) => setSelectedWing(Number(e.target.value))}
                            >
                               <option value="">Choose Wing</option>
                               {wings.map(w => <option key={w.id} value={w.id}>{w.name} Wing</option>)}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 ml-1">Select Flat</label>
                            <select 
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none disabled:opacity-50"
                              disabled={!selectedWing}
                              value={formData.visiting_flat_id}
                              onChange={(e) => {
                                const flatId = e.target.value;
                                const flat = flats.find(f => f.id === Number(flatId));
                                setFormData({...formData, visiting_flat_id: flatId, visiting_member_id: flat?.owner_id?.toString() || ""});
                              }}
                            >
                               <option value="">{selectedWing ? "Choose Flat" : "--"}</option>
                               {flats.map(f => (
                                 <option key={f.id} value={f.id}>
                                   Flat #{f.flat_number} {f.owner_name ? `(${f.owner_name})` : "(Unoccupied)"}
                                 </option>
                               ))}
                            </select>
                          </div>
                       </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                       <button 
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 px-4 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[2rem] font-bold transition-all"
                       >Cancel</button>
                       <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-3 px-10 py-4 bg-primary hover:bg-blue-600 text-white rounded-[2rem] font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-primary/20"
                       >
                         {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? "Update Record" : "Initiate Request")}
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
