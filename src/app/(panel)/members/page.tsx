"use client";

import React, { useState } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Phone,
  Building2,
  Calendar,
  Edit2,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/services/modules/auth";
import { membersApi } from "@/services/modules/members";
import { cn } from "@/lib/utils";
import StatsCard from "@/components/cards/stats-card";
import toast from "react-hot-toast";

type Tab = "requests" | "all";

interface Member {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  phone?: string;
  flatNumber?: string;
  flat_number?: string;   // snake_case alias from API
  wing?: string;
  wing_name?: string;
  society_name?: string;
  is_verified?: boolean;
  status?: string;
  createdAt?: string;
  created_at?: string;
}

export default function MembersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", mobile: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", mobile: "" });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Delete state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: members, isLoading: isLoadingMembers, refetch: refetchMembers } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      try {
        const response: any = await membersApi.getAll();
        return response?.data?.members || [];
      } catch (error) {
        console.error("Error fetching members:", error);
        toast.error("Failed to load members");
        return [];
      }
    },
    enabled: activeTab === "all"
  });

  const { data: requests, isLoading: isLoadingRequests, refetch: refetchRequests } = useQuery({
    queryKey: ["member-requests"],
    queryFn: async () => {
      try {
        const response: any = await membersApi.getAll({ status: 'unverified' }); // using 'unverified' based on backend API logic
        return response?.data?.members || [];
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast.error("Failed to load requests");
        return [];
      }
    },
    enabled: activeTab === "requests"
  });

  const handleApprove = async (id: string) => {
    try {
      await membersApi.approve(Number(id), {});
      toast.success("Member approved successfully");
      refetchRequests();
    } catch (error) {
      console.error("Error approving member:", error);
      toast.error("Failed to approve member");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await membersApi.reject(Number(id), { reason: "Rejected by committee" });
      toast.success("Member rejected successfully");
      refetchRequests();
    } catch (error) {
      console.error("Error rejecting member:", error);
      toast.error("Failed to reject member");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.mobile || !newMember.password) {
      toast.error("Please fill in required fields: Name, Mobile, and Password");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: newMember.name,
        mobile: newMember.mobile,
        password: newMember.password,
        role: "member"
      };

      if (newMember.email.trim() !== "") {
        payload.email = newMember.email;
      }

      await authApi.registerUser(payload);
      toast.success("Member added successfully");
      setIsAddModalOpen(false);
      setNewMember({ name: "", email: "", mobile: "", password: "" });
      if (activeTab === "all") refetchMembers();
      else refetchRequests();
    } catch (error: any) {
      console.error("Error adding member:", error);
      toast.error(error?.response?.data?.message || "Failed to add member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (member: Member) => {
    setEditingMember(member);
    setEditForm({
      name: member.name || "",
      email: member.email || "",
      mobile: member.mobile || member.phone || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!editForm.name || !editForm.mobile) {
      toast.error("Name and Mobile are required");
      return;
    }
    setIsEditSubmitting(true);
    try {
      await membersApi.update(Number(editingMember.id), {
        name: editForm.name,
        email: editForm.email || undefined,
        mobile: editForm.mobile,
      });
      toast.success("Member updated successfully");
      setIsEditModalOpen(false);
      setEditingMember(null);
      refetchMembers();
    } catch (error: any) {
      console.error("Error updating member:", error);
      toast.error(error?.response?.data?.message || "Failed to update member");
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleOpenDelete = (member: Member) => {
    setDeletingMember(member);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteMember = async () => {
    if (!deletingMember) return;
    setIsDeleting(true);
    try {
      await membersApi.delete(Number(deletingMember.id));
      toast.success("Member deleted successfully");
      setIsDeleteModalOpen(false);
      setDeletingMember(null);
      refetchMembers();
    } catch (error: any) {
      console.error("Error deleting member:", error);
      toast.error(error?.response?.data?.message || "Failed to delete member");
    } finally {
      setIsDeleting(false);
    }
  };

  const displayData = activeTab === "all" ? members : requests;
  const isLoading = activeTab === "all" ? isLoadingMembers : isLoadingRequests;

  const filteredData = (displayData as Member[])?.filter((item: Member) => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.flatNumber || item.flat_number || "")?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Member Management</h1>
          <p className="text-slate-500 mt-1">Review registration requests and manage society residents.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Total Members" 
          value={members?.length?.toString() || "0"} 
          icon={Users} 
          color="bg-blue-100 text-blue-600"
          badge={{ text: "Active", variant: "live" }}
        />
        <StatsCard 
          title="Pending Requests" 
          value={requests?.length?.toString() || "0"} 
          icon={UserPlus} 
          color="bg-orange-100 text-orange-600"
          badge={{ text: (requests?.length ?? 0) > 0 ? "Action Required" : "Up to date", variant: "pending" }}
        />
        <StatsCard 
          title="Recent Joins" 
          value="12" 
          icon={Calendar} 
          color="bg-emerald-100 text-emerald-600"
          badge={{ text: "This Month", variant: "new" }}
        />
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
        {/* Tabs and Filters */}
        <div className="p-6 border-b border-slate-50 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Custom Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
              <button 
                onClick={() => setActiveTab("all")}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  activeTab === "all" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                All Members
              </button>
              <button 
                onClick={() => setActiveTab("requests")}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                  activeTab === "requests" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Requests
                {requests && requests.length > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center bg-orange-500 text-white text-[10px] rounded-full">
                    {requests.length}
                  </span>
                )}
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by name, flat, or email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
              <button className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-left bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-10">Member Details</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Flat/Unit</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Contact</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-10 py-6">
                        <div className="h-12 bg-slate-100 rounded-2xl w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredData?.length > 0 ? (
                  filteredData.map((member: Member) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={member.id} 
                      className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-indigo-500/10 flex items-center justify-center text-primary font-bold text-lg">
                            {member.name?.charAt(0) || "M"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">{member.name || "N/A"}</p>
                            <p className="text-xs text-slate-400 font-medium">Joined {member.createdAt || member.created_at ? new Date(member.createdAt || member.created_at!).toLocaleDateString() : "Recently"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-sm font-bold text-slate-700">{member.wing_name || member.wing || "W"} - {member.flatNumber || member.flat_number || "000"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <Mail className="w-3.5 h-3.5" />
                            {member.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <Phone className="w-3.5 h-3.5" />
                            {member.mobile || member.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <span className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-bold border",
                            member.is_verified ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            !member.is_verified ? "bg-amber-50 text-amber-600 border-amber-100" :
                            "bg-rose-50 text-rose-600 border-rose-100"
                          )}>
                            {member.is_verified ? "APPROVED" : "PENDING"}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {activeTab === "requests" ? (
                            <>
                              <button 
                                onClick={() => handleApprove(member.id)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                title="Approve"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleReject(member.id)}
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleOpenEdit(member)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                title="Edit Member"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleOpenDelete(member)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                title="Delete Member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-10 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center">
                          <Users className="w-10 h-10 text-slate-200" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-900 font-bold">No members found</p>
                          <p className="text-slate-500 text-sm">We couldn&apos;t find any members matching your criteria.</p>
                        </div>
                        <button 
                          onClick={() => {setSearchQuery(""); setActiveTab("all")}}
                          className="text-primary font-bold text-sm hover:underline"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-8 border-t border-slate-50 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-400">
            Showing <span className="text-slate-900">{filteredData?.length || 0}</span> of <span className="text-slate-900">{displayData?.length || 0}</span> members
          </p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50" disabled>
              Previous
            </button>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map(page => (
                <button 
                  key={page}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all",
                    page === 1 ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className="px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Add New Member</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    placeholder="Enter member's full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={newMember.mobile}
                    onChange={(e) => setNewMember({ ...newMember, mobile: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    placeholder="Enter mobile number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Initial Password</label>
                  <input
                    type="password"
                    required
                    value={newMember.password}
                    onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    placeholder="Create a password"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-4 py-3 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 text-white font-bold bg-primary hover:bg-primary/90 rounded-xl transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Adding..." : "Add Member"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Member Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Edit Member</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditMember} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    placeholder="Full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    placeholder="Mobile number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    placeholder="Email address"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-4 py-3 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isEditSubmitting}
                    className="flex-1 px-4 py-3 text-white font-bold bg-blue-600 hover:bg-blue-700 rounded-xl transition-all disabled:opacity-50"
                  >
                    {isEditSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && deletingMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-rose-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900">Delete Member</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Are you sure you want to delete <span className="font-bold text-slate-800">{deletingMember.name}</span>? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-3 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMember}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 text-white font-bold bg-rose-600 hover:bg-rose-700 rounded-xl transition-all disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
