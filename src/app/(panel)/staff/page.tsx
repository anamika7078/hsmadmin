"use client";

import React, { useState } from "react";
import { 
  UserCircle, 
  Search, 
  Filter, 
  Plus, 
  ShieldCheck, 
  Users, 
  Briefcase,
  Phone,
  Calendar,
  ChevronDown,
  Edit2,
  Trash2,
  CheckCircle2,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import StatsCard from "@/components/cards/stats-card";

type StaffCategory = "ALL" | "GUARD" | "HOUSEKEEPER" | "MAINTENANCE" | "ADMINISTRATION";

const mockStaff = [
  { id: "1", name: "Ramesh Pawar", email: "ramesh.p@example.com", phone: "+91 99999 11111", category: "GUARD", status: "ON_DUTY", joinDate: "2023-11-10", rating: 4.8 },
  { id: "2", name: "Laxmi Devi", email: "laxmi.d@example.com", phone: "+91 88888 22222", category: "HOUSEKEEPER", status: "ON_DUTY", joinDate: "2024-01-05", rating: 4.5 },
  { id: "3", name: "Suresh Kondke", email: "suresh.k@example.com", phone: "+91 77777 33333", category: "MAINTENANCE", status: "OFF_DUTY", joinDate: "2023-08-15", rating: 4.2 },
  { id: "4", name: "Anand Sharma", email: "anand.s@example.com", phone: "+91 66666 44444", category: "GUARD", status: "ON_DUTY", joinDate: "2024-03-20", rating: 4.9 },
  { id: "5", name: "Meena Rao", email: "meena.r@example.com", phone: "+91 55555 55555", category: "HOUSEKEEPER", status: "OFF_DUTY", joinDate: "2024-02-12", rating: 4.7 },
  { id: "6", name: "Rahul Deshmukh", email: "rahul.d@example.com", phone: "+91 44444 66666", category: "ADMINISTRATION", status: "ON_DUTY", joinDate: "2023-12-01", rating: 4.6 },
];

export default function StaffManagementPage() {
  const [activeCategory, setActiveCategory] = useState<StaffCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const filteredStaff = mockStaff.filter(s => 
    (activeCategory === "ALL" || s.category === activeCategory) &&
    (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     s.phone.includes(searchQuery))
  );

  const categories = [
    { label: "All Staff", value: "ALL", icon: Users },
    { label: "Security Guards", value: "GUARD", icon: ShieldCheck },
    { label: "Housekeepers", value: "HOUSEKEEPER", icon: UserCircle },
    { label: "Maintenance", value: "MAINTENANCE", icon: Briefcase },
    { label: "Administration", value: "ADMINISTRATION", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-2xl">
              <UserCircle className="w-8 h-8 text-blue-600" />
            </div>
            Staff Management
          </h1>
          <p className="text-slate-500 mt-1">Manage society personnel, security guards, and service staff.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all">
            Attendance Log
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <Plus className="w-4.5 h-4.5" />
            Hire Staff
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Staff" 
          value="24" 
          icon={Users} 
          color="bg-blue-100 text-blue-600"
          badge={{ text: "Active", variant: "live" }}
        />
        <StatsCard 
          title="On Duty" 
          value="18" 
          icon={CheckCircle2} 
          color="bg-emerald-100 text-emerald-600"
          badge={{ text: "Now", variant: "new" }}
        />
        <StatsCard 
          title="Guards" 
          value="08" 
          icon={ShieldCheck} 
          color="bg-indigo-100 text-indigo-600"
        />
        <StatsCard 
          title="Service Staff" 
          value="16" 
          icon={Briefcase} 
          color="bg-amber-100 text-amber-600"
        />
      </div>

      {/* Navigation and Controls */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-soft flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex flex-1 items-center gap-4 max-w-4xl">
          {/* Category Dropdown as requested */}
          <div className="relative min-w-[240px]">
            <button 
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all"
            >
              <div className="flex items-center gap-3">
                {React.createElement(categories.find(c => c.value === activeCategory)?.icon || Users, { className: "w-4.5 h-4.5 text-primary" })}
                {categories.find(c => c.value === activeCategory)?.label}
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform", isCategoryOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
              {isCategoryOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-20 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-100 py-2 overflow-hidden"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setActiveCategory(cat.value as StaffCategory);
                        setIsCategoryOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-all hover:bg-blue-50 hover:text-primary",
                        activeCategory === cat.value ? "text-primary bg-blue-50/50" : "text-slate-600"
                      )}
                    >
                      <cat.icon className="w-4 h-4" />
                      {cat.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search staff by name or mobile..." 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-5 py-3 text-slate-500 font-bold text-sm hover:text-primary transition-colors flex items-center gap-2 bg-slate-50 rounded-xl">
             <Filter className="w-4 h-4" />
             More Filters
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
             <thead>
                <tr className="text-left bg-slate-50/50">
                  <th className="px-10 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-12">Staff Member</th>
                  <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Role & Dept</th>
                  <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Duty Status</th>
                  <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Performance</th>
                  <th className="px-10 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right pr-12">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {filteredStaff.map((staff) => (
                 <tr key={staff.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                   <td className="px-10 py-6 pl-12">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center text-primary font-bold text-xl uppercase group-hover:scale-110 transition-transform">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">{staff.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {staff.phone}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(staff.joinDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                   </td>
                   <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-700">{staff.category}</span>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-tight">Society Employee</span>
                      </div>
                   </td>
                   <td className="px-8 py-6 text-center">
                      <div className="flex justify-center">
                        <span className={cn(
                          "px-4 py-2 rounded-full text-[10px] font-bold border flex items-center gap-2",
                          staff.status === 'ON_DUTY' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                        )}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", staff.status === 'ON_DUTY' ? "bg-emerald-500" : "bg-slate-300")} />
                          {staff.status === 'ON_DUTY' ? "ON DUTY" : "OFF DUTY"}
                        </span>
                      </div>
                   </td>
                   <td className="px-8 py-6">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={cn("w-3.5 h-3.5", i < Math.floor(staff.rating) ? "fill-amber-500" : "fill-slate-100 text-slate-200")} />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-600">{staff.rating} / 5.0</span>
                      </div>
                   </td>
                   <td className="px-10 py-6 text-right pr-12">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2.5 text-slate-400 hover:text-primary hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-10 border-t border-slate-50 flex items-center justify-between">
           <p className="text-sm font-bold text-slate-400">Total Entries: <span className="text-slate-900">{filteredStaff.length} Employees</span></p>
           <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors" disabled>Previous</button>
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20">1</div>
              <button className="px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
}
