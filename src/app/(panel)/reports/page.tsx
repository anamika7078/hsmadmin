"use client";

import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Filter, 
  FileText, 
  ArrowUpRight, 
  ShieldCheck,
  MessageSquare,
  Users,
  IndianRupee,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import StatsCard from "@/components/cards/stats-card";

export default function ReportsPage() {
  const [dateRange] = useState("Last 30 Days");

  const reports = [
    { id: "1", title: "Monthly Maintenance Report", type: "Financial", date: "Apr 2024", size: "1.2 MB" },
    { id: "2", title: "Security Incident Log", type: "Security", date: "Apr 2024", size: "850 KB" },
    { id: "3", title: "Visitor & Vehicle Traffic", type: "Logs", date: "Mar 2024", size: "2.4 MB" },
    { id: "4", title: "Complaint Resolution Analytics", type: "Service", date: "Q1 2024", size: "3.1 MB" },
    { id: "5", title: "Vendor Payment Summary", type: "Financial", date: "Mar 2024", size: "1.1 MB" },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-2xl">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            Reports & Analytics
          </h1>
          <p className="text-slate-500 mt-1">Deep dive into society management metrics and performance data.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50 transition-all">
             <Calendar className="w-4 h-4" />
             {dateRange}
             <ChevronRight className="w-4 h-4 rotate-90 ml-1" />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <Download className="w-4.5 h-4.5" />
            Export Data
          </button>
        </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Revenue Growth" 
          value="₹ 12.4L" 
          icon={IndianRupee} 
          color="bg-emerald-100 text-emerald-600"
          badge={{ text: "+14.2%", variant: "live" }}
        />
        <StatsCard 
          title="Active Members" 
          value="1,142" 
          icon={Users} 
          color="bg-blue-100 text-blue-600"
          badge={{ text: "+2.5%", variant: "new" }}
        />
        <StatsCard 
          title="Resolution Rate" 
          value="94.2%" 
          icon={MessageSquare} 
          color="bg-purple-100 text-purple-600"
          badge={{ text: "Excellence", variant: "live" }}
        />
        <StatsCard 
          title="Security Incidents" 
          value="02" 
          icon={ShieldCheck} 
          color="bg-rose-100 text-rose-600"
          badge={{ text: "-65%", variant: "pending" }}
        />
      </div>

      {/* Visual Data Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Collections Trend Card */}
        <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-soft p-8">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Collections Trend</h3>
                <p className="text-sm text-slate-400 font-medium">Monthly maintenance & utility collections</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-xs font-bold text-slate-500">Collected</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <span className="text-xs font-bold text-slate-500">Pending</span>
                 </div>
              </div>
           </div>
           
           {/* Visual Chart Placeholder (CSS-based) */}
           <div className="h-64 flex items-end justify-between gap-4 pt-4">
              {[60, 45, 80, 55, 95, 70, 85].map((h, i) => (
                <div key={i} className="flex-1 group relative flex flex-col items-center gap-3">
                   <div className="w-full flex flex-col items-end justify-end gap-1 px-1">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className="w-full bg-primary rounded-t-xl opacity-80 group-hover:opacity-100 transition-all shadow-lg shadow-primary/10 relative"
                      >
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            ₹{h}k
                         </div>
                      </motion.div>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${100-h}%` }}
                        className="w-full bg-slate-100 rounded-b-xl group-hover:bg-slate-200 transition-all"
                      />
                   </div>
                   <span className="text-[10px] font-bold text-slate-400">Week {i+1}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Complaint Distribution */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft p-8">
           <h3 className="text-xl font-bold text-slate-900 mb-2">Issue Distribution</h3>
           <p className="text-sm text-slate-400 font-medium mb-8">Categorized complaint volume</p>
           
           <div className="space-y-6">
              {[
                { label: "Plumbing", value: 45, color: "bg-blue-500" },
                { label: "Electrical", value: 28, color: "bg-amber-500" },
                { label: "Security", value: 15, color: "bg-rose-500" },
                { label: "Cleaning", value: 12, color: "bg-emerald-500" }
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                   <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="text-slate-900">{item.value}%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        className={cn("h-full rounded-full", item.color)} 
                      />
                   </div>
                </div>
              ))}
           </div>
           
           <div className="mt-10 p-4 bg-slate-50 rounded-3xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                 <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</p>
                 <p className="text-sm font-bold text-slate-900">Improved by 12% vs LY</p>
              </div>
           </div>
        </div>
      </div>

      {/* Downloadable Reports Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h3 className="text-xl font-bold text-slate-900">Available Reports</h3>
              <p className="text-sm text-slate-400 font-medium">Download historical data and summaries</p>
           </div>
           <div className="flex items-center gap-3">
              <div className="relative">
                 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <select className="pl-9 pr-6 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-600 appearance-none focus:ring-0">
                    <option>All Types</option>
                    <option>Financial</option>
                    <option>Security</option>
                    <option>Service</option>
                 </select>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full">
              <thead>
                 <tr className="text-left bg-slate-50/30">
                    <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-12">Report Document</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Period</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Size</th>
                    <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-12">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {reports.map((report) => (
                   <tr key={report.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                      <td className="px-10 py-6 pl-12">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                               <FileText className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                               <p className="font-bold text-slate-900">{report.title}</p>
                               <p className="text-[10px] text-slate-400 font-medium tracking-wide">PDF DOCUMENT</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className={cn(
                           "px-3 py-1 rounded-lg text-[10px] font-bold tracking-tight",
                           report.type === 'Financial' ? "bg-emerald-50 text-emerald-600" :
                           report.type === 'Security' ? "bg-rose-50 text-rose-600" :
                           "bg-blue-50 text-blue-600"
                         )}>
                           {report.type}
                         </span>
                      </td>
                      <td className="px-8 py-6 text-center text-sm font-bold text-slate-600">{report.date}</td>
                      <td className="px-8 py-6 text-center text-xs font-medium text-slate-400">{report.size}</td>
                      <td className="px-10 py-6 text-right pr-12">
                         <button className="p-3 text-slate-400 hover:text-primary hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                            <Download className="w-5 h-5" />
                         </button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
        
        <div className="p-8 border-t border-slate-50 text-center">
           <button className="text-sm font-bold text-primary hover:underline flex items-center justify-center gap-2 mx-auto">
              Request Custom Audit Report <ArrowUpRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
}
