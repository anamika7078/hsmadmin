"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Settings,
  Building2,
  ShieldCheck,
  Bell,
  Lock,
  Save,
  Camera,
  Loader2,
  User,
  Mail,
  Phone,
  KeyRound
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { societyApi, Society } from "@/services/modules/society";
import { authApi } from "@/services/modules/auth";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

type SettingTab = "profile" | "society" | "security" | "notifications";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const isCommittee = user?.role === "committee";
  
  const [activeTab, setActiveTab] = useState<SettingTab>("profile");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [society, setSociety] = useState<Partial<Society> | null>(null);
  const [profile, setProfile] = useState<{name: string, email: string, mobile: string} | null>(null);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const promises = [authApi.getProfile()];
      if (isCommittee) {
        promises.push(societyApi.getDetails());
      }
      
      const results = await Promise.all(promises) as any[];
      
      if (results[0].success) {
        setProfile(results[0].data);
      }
      
      if (isCommittee && results[1]?.success) {
        setSociety(results[1].data);
      }
    } catch (error) {
      toast.error("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setIsSaving(true);
      const res: any = await authApi.updateProfile({ 
        name: profile.name, 
        email: profile.email 
      });
      if (res.success) {
        toast.success("Profile updated successfully");
        // Update local store if needed, but for now just refresh
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSociety = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!society) return;

    try {
      setIsSaving(true);
      const res: any = await societyApi.updateDetails(society);
      if (res.success) {
        toast.success("Society settings updated");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to update society settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setIsSaving(true);
      const res: any = await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.success) {
        toast.success("Password changed successfully");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    ...(isCommittee ? [{ id: "society", label: "Society Settings", icon: Building2 }] : []),
    { id: "security", label: "Account Security", icon: ShieldCheck },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  if (loading && !profile) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-2xl">
            <Settings className="w-8 h-8 text-slate-600" />
          </div>
          Settings
        </h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and society settings.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-72 shrink-0">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-soft p-3 space-y-1 sticky top-24">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingTab)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all group",
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden"
              >
                <div className="p-8 border-b border-slate-50">
                  <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                  <p className="text-sm text-slate-400 font-medium">Update your profile details and contact info.</p>
                </div>

                <form onSubmit={handleUpdateProfile}>
                  <div className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                         <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              required
                              value={profile?.name || ""}
                              onChange={(e) => setProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                              className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            />
                         </div>
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Mobile Number</label>
                         <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              disabled
                              value={profile?.mobile || ""}
                              className="w-full pl-12 pr-5 py-4 bg-slate-100/50 border-none rounded-2xl text-sm font-bold text-slate-500 cursor-not-allowed outline-none"
                            />
                         </div>
                         <p className="text-[10px] text-slate-400 ml-1">Mobile number cannot be changed. Contact admin for updates.</p>
                       </div>
                       <div className="md:col-span-2 space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                         <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="email"
                              value={profile?.email || ""}
                              onChange={(e) => setProfile(prev => prev ? {...prev, email: e.target.value} : null)}
                              className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            />
                         </div>
                       </div>
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex justify-end gap-3">
                    <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-[1.5rem] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save Personal Info
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === "society" && isCommittee && (
              <motion.div
                key="society-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden"
              >
                <div className="p-8 border-b border-slate-50">
                  <h3 className="text-xl font-bold text-slate-900">Society Settings</h3>
                  <p className="text-sm text-slate-400 font-medium">Public details for resident apps and billings.</p>
                </div>

                <form onSubmit={handleUpdateSociety}>
                  <div className="p-10 space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Society Name</label>
                          <input
                            type="text"
                            value={society?.name || ""}
                            onChange={(e) => setSociety(prev => prev ? {...prev, name: e.target.value} : null)}
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Registration ID</label>
                          <input
                            type="text"
                            value={society?.registration_number || ""}
                            onChange={(e) => setSociety(prev => prev ? {...prev, registration_number: e.target.value} : null)}
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none font-mono"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Address</label>
                          <textarea
                            rows={3}
                            value={society?.address || ""}
                            onChange={(e) => setSociety(prev => prev ? {...prev, address: e.target.value} : null)}
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                          />
                        </div>
                     </div>
                  </div>
                  <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex justify-end">
                    <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold shadow-lg shadow-slate-900/10 hover:scale-[1.02] transition-all disabled:opacity-50">
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Building2 className="w-5 h-5" />}
                      Update Society Info
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
                  <div className="p-8 border-b border-slate-50">
                    <h3 className="text-xl font-bold text-slate-900">Change Password</h3>
                    <p className="text-sm text-slate-400 font-medium">Keep your account secure with a strong password.</p>
                  </div>

                  <form onSubmit={handleChangePassword}>
                    <div className="p-10 space-y-6">
                       <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Current Password</label>
                         <div className="relative">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="password"
                              required
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                              className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            />
                         </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">New Password</label>
                            <input
                              type="password"
                              required
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Confirm Password</label>
                            <input
                              type="password"
                              required
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            />
                          </div>
                       </div>
                    </div>
                    <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex justify-end">
                      <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-10 py-4 bg-rose-500 text-white rounded-[1.5rem] font-bold shadow-lg shadow-rose-500/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                key="notif-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft p-8 space-y-8"
              >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Notification Preferences</h3>
                      <p className="text-sm text-slate-400 font-medium">Control how you stay updated.</p>
                    </div>
                    <Bell className="w-8 h-8 text-primary" />
                  </div>

                  <div className="space-y-4">
                    {[
                      { title: "Push Notifications", desc: "Instantly alerts for visits and notices", active: true },
                      { title: "Email Notifications", desc: "Monthly receipts and deep-dive reports", active: false },
                      { title: "Critical Alerts", desc: "Security breaches or fire drills", active: true },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] transition-all group">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                              <Bell className="w-6 h-6" />
                           </div>
                           <div>
                              <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                              <p className="text-xs text-slate-400 font-medium mt-0.5">{item.desc}</p>
                           </div>
                        </div>
                        <div className={cn(
                          "w-12 h-6 rounded-full p-1 cursor-pointer transition-all",
                          item.active ? "bg-primary" : "bg-slate-300"
                        )}>
                          <div className={cn(
                            "w-4 h-4 rounded-full bg-white shadow-sm transition-all transform",
                            item.active ? "translate-x-6" : "translate-x-0"
                          )} />
                        </div>
                      </div>
                    ))}
                  </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
