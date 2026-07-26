"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Loader2, KeyRound, Smartphone, Lock } from "lucide-react";
import Link from "next/link";
import { OtpInput } from "@/components/ui/OtpInput";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const [authMode, setAuthMode] = useState<"password" | "otp_request" | "otp_verify">("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith("0") && formattedPhone.length === 10) {
      formattedPhone = `+233${formattedPhone.substring(1)}`;
    } else if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+${formattedPhone}`;
    }
    
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        phone: formattedPhone,
        password: password
      });

      if (error) throw error;

      if (data.session) {
        // We need to check if user is organizer to route them correctly
        // Since user_metadata contains the role from our register flow
        const role = data.user?.user_metadata?.role || 'user';
        if (role === 'organizer') {
          router.push("/organizer/dashboard");
        } else {
          router.push("/account");
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith("0") && formattedPhone.length === 10) {
      formattedPhone = `+233${formattedPhone.substring(1)}`;
    } else if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+${formattedPhone}`;
    }
    
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, mode: "login" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send SMS code. Please try again.");
      
      setAuthMode("otp_verify");
    } catch (err: any) {
      let msg = err.message || "Failed to send SMS code. Please try again.";
      if (typeof msg === 'string' && (msg === "{}" || msg.trim() === "")) {
        msg = "Failed to send SMS code. Please try again.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent, codeToVerify?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith("0") && formattedPhone.length === 10) {
      formattedPhone = `+233${formattedPhone.substring(1)}`;
    } else if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+${formattedPhone}`;
    }

    try {
      // 1. Verify OTP via our custom endpoint (this resets their password dynamically)
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, otp: codeToVerify || otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code. Please try again.");

      // 2. Log in securely using the temporary password
      const { error, data: sessionData } = await supabase.auth.signInWithPassword({
        phone: formattedPhone,
        password: data.password,
      });

      if (error) throw error;

      if (sessionData.session) {
        const role = sessionData.user?.user_metadata?.role || 'user';
        if (role === 'organizer') {
          router.push("/organizer/dashboard");
        } else {
          router.push("/account");
        }
        router.refresh();
      }
    } catch (err: any) {
      let msg = err.message || "Invalid code. Please try again.";
      if (typeof msg === 'string' && (msg === "{}" || msg.trim() === "")) {
        msg = "Invalid code. Please try again.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="absolute top-8 left-8 text-2xl font-bold font-serif">Tixly</Link>
      
      <div className="w-full max-w-md bg-surface p-8 rounded-3xl border border-border shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">
            {authMode === "password" ? "Welcome back" : authMode === "otp_request" ? "Login with Code" : "Verify your number"}
          </h1>
          <p className="text-muted text-sm">
            {authMode === "password" 
              ? "Enter your credentials to access your account." 
              : authMode === "otp_request"
              ? "We'll text you a temporary login code."
              : `We sent a 6-digit code to ${phone}`}
          </p>
        </div>

        {error && (
          <div className="bg-error-bg text-error text-sm px-4 py-3 rounded-lg mb-6 font-medium">
            {error}
          </div>
        )}

        {authMode === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-bold text-primary block">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Smartphone size={20} />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+233 24 000 0000"
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-primary font-medium"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-bold text-primary block">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Lock size={20} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-primary font-medium"
                    required
                  />
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || !phone || !password}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Log In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center mt-4 flex flex-col gap-3">
              <Link href="/forgot-password" className="text-sm font-bold text-primary hover:underline">
                Forgot password?
              </Link>
              <button 
                type="button" 
                onClick={() => { setAuthMode("otp_request"); setError(null); }}
                className="text-sm font-bold text-muted hover:text-primary transition-colors"
              >
                Log in with SMS code
              </button>
            </div>
          </form>
        )}

        {authMode === "otp_request" && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="phone_otp" className="text-sm font-bold text-primary block">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Smartphone size={20} />
                </div>
                <input
                  id="phone_otp"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-primary font-medium"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || !phone}
              className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Send Login Code <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => { setAuthMode("password"); setError(null); }}
                className="text-sm font-bold text-muted hover:text-primary transition-colors"
              >
                Go back to password login
              </button>
            </div>
          </form>
        )}

        {authMode === "otp_verify" && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-6">
              <label className="text-sm font-bold text-primary block text-center mb-4">6-Digit Code</label>
              <OtpInput 
                length={6} 
                onComplete={(code) => {
                  setOtp(code);
                  handleVerifyOtp(undefined, code);
                }} 
                error={error} 
                loading={loading}
                onResend={() => handleSendOtp()}
              />
            </div>

            <div className="text-center mt-4 pt-4 border-t border-border">
              <button 
                type="button" 
                onClick={() => { setAuthMode("otp_request"); setError(null); }}
                className="text-sm font-bold text-muted hover:text-primary transition-colors"
              >
                Change phone number
              </button>
            </div>
          </form>
        )}

        {authMode !== "otp_verify" && (
          <div className="mt-8 text-center border-t border-border pt-6">
            <p className="text-muted text-sm font-medium">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary font-bold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
