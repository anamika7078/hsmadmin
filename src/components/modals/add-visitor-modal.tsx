"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, User, Phone, MapPin, ClipboardList } from "lucide-react";
import { visitorsApi } from "@/services/modules/visitors";
import { societyApi, Wing, Flat } from "@/services/modules/society";
import { toast } from "react-hot-toast";

interface AddVisitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "guest" | "delivery" | "maid" | "other";
}

export default function AddVisitorModal({ isOpen, onClose, type }: AddVisitorModalProps) {
  const [loading, setLoading] = useState(false);
  const [wings, setWings] = useState<Wing[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [selectedWing, setSelectedWing] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    purpose: "",
    visiting_flat_id: "",
    vehicle_number: ""
  });

  useEffect(() => {
    if (isOpen) {
      societyApi.getWings().then((res: any) => {
        if (res.success) setWings(res.data);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedWing) {
      societyApi.getFlats({ wing_id: selectedWing }).then((res: any) => {
        if (res.success) setFlats(res.data);
      });
    } else {
      setFlats([]);
    }
  }, [selectedWing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.visiting_flat_id) {
       toast.error("Please select a destination flat");
       return;
    }

    try {
      setLoading(true);
      const res: any = await visitorsApi.createRequest({
        ...formData,
        visitor_type: type,
        visiting_flat_id: parseInt(formData.visiting_flat_id)
      });

      if (res.success) {
        toast.success(`${type.toUpperCase()} request sent to resident`);
        onClose();
        setFormData({ name: "", mobile: "", purpose: "", visiting_flat_id: "", vehicle_number: "" });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 capitalize">Log {type} Entry</h3>
            <p className="text-slate-500 text-sm mt-1">Details will be sent to the resident for approval.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            {/* Guest Name & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Visitor Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text" required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Mobile No</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel" required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="10-digit number"
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Destination Selection */}
            <div className="bg-slate-50/80 p-6 rounded-[2rem] space-y-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Visiting Destination</p>
               <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <select 
                      required
                      className="w-full pl-9 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none cursor-pointer"
                      value={selectedWing || ""}
                      onChange={(e) => setSelectedWing(Number(e.target.value))}
                    >
                      <option value="">Wing</option>
                      {wings.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <select 
                      required disabled={!selectedWing}
                      className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none cursor-pointer disabled:opacity-50"
                      value={formData.visiting_flat_id}
                      onChange={(e) => setFormData({...formData, visiting_flat_id: e.target.value})}
                    >
                      <option value="">Flat No</option>
                      {flats.map(f => <option key={f.id} value={f.id}>{f.flat_number}</option>)}
                    </select>
                  </div>
               </div>
            </div>

            {/* Purpose & Vehicle */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Purpose / Note</label>
                <div className="relative">
                  <ClipboardList className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                  <textarea
                    rows={2}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    placeholder="e.g. Courier, Relative visit, etc."
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  />
                </div>
              </div>
              {type === 'guest' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Vehicle Number (Optional)</label>
                  <input
                    type="text"
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold uppercase transition-all focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="MH 00 XX 0000"
                    value={formData.vehicle_number}
                    onChange={(e) => setFormData({...formData, vehicle_number: e.target.value})}
                  />
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full py-4 bg-primary hover:bg-blue-600 text-white rounded-3xl font-black text-sm tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "SEND APPROVAL REQUEST"}
          </button>
        </form>
      </div>
    </div>
  );
}
