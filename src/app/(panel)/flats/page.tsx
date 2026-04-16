"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Layers, 
  Home, 
  Search, 
  Filter, 
  Plus, 
  ChevronRight,
  CheckCircle2,
  MoreHorizontal,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import StatsCard from "@/components/cards/stats-card";
import { flatsApi } from "@/services/modules/flats";
import { societyApi } from "@/services/modules/society";
import { toast } from "react-hot-toast";

type Tab = "wings" | "flats";
type ViewMode = "grid" | "list";

export default function FlatsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("flats");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [wings, setWings] = useState<any[]>([]);
  const [flats, setFlats] = useState<any[]>([]);
  const [societyStats, setSocietyStats] = useState<any>(null);

  // Modal states
  const [isWingModalOpen, setIsWingModalOpen] = useState(false);
  const [isFlatModalOpen, setIsFlatModalOpen] = useState(false);
  const [editingWing, setEditingWing] = useState<any>(null);
  const [editingFlat, setEditingFlat] = useState<any>(null);

  // Form states
  const [wingFormData, setWingFormData] = useState({ name: "", floors: 0, flats_per_floor: 0 });
  const [flatFormData, setFlatFormData] = useState({ wing_id: "", flat_number: "", floor_number: 0, type: "2BHK", area_sqft: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wingsRes, flatsRes, societyRes]: any[] = await Promise.all([
        flatsApi.getWings(),
        flatsApi.getFlats(),
        societyApi.getDetails()
      ]);

      if (wingsRes.success) setWings(wingsRes.data);
      if (flatsRes.success) setFlats(flatsRes.data);
      if (societyRes.success) setSocietyStats(societyRes.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateWing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res: any;
      if (editingWing) {
        res = await societyApi.updateWing(editingWing.id, wingFormData);
      } else {
        res = await flatsApi.addWing(wingFormData);
      }
      
      if (res.success) {
        toast.success(editingWing ? "Wing updated" : "Wing added");
        setIsWingModalOpen(false);
        setEditingWing(null);
        fetchData();
      }
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleCreateFlat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res: any;
      if (editingFlat) {
        res = await flatsApi.updateFlat(editingFlat.id, flatFormData);
      } else {
        res = await flatsApi.addFlat(flatFormData);
      }

      if (res.success) {
        toast.success(editingFlat ? "Flat updated" : "Flat added");
        setIsFlatModalOpen(false);
        setEditingFlat(null);
        fetchData();
      }
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleDeleteWing = async (id: number) => {
    if (!window.confirm("Delete this wing?")) return;
    try {
      const res: any = await societyApi.deleteWing(id);
      if (res.success) {
        toast.success("Wing deleted");
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const handleDeleteFlat = async (id: number) => {
    if (!window.confirm("Delete this flat?")) return;
    try {
      const res: any = await flatsApi.deleteFlat(id.toString());
      if (res.success) {
        toast.success("Flat deleted");
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const filteredFlats = flats.filter(flat => 
    flat.flat_number.toString().includes(searchQuery) || 
    flat.wing_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (flat.owner_name && flat.owner_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredWings = wings.filter(wing => 
    wing.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && wings.length === 0) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-2xl">
              <Building2 className="w-8 h-8 text-amber-600" />
            </div>
            Flats & Wings
          </h1>
          <p className="text-slate-500 mt-1">Manage society infrastructure, residential units and building structure.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setEditingWing(null); setWingFormData({name: "", floors: 0, flats_per_floor: 0}); setIsWingModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all"
          >
            <Layers className="w-4.5 h-4.5" />
            Add Wing
          </button>
          <button 
            onClick={() => { setEditingFlat(null); setFlatFormData({wing_id: "", flat_number: "", floor_number: 0, type: "2BHK", area_sqft: ""}); setIsFlatModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            <Plus className="w-4.5 h-4.5" />
            Add Flat
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Wings" 
          value={societyStats?.total_wings?.toString().padStart(2, '0') || "00"} 
          icon={Layers} 
          color="bg-indigo-100 text-indigo-600"
        />
        <StatsCard 
          title="Total Units" 
          value={societyStats?.total_flats || "0"} 
          icon={Home} 
          color="bg-amber-100 text-amber-600"
        />
        <StatsCard 
          title="Occupied" 
          value={societyStats?.occupied_flats || "0"} 
          icon={CheckCircle2} 
          color="bg-emerald-100 text-emerald-600"
          badge={{ text: `${Math.round(((societyStats?.occupied_flats || 0) / (societyStats?.total_flats || 1)) * 100)}%`, variant: "new" }}
        />
        <StatsCard 
          title="Vacant Units" 
          value={String((societyStats?.total_flats - societyStats?.occupied_flats) || 0)} 
          icon={ShieldAlert} 
          color="bg-rose-100 text-rose-600"
        />
      </div>

      {/* Navigation and Controls */}
      <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-soft flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex p-1.5 bg-slate-100 rounded-[1.5rem] w-fit">
          <button 
            onClick={() => setActiveTab("flats")}
            className={cn(
              "px-8 py-3 rounded-[1rem] text-sm font-bold transition-all flex items-center gap-2",
              activeTab === "flats" ? "bg-white text-primary shadow-md" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Home className="w-4 h-4" />
            All Flats
          </button>
          <button 
            onClick={() => setActiveTab("wings")}
            className={cn(
              "px-8 py-3 rounded-[1rem] text-sm font-bold transition-all flex items-center gap-2",
              activeTab === "wings" ? "bg-white text-primary shadow-md" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Layers className="w-4 h-4" />
            Wings
          </button>
        </div>

        <div className="flex flex-1 items-center gap-4 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder={activeTab === 'flats' ? "Search unit, wing or owner..." : "Search wing name..."}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex bg-slate-50 p-1 rounded-xl">
             <button 
              onClick={() => setViewMode("list")}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-primary shadow-sm" : "text-slate-400")}
             >
                <List className="w-4.5 h-4.5" />
             </button>
             <button 
              onClick={() => setViewMode("grid")}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-primary shadow-sm" : "text-slate-400")}
             >
                <LayoutGrid className="w-4.5 h-4.5" />
             </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === "wings" ? (
          <motion.div 
            key="wings-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {filteredWings.map((wing) => (
              <div key={wing.id} className="group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-soft hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl group-hover:scale-110 transition-transform">
                    {wing.name.charAt(wing.name.length-1)}
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingWing(wing); setWingFormData({name: wing.name, floors: wing.floors, flats_per_floor: wing.flats_per_floor}); setIsWingModalOpen(true); }}
                      className="p-2 text-slate-300 hover:text-primary transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteWing(wing.id); }}
                      className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{wing.name}</h3>
                <p className="text-slate-400 text-sm font-medium mb-6">Residential</p>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-500">Occupancy</span>
                    <span className="text-primary">{Math.round((wing.occupied_flats/wing.total_flats)*100) || 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(wing.occupied_flats/wing.total_flats)*100 || 0}%` }}
                      className="h-full bg-primary rounded-full" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">Floors</p>
                      <p className="text-lg font-bold text-slate-900">{wing.floors}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">Total Flats</p>
                      <p className="text-lg font-bold text-slate-900">{wing.total_flats}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="flats-table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="text-left bg-slate-50/50">
                    <th className="px-10 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-12">Unit & Floor</th>
                    <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Type</th>
                    <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                    <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Primary Resident / Owner</th>
                    <th className="px-10 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right pr-12">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredFlats.map((flat) => (
                    <tr key={flat.id} className="group hover:bg-slate-50 transition-all">
                      <td className="px-10 py-6 pl-12">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                            <Home className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-lg">{flat.flat_number}</p>
                            <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase">
                              <Layers className="w-3 h-3" />
                              Wing {flat.wing_name} • Floor {flat.floor_number}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="px-4 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                          {flat.type}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex justify-center">
                          <span className={cn(
                            "px-4 py-2 rounded-full text-[10px] font-bold border flex items-center gap-2",
                            flat.is_occupied ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                          )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", flat.is_occupied ? "bg-emerald-500" : "bg-slate-400")} />
                            {flat.is_occupied ? "OCCUPIED" : "VACANT"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                            {flat.owner_name ? flat.owner_name.charAt(0) : "V"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{flat.owner_name || "Vacant"}</p>
                            {flat.owner_name && <p className="text-[11px] font-medium text-primary hover:underline cursor-pointer">View Profile</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right pr-12">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                            onClick={() => { setEditingFlat(flat); setFlatFormData({wing_id: flat.wing_id, flat_number: flat.flat_number, floor_number: flat.floor_number, type: flat.type, area_sqft: flat.area_sqft || ""}); setIsFlatModalOpen(true); }}
                            className="p-3 text-slate-400 hover:text-primary hover:bg-white hover:shadow-sm rounded-xl transition-all"
                           >
                             <Edit2 className="w-4.5 h-4.5" />
                           </button>
                           <button 
                            onClick={() => handleDeleteFlat(flat.id)}
                            className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                           >
                             <Trash2 className="w-4.5 h-4.5" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wing Modal */}
      {isWingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
               <h3 className="text-xl font-bold text-slate-900">{editingWing ? "Edit Wing" : "Add New Wing"}</h3>
               <button onClick={() => setIsWingModalOpen(false)} className="p-2.5 hover:bg-white rounded-2xl text-slate-400">
                 <X className="w-5 h-5" />
               </button>
             </div>
             <form onSubmit={handleCreateWing} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Wing Name (e.g. Wing A)</label>
                    <input 
                      type="text" required
                      value={wingFormData.name}
                      onChange={(e) => setWingFormData({...wingFormData, name: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Floors</label>
                      <input 
                        type="number" required
                        value={wingFormData.floors}
                        onChange={(e) => setWingFormData({...wingFormData, floors: parseInt(e.target.value)})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Flats per Floor</label>
                      <input 
                        type="number" required
                        value={wingFormData.flats_per_floor}
                        onChange={(e) => setWingFormData({...wingFormData, flats_per_floor: parseInt(e.target.value)})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                   <button type="button" onClick={() => setIsWingModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl">Cancel</button>
                   <button type="submit" className="flex-[2] bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20">{editingWing ? "Update Wing" : "Create Wing"}</button>
                </div>
             </form>
           </div>
        </div>
      )}

      {/* Flat Modal */}
      {isFlatModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
               <h3 className="text-xl font-bold text-slate-900">{editingFlat ? "Edit Flat" : "Add New Flat"}</h3>
               <button onClick={() => setIsFlatModalOpen(false)} className="p-2.5 hover:bg-white rounded-2xl text-slate-400">
                 <X className="w-5 h-5" />
               </button>
             </div>
             <form onSubmit={handleCreateFlat} className="p-8 space-y-6">
                <div className="space-y-4">
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Select Wing</label>
                    <select 
                      value={flatFormData.wing_id}
                      onChange={(e) => setFlatFormData({...flatFormData, wing_id: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="">Choose a wing...</option>
                      {wings.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Flat Number</label>
                      <input 
                        type="text" required
                        value={flatFormData.flat_number}
                        onChange={(e) => setFlatFormData({...flatFormData, flat_number: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Floor Number</label>
                      <input 
                        type="number" required
                        value={flatFormData.floor_number}
                        onChange={(e) => setFlatFormData({...flatFormData, floor_number: parseInt(e.target.value)})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Flat Type</label>
                      <select 
                        value={flatFormData.type}
                        onChange={(e) => setFlatFormData({...flatFormData, type: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                      >
                        <option value="1BHK">1BHK</option>
                        <option value="2BHK">2BHK</option>
                        <option value="3BHK">3BHK</option>
                        <option value="4BHK">4BHK</option>
                        <option value="Penthouse">Penthouse</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Area (sqft)</label>
                      <input 
                        type="number"
                        value={flatFormData.area_sqft}
                        onChange={(e) => setFlatFormData({...flatFormData, area_sqft: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                   <button type="button" onClick={() => setIsFlatModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl">Cancel</button>
                   <button type="submit" className="flex-[2] bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20">{editingFlat ? "Update Flat" : "Create Flat"}</button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}
