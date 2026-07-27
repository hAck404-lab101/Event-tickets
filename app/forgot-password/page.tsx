"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, KeyRound, Smartphone, Lock } from "lucide-react";
import Link from "next/link";
import { OtpInput } from "@/components/ui/OtpInput";
import { formatPhoneNumber } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formattedPhone = formatPhoneNumber(phone);
    
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, mode: "login" }), // We use 'login' mode so it checks that the user exists
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send SMS code. Please try again.");
      
      setStep("verify");
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const formattedPhone = formatPhoneNumber(phone);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, otp, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password. Please check your code and try again.");

      setSuccess(true);
      // Wait a moment then redirect to login
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      let msg = err.message || "Failed to reset password. Please try again.";
      if (typeof msg === 'string' && (msg === "{}" || msg.trim() === "")) {
        msg = "Failed to reset password. Please try again.";
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
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock size={32} />
            </div>
            <h1 className="text-3xl font-serif font-bold text-primary mb-4">Password Reset!</h1>
            <p className="text-muted font-medium mb-8">
              Your password has been successfully updated. Redirecting you to login...
            </p>
            <Loader2 size={24} className="animate-spin mx-auto text-primary" />
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-serif font-bold text-primary mb-2">
                {step === "request" ? "Reset Password" : "Enter Code & New Password"}
              </h1>
              <p className="text-muted text-sm">
                {step === "request" 
                  ? "Enter your phone number to receive a reset code." 
                  : `We sent a 6-digit code to ${phone}. Enter it below along with your new password.`}
              </p>
            </div>

            {error && (
              <div className="bg-error-bg text-error text-sm px-4 py-3 rounded-lg mb-6 font-medium">
                {error}
              </div>
            )}

            {step === "request" && (
              <form onSubmit={handleSendOtp} className="space-y-6">
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
                
                <button
                  type="submit"
                  disabled={loading || !phone}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      Send Reset Code <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {step === "verify" && (
              <div className="space-y-6">
                <div className="space-y-2 mb-8">
                  <label className="text-sm font-bold text-primary block text-center mb-4">6-Digit Code</label>
                  <OtpInput 
                    length={6} 
                    onComplete={(code) => {
                      setOtp(code);
                    }} 
                    error={error} 
                    loading={loading}
                    onResend={() => handleSendOtp()}
                  />
                </div>

                <form onSubmit={handleResetPassword} className="space-y-6 pt-6 border-t border-border">
                  <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-bold text-primary block">New Password</label>
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

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-bold text-primary block">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                      <Lock size={20} />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-primary font-medium"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6 || !password || !confirmPassword}
                  className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    "Reset Password"
                  )}
                </button>

                <div className="text-center mt-4">
                  <button 
                    type="button" 
                    onClick={() => { setStep("request"); setError(null); }}
                    className="text-sm font-bold text-muted hover:text-primary transition-colors"
                  >
                    Change phone number
                  </button>
                </div>
              </form>
            </div>
            )}

            <div className="mt-8 text-center border-t border-border pt-6">
              <Link href="/login" className="text-sm font-bold text-muted hover:text-primary transition-colors">
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
