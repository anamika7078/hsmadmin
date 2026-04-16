"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Download, FileText, Send, Plus, Edit2, Trash2, Loader2, X, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { billingApi, Bill, BillingStats } from "@/services/modules/billing";
import { flatsApi } from "@/services/modules/flats";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export default function BillingPage() {
  const { user } = useAuthStore();
  const isCommittee = user?.role === "committee";

  const [bills, setBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [flats, setFlats] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    bill_type: "maintenance",
    amount: "",
    due_date: "",
    description: "",
    flat_ids: [] as number[],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billsRes, statsRes, flatsRes] = await Promise.all([
        isCommittee ? billingApi.getAll() : billingApi.getMyBills(),
        isCommittee ? billingApi.getStats() : Promise.resolve({ success: true, data: null }),
        isCommittee ? flatsApi.getFlats() : Promise.resolve({ success: true, data: [] }),
      ]) as any[];

      if (billsRes.success) setBills(billsRes.data);
      if (statsRes.success) setStats(statsRes.data);
      if (isCommittee && flatsRes.success) setFlats(flatsRes.data);
    } catch (error) {
      toast.error("Failed to fetch billing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (bill: Bill | null = null) => {
    if (bill) {
      setEditingBill(bill);
      setFormData({
        bill_type: bill.bill_type,
        amount: bill.amount.toString(),
        due_date: bill.due_date.split("T")[0],
        description: bill.description || "",
        flat_ids: [bill.flat_id],
      });
    } else {
      setEditingBill(null);
      setFormData({
        bill_type: "maintenance",
        amount: "",
        due_date: "",
        description: "",
        flat_ids: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBill(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingBill) {
        const res: any = await billingApi.update(editingBill.id, {
          bill_type: formData.bill_type as any,
          amount: parseFloat(formData.amount),
          due_date: formData.due_date,
          description: formData.description,
        });
        if (res.success) {
          toast.success("Bill updated successfully");
          handleCloseModal();
          fetchData();
        } else {
          toast.error(res.message || "Failed to update bill");
        }
      } else {
        if (formData.flat_ids.length === 0) {
          toast.error("Please select at least one flat");
          setIsSubmitting(false);
          return;
        }
        const res: any = await billingApi.generate({
          bill_type: formData.bill_type,
          amount: parseFloat(formData.amount),
          due_date: formData.due_date,
          description: formData.description,
          flat_ids: formData.flat_ids,
        });
        if (res.success) {
          toast.success("Bills generated successfully");
          handleCloseModal();
          fetchData();
        } else {
          toast.error(res.message || "Failed to generate bills");
        }
      }
    } catch (error: any) {
      console.error("Billing error:", error);
      const errorMsg = error.response?.data?.message || error.message || (editingBill ? "Failed to update bill" : "Failed to generate bills");
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        const res: any = await billingApi.delete(id);
        if (res.success) {
          toast.success("Bill deleted successfully");
          fetchData();
        }
      } catch (error) {
        toast.error("Failed to delete bill");
      }
    }
  };

  if (loading && bills.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maintenance & Dues</h1>
          <p className="text-slate-500 text-sm">
            {isCommittee ? "Manage society billing, payments, and reminders." : "View and pay your society maintenance and other dues."}
          </p>
        </div>
        {isCommittee && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200"
          >
            <Plus className="w-5 h-5" />
            <span>Generate New Bills</span>
          </button>
        )}
      </div>

      {isCommittee && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
             <div className="relative z-10">
               <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Total Collection</p>
               <h2 className="text-3xl font-bold mb-6">{formatCurrency(stats?.total_amount || 0)}</h2>
               <div className="flex items-center gap-2 text-[11px] font-bold bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
                 <span className="text-emerald-300">↑ Total Bills: {stats?.total_bills || 0}</span>
               </div>
             </div>
             <CreditCard className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft">
             <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Paid Amount</p>
             <h2 className="text-3xl font-bold text-slate-900 mb-6">{formatCurrency(stats?.collected_amount || 0)}</h2>
             <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 border border-slate-100 w-fit px-3 py-1.5 rounded-full">
               <span className="text-emerald-500">{stats?.paid_bills || 0} Residents</span> paid
             </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft flex flex-col justify-between">
             <div>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Unpaid Bills</p>
               <h2 className="text-2xl font-bold text-rose-600">{stats?.unpaid_bills || 0}</h2>
             </div>
             <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-colors">
                <FileText className="w-4 h-4" /> View Detailed Stats
             </button>
          </div>
        </div>
      )}

      {/* Recent Bills Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Recent Transactions</h3>
          <div className="flex gap-2">
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100 hover:bg-slate-100 transition-all">
               <Download className="w-4 h-4" /> Export CSV
             </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/30 text-left">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-8">Bill ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resident</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-8">
                  {isCommittee ? "Actions" : "Options"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bills.length > 0 ? (
                bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 pl-8 text-xs font-bold text-slate-500">#INV-{bill.id}</td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{bill.wing_name}-{bill.flat_number}</p>
                        <p className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Due: {new Date(bill.due_date).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-medium text-slate-600 capitalize">{bill.bill_type}</span>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-900">{formatCurrency(bill.amount)}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        bill.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                        bill.status === "overdue" ? "bg-rose-100 text-rose-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {bill.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right pr-8">
                        <div className="flex items-center justify-end gap-2">
                          {isCommittee ? (
                            <>
                              <button 
                                onClick={() => handleOpenModal(bill)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit Bill"
                              >
                                 <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(bill.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Delete Bill"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : bill.status !== 'paid' && (
                            <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all">
                               Pay Now
                            </button>
                          )}
                          <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-xl transition-all" title="View Bill">
                             <FileText className="w-4 h-4" />
                          </button>
                          {isCommittee && (
                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-xl transition-all" title="Send Reminder">
                               <Send className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500 text-sm italic">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
               <div>
                  <h3 className="text-xl font-bold text-slate-900">{editingBill ? "Edit Bill" : "Generate New Bills"}</h3>
                  <p className="text-slate-500 text-xs mt-1">Fill in the details to {editingBill ? "update" : "create"} billing records.</p>
               </div>
               <button onClick={handleCloseModal} className="p-2.5 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm">
                 <X className="w-5 h-5" />
               </button>
             </div>

             <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Bill Type</label>
                    <select 
                      value={formData.bill_type}
                      onChange={(e) => setFormData({...formData, bill_type: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                    >
                      <option value="maintenance">Maintenance</option>
                      <option value="water">Water Bill</option>
                      <option value="electricity">Electricity</option>
                      <option value="parking">Parking</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Amount (₹)</label>
                    <input 
                      type="number"
                      required
                      placeholder="4500"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Due Date</label>
                    <input 
                      type="date"
                      required
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                    />
                  </div>
                  {!editingBill && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Target Flats</label>
                      <select 
                        multiple
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none min-h-[100px]"
                        value={formData.flat_ids.map(String)}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                          setFormData({...formData, flat_ids: values});
                        }}
                      >
                        {flats.map(flat => (
                          <option key={flat.id} value={flat.id}>{flat.wing_name} - {flat.flat_number}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1 italic">Hold Ctrl/Cmd to select multiple flats.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Description (Optional)</label>
                  <textarea 
                    placeholder="Brief description about the bill..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium min-h-[100px] focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
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
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isSubmitting ? (
                       <>
                         <Loader2 className="w-5 h-5 animate-spin" />
                         {editingBill ? "Updating..." : "Generating..."}
                       </>
                     ) : (
                       editingBill ? "Update Bill" : "Generate Bills"
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
