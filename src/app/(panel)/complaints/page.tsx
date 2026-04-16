"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Clock, CheckCircle2, AlertCircle, Edit2, Trash2, Loader2, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { complaintsApi, Complaint, ComplaintStats } from "@/services/modules/complaints";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { Plus } from "lucide-react";

const statusStyles = {
  "open": "bg-rose-100 text-rose-700 border-rose-200",
  "in_progress": "bg-amber-100 text-amber-700 border-amber-200",
  "resolved": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "closed": "bg-slate-100 text-slate-700 border-slate-200",
  "rejected": "bg-gray-100 text-gray-700 border-gray-200",
};

export default function ComplaintsPage() {
  const { user } = useAuthStore();
  const isCommittee = user?.role === "committee";

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<ComplaintStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  // Update state for resolution
  const [updateData, setUpdateData] = useState({
    status: "",
    resolution_notes: "",
  });

  const [newComplaintData, setNewComplaintData] = useState({
    title: "",
    description: "",
    category: "other",
    priority: "medium",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [res, statsRes] = (await Promise.all([
        isCommittee 
          ? complaintsApi.getAll({ status: filter === "all" ? undefined : filter })
          : complaintsApi.getMyComplaints(),
        isCommittee ? complaintsApi.getStats() : Promise.resolve({ success: true, data: null })
      ])) as any[];

      if (res.success) {
        setComplaints(isCommittee ? (res.data.complaints || []) : (res.data || []));
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      toast.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleOpenModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setUpdateData({
      status: complaint.status,
      resolution_notes: complaint.resolution_notes || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await complaintsApi.create(newComplaintData);
      if (res.success) {
        toast.success("Complaint submitted successfully");
        setIsCreateModalOpen(false);
        setNewComplaintData({ title: "", description: "", category: "other", priority: "medium" });
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to submit complaint");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      try {
        const res: any = await complaintsApi.delete(id);
        if (res.success) {
          toast.success("Complaint deleted successfully");
          fetchData();
        }
      } catch (error) {
        toast.error("Failed to delete complaint");
      }
    }
  };

  if (loading && complaints.length === 0) {
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
          <h1 className="text-2xl font-bold text-slate-900">Complaints</h1>
          <p className="text-slate-500 text-sm">
            {isCommittee ? "Manage and track resident issues." : "Log and track your complaints."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isCommittee && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" />
              <span>Raise Complaint</span>
            </button>
          )}
          {isCommittee && (
            <div className="bg-white p-1 rounded-2xl border border-slate-200 flex shadow-sm">
               <button 
                onClick={() => setFilter("all")}
                className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", filter === "all" ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-slate-50 text-slate-600")}
               >All</button>
               <button 
                onClick={() => setFilter("open")}
                className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", filter === "open" ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-slate-50 text-slate-600")}
               >Pending</button>
               <button 
                onClick={() => setFilter("resolved")}
                className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", filter === "resolved" ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-slate-50 text-slate-600")}
               >Resolved</button>
            </div>
          )}
        </div>
      </div>

      {isCommittee && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: "Total Complaints", value: stats?.total_complaints || 0, icon: MessageSquare, color: "text-blue-500" },
            { label: "Pending Issues", value: (stats?.open_complaints || 0) + (stats?.in_progress_complaints || 0), icon: AlertCircle, color: "text-rose-500" },
            { label: "Resolved This Month", value: stats?.resolved_complaints || 0, icon: CheckCircle2, color: "text-emerald-500" }
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-soft flex items-center gap-4">
              <div className={cn("p-3 rounded-2xl bg-slate-50", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <h4 className="text-xl font-bold text-slate-900">{stat.value}</h4>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 text-left">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest pl-8">Ticket</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Resident</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Issue</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right pr-8">
                  {isCommittee ? "Action" : "View"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.length > 0 ? (
                complaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 pl-8">
                       <span className="text-xs font-bold text-slate-400">#C-{complaint.id}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{complaint.complainant_name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">Flat {complaint.wing_name}-{complaint.flat_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-slate-700 max-w-xs">{complaint.title}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 capitalize">
                        {complaint.category}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold border uppercase", statusStyles[complaint.status as keyof typeof statusStyles])}>
                        {complaint.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        {isCommittee ? (
                          <>
                            <button 
                              onClick={() => handleOpenModal(complaint)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Manage Complaint"
                            >
                               <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(complaint.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Delete Complaint"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleOpenModal(complaint)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all" title="View Details"
                          >
                             <Filter className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500 text-sm italic">
                    No complaints found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
               <div>
                  <h3 className="text-xl font-bold text-slate-900">Manage Complaint</h3>
                  <p className="text-slate-500 text-xs mt-1">Update status and resolution for #C-{selectedComplaint.id}</p>
               </div>
               <button onClick={handleCloseModal} className="p-2.5 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm">
                 <X className="w-5 h-5" />
               </button>
             </div>

             <form onSubmit={isCommittee ? async (e) => {
                e.preventDefault();
                if (!selectedComplaint) return;
                try {
                  const res: any = await complaintsApi.updateStatus(selectedComplaint.id, updateData);
                  if (res.success) {
                    toast.success("Complaint updated successfully");
                    handleCloseModal();
                    fetchData();
                  }
                } catch (error) { toast.error("Update failed"); }
             } : (e) => e.preventDefault()} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Complaint Details</p>
                    <p className="text-sm font-bold text-slate-900">{selectedComplaint.title}</p>
                    <p className="text-xs text-slate-600 mt-1">{selectedComplaint.description}</p>
                  </div>

                  {isCommittee ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Update Status</label>
                        <select 
                          value={updateData.status}
                          onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Resolution Notes</label>
                        <textarea 
                          placeholder="Add notes about the action taken..."
                          value={updateData.resolution_notes}
                          onChange={(e) => setUpdateData({...updateData, resolution_notes: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium min-h-[120px] focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                        />
                      </div>
                    </>
                  ) : selectedComplaint.resolution_notes && (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Committee Resolution</p>
                      <p className="text-sm text-emerald-800">{selectedComplaint.resolution_notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all"
                   >
                     {isCommittee ? "Cancel" : "Close"}
                   </button>
                   {isCommittee && (
                    <button 
                      type="submit"
                      className="flex-[2] bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/20"
                    >
                      Update Complaint
                    </button>
                   )}
                </div>
             </form>
           </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between">
               <h3 className="text-xl font-bold text-slate-900">Raise New Complaint</h3>
               <button onClick={() => setIsCreateModalOpen(false)} className="p-2 text-slate-400"><X /></button>
             </div>
             <form onSubmit={handleCreateComplaint} className="p-8 space-y-4">
                <input 
                  required
                  placeholder="Subject" 
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none"
                  value={newComplaintData.title}
                  onChange={(e) => setNewComplaintData({...newComplaintData, title: e.target.value})}
                />
                <select 
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none"
                  value={newComplaintData.category}
                  onChange={(e) => setNewComplaintData({...newComplaintData, category: e.target.value})}
                >
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="security">Security</option>
                  <option value="other">Other</option>
                </select>
                <textarea 
                  required
                  placeholder="Describe your issue..." 
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none min-h-[150px]"
                  value={newComplaintData.description}
                  onChange={(e) => setNewComplaintData({...newComplaintData, description: e.target.value})}
                ></textarea>
                <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-2xl">Submit Complaint</button>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}
