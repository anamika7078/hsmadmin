"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Lock, Phone, ShieldCheck, ArrowRight } from "lucide-react";
import { authApi } from "@/services/modules/auth";
import { useAuthStore } from "@/store/authStore";

const mobileSchema = z.object({
  mobile: z.string().min(10, "Enter valid mobile number"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [loading, setLoading] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);
  const [mobile, setMobile] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [devOtp, setDevOtp] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof mobileSchema>>({
    resolver: zodResolver(mobileSchema),
  });

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    setValue: setOtpValue,
    formState: { errors: otpErrors },
  } = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
  });

  const onSendOtp = async (data: z.infer<typeof mobileSchema>) => {
    setLoading(true);
    setErrorMsg(null);
    setMessage(null);
    setDevOtp(null);
    try {
      const response = await authApi.sendOTP(data.mobile);
      setMobile(data.mobile);
      setOtpSent(true);
      setMessage("OTP sent successfully");
      if (response?.data?.otp) {
        setDevOtp(response.data.otp);
        setOtpValue("otp", response.data.otp);
        window.alert(`Development OTP: ${response.data.otp}`);
      }
    } catch (error) {
      setErrorMsg("Could not send OTP. Please verify mobile number.");
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (data: z.infer<typeof otpSchema>) => {
    setLoading(true);
    setErrorMsg(null);
    setMessage(null);
    try {
      const response = await authApi.verifyOTP(mobile, data.otp);
      login(response.data.token, response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      router.push("/dashboard");
    } catch (error) {
      setErrorMsg("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-orange-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 mb-4 animate-bounce">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">SocietyConnect</h1>
          <p className="text-slate-500 mt-2">Manage your society with ease</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-xl shadow-slate-200/50">
          <h2 className="text-xl font-semibold mb-6">{otpSent ? "Verify OTP" : "Login with OTP"}</h2>

          {!otpSent ? (
            <form onSubmit={handleSubmit(onSendOtp)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Mobile Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    {...register("mobile")}
                    type="text"
                    placeholder="9999999999"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
                {errors.mobile && <p className="mt-1 text-xs text-red-500 ml-1">{errors.mobile.message}</p>}
              </div>
              {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
              {message && <p className="text-xs text-emerald-600">{message}</p>}
              <button
                disabled={loading}
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send OTP <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit(onVerifyOtp)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">One Time Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <input
                    {...registerOtp("otp")}
                    type="text"
                    placeholder="123456"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
                {otpErrors.otp && <p className="mt-1 text-xs text-red-500 ml-1">{otpErrors.otp.message}</p>}
                <p className="mt-2 text-xs text-slate-500">OTP sent to {mobile}</p>
                {devOtp && (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-semibold text-emerald-700">
                      Development OTP: {devOtp}
                    </p>
                    <p className="text-[11px] text-emerald-600">
                      Auto-filled for quick login in development mode.
                    </p>
                  </div>
                )}
              </div>
              {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
              <button
                disabled={loading}
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Verify OTP <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
