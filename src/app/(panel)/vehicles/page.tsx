"use client";

import React, { useState, useEffect } from "react";
import { 
  Car, Search, Filter, Plus, ArrowDownLeft,
  Clock, MapPin, History, Info, Loader2, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { securityApi } from "@/services/modules/security";
import { societyApi, Wing, Flat } from "@/services/modules/society";
import { toast } from "react-hot-toast";

export default function VehicleLogPage() {
  const [activeTab, setActiveTab] = useState<"inside" | "exited" | "all">("inside");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [wings, setWings] = useState<Wing[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [selectedWing, setSelectedWing] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    vehicle_number: "",
    vehicle_type: "car",
    visiting_flat_id: ""
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res: any = await securityApi.getVehicleLogs({ status: activeTab === 'all' ? undefined : activeTab as any });
      if (res.success) setVehicles(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch vehicle logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [activeTab]);

  useEffect(() => {
    if (showAddModal) {
      societyApi.getWings().then((res: any) => { if (res.success) setWings(res.data); });
    }
  }, [showAddModal]);

  useEffect(() => {
    if (selectedWing) {
      societyApi.getFlats({ wing_id: selectedWing }).then((res: any) => { if (res.success) setFlats(res.data); });
    }
  }, [selectedWing]);

  const handleMarkExit = async (id: number) => {
    try {
      const res: any = await securityApi.logVehicleExit(id);
      if (res.success) {
        toast.success("Vehicle exit logged");
        fetchVehicles();
      }
    } catch (error) {
      toast.error("Failed to log exit");
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res: any = await securityApi.logVehicleEntry({
        ...formData,
        visiting_flat_id: formData.visiting_flat_id ? parseInt(formData.visiting_flat_id) : undefined
      });
      if (res.success) {
        toast.success("Vehicle entry logged");
        setShowAddModal(false);
        setFormData({ vehicle_number: "", vehicle_type: "car", visiting_flat_id: "" });
        fetchVehicles();
      }
    } catch (error) {
      toast.error("Failed to log entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.flat_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-2xl">
              <Car className="w-8 h-8 text-emerald-600" />
            </div>
            Vehicle Log
          </h1>
          <p className="text-slate-500 mt-1">Monitor all incoming and outgoing vehicle traffic in real-time.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
        >
          <Plus className="w-4.5 h-4.5" />
          Log New Entry
        </button>
      </div>

      <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-soft flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex p-1.5 bg-slate-100 rounded-[1.5rem] w-fit">
          <button 
            onClick={() => setActiveTab("inside")}
            className={cn("px-8 py-3 rounded-[1.2rem] text-sm font-bold transition-all", activeTab === "inside" ? "bg-white text-primary shadow-md" : "text-slate-500")}
          >Active Inside</button>
          <button 
            onClick={() => setActiveTab("exited")}
            className={cn("px-8 py-3 rounded-[1.2rem] text-sm font-bold transition-all", activeTab === "exited" ? "bg-white text-primary shadow-md" : "text-slate-500")}
          >Exited</button>
          <button 
            onClick={() => setActiveTab("all")}
            className={cn("px-8 py-3 rounded-[1.2rem] text-sm font-bold transition-all", activeTab === "all" ? "bg-white text-primary shadow-md" : "text-slate-500")}
          >All</button>
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search vehicle number..." 
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="text-left bg-slate-50/50">
                <th className="px-10 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-12">Vehicle Details</th>
                <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Visiting Flat</th>
                <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Entry Time</th>
                <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Exit Time</th>
                <th className="px-10 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right pr-12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {loading ? (
                 <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></td></tr>
               ) : filteredVehicles.map((v) => (
                 <tr key={v.id} className="group hover:bg-slate-50/30 transition-all">
                   <td className="px-10 py-7 pl-12">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <Car className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg uppercase">{v.vehicle_number}</p>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{v.vehicle_type}</span>
                        </div>
                      </div>
                   </td>
                   <td className="px-8 py-7 text-center">
                      <span className="bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
                        {v.flat_number ? `${v.wing_name}-${v.flat_number}` : "N/A"}
                      </span>
                   </td>
                   <td className="px-8 py-7 text-center text-sm font-bold text-slate-600">
                      {new Date(v.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </td>
                   <td className="px-8 py-7 text-center text-sm font-bold text-slate-400">
                      {v.exit_time ? new Date(v.exit_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "---"}
                   </td>
                   <td className="px-10 py-7 text-right pr-12">
                      {v.status === 'inside' && (
                        <button 
                          onClick={() => handleMarkExit(v.id)}
                          className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-[10px] font-bold transition-all border border-rose-100"
                        >Mark Exit</button>
                      )}
                      {v.status === 'exited' && (
                        <span className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-bold">EXITED</span>
                      )}
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Log Vehicle Entry</h3>
                <p className="text-slate-500 text-sm">Record vehicle movement at the gate</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <form onSubmit={handleAddEntry} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Vehicle No</label>
                    <input 
                      type="text" required placeholder="MH 01 AB 1234"
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold uppercase transition-all focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.vehicle_number}
                      onChange={(e) => setFormData({...formData, vehicle_number: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Type</label>
                    <select 
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none cursor-pointer"
                      value={formData.vehicle_type}
                      onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                    >
                      <option value="car">Car / SUV</option>
                      <option value="bike">Bike / Scooter</option>
                      <option value="auto">Rickshaw/Auto</option>
                      <option value="truck">Loading / Truck</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-6 rounded-3xl space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Destination Flat (Optional)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <select 
                      className="px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none"
                      value={selectedWing || ""}
                      onChange={(e) => setSelectedWing(Number(e.target.value))}
                    >
                      <option value="">Wing</option>
                      {wings.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                    <select 
                      className="px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none disabled:opacity-50"
                      disabled={!selectedWing}
                      value={formData.visiting_flat_id}
                      onChange={(e) => setFormData({...formData, visiting_flat_id: e.target.value})}
                    >
                      <option value="">Flat No</option>
                      {flats.map(f => <option key={f.id} value={f.id}>{f.flat_number}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <button 
                type="submit" disabled={isSubmitting}
                className="w-full py-4 bg-primary hover:bg-blue-600 text-white rounded-3xl font-black text-sm tracking-widest shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "LOG ENTRY"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
