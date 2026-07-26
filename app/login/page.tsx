"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Loader2, KeyRound, Smartphone } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Format Ghanaian phone numbers (e.g., 054... -> +23354...)
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith("0") && formattedPhone.length === 10) {
      formattedPhone = `+233${formattedPhone.substring(1)}`;
    } else if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+${formattedPhone}`;
    }
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send SMS code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
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
      const { error, data } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "sms",
      });

      if (error) throw error;

      if (data.session) {
        // Successfully logged in
        router.push("/account");
        router.refresh(); // Refresh layout to grab new session
      }
    } catch (err: any) {
      setError(err.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="absolute top-8 left-8 text-2xl font-bold font-serif">Tixly</Link>
      
      <div className="w-full max-w-md bg-surface p-8 rounded-3xl border border-border shadow-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">
            {step === "phone" ? "Welcome back" : "Verify your number"}
          </h1>
          <p className="text-muted text-sm">
            {step === "phone" 
              ? "Enter your phone number to securely log in or create a new account." 
              : `We sent a 6-digit code to ${phone}`}
          </p>
        </div>

        {error && (
          <div className="bg-error-bg text-error text-sm px-4 py-3 rounded-lg mb-6 font-medium">
            {error}
          </div>
        )}

        {step === "phone" ? (
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
              className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-bold text-primary block">6-Digit Code</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <KeyRound size={20} />
                </div>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-primary font-bold text-center tracking-[0.5em]"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                "Verify & Login"
              )}
            </button>

            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => setStep("phone")}
                className="text-sm font-bold text-muted hover:text-primary transition-colors"
              >
                Change phone number
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
