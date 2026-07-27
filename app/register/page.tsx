"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Loader2, KeyRound, Smartphone, User, Lock, Ticket } from "lucide-react";
import Link from "next/link";
import { OtpInput } from "@/components/ui/OtpInput";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "organizer">("user");
  const [otp, setOtp] = useState("");
  
  const [step, setStep] = useState<"details" | "otp">("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();
  const [checkingPhone, setCheckingPhone] = useState(false);

  useEffect(() => {
    const checkPhoneExists = async () => {
      if (phone.length < 9) {
        if (error === "Phone number is already registered. Please log in.") {
          setError(null);
        }
        return;
      }
      
      let formattedPhone = phone.trim();
      if (formattedPhone.startsWith("0") && formattedPhone.length === 10) {
        formattedPhone = `+233${formattedPhone.substring(1)}`;
      } else if (!formattedPhone.startsWith("+")) {
        formattedPhone = `+${formattedPhone}`;
      }

      setCheckingPhone(true);
      try {
        const res = await fetch("/api/auth/check-phone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: formattedPhone }),
        });
        const data = await res.json();
        if (data.exists) {
          setError("Phone number is already registered. Please log in.");
        } else {
          if (error === "Phone number is already registered. Please log in.") {
            setError(null);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCheckingPhone(false);
      }
    };

    const timer = setTimeout(() => {
      checkPhoneExists();
    }, 500);

    return () => clearTimeout(timer);
  }, [phone]);

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
        body: JSON.stringify({ phone: formattedPhone, mode: "register" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send SMS code.");
      
      setStep("otp");
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

  const handleVerifyAndRegister = async (e?: React.FormEvent, codeToVerify?: string) => {
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
      // 1. Verify OTP and Register user securely via API
      const res = await fetch("/api/auth/verify-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, otp: codeToVerify || otp, password, name, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code. Please try again.");

      // 2. Log in securely with the newly created password
      const { error, data: sessionData } = await supabase.auth.signInWithPassword({
        phone: formattedPhone,
        password: password,
      });

      if (error) throw error;

      if (sessionData.session) {
        if (role === "organizer") {
           router.push("/organizer/dashboard");
        } else {
           router.push("/account");
        }
        router.refresh();
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      let msg = err.message || "Invalid code. Please try again.";
      if (typeof msg === 'string' && (msg === "{}" || msg.trim() === "")) {
        msg = "Invalid code or user already exists. Please try again.";
      } else if (typeof msg === 'object') {
        msg = JSON.stringify(msg);
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
            {step === "details" ? "Create an account" : "Verify your number"}
          </h1>
          <p className="text-muted text-sm">
            {step === "details" 
              ? "Join Tixly to buy tickets or host events." 
              : `We sent a 6-digit code to ${phone}`}
          </p>
        </div>

        {error && (
          <div className="bg-error-bg text-error text-sm px-4 py-3 rounded-lg mb-6 font-medium">
            {error}
          </div>
        )}

        {step === "details" ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            {/* Account Type Selector */}
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`flex-1 py-3 rounded-xl border font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                  role === "user" ? "border-primary bg-primary/5 text-primary ring-1 ring-primary" : "border-border text-muted hover:border-primary/50"
                }`}
              >
                <Ticket size={24} />
                <span className="text-sm">Ticket Buyer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("organizer")}
                className={`flex-1 py-3 rounded-xl border font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                  role === "organizer" ? "border-accent bg-accent/5 text-accent ring-1 ring-accent" : "border-border text-muted hover:border-accent/50"
                }`}
              >
                <User size={24} />
                <span className="text-sm">Event Organizer</span>
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-bold text-primary block">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <User size={20} />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-primary font-medium"
                  required
                />
              </div>
            </div>

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
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-primary font-medium"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || checkingPhone || !phone || !password || !name || error === "Phone number is already registered. Please log in."}
              className={`w-full text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group mt-4 ${role === 'organizer' ? 'bg-accent hover:bg-opacity-90' : 'bg-primary hover:bg-opacity-90'}`}
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Verify Phone <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister} className="space-y-6">
            <div className="space-y-6">
              <label className="text-sm font-bold text-primary block text-center mb-4">6-Digit Code</label>
              <OtpInput 
                length={6} 
                onComplete={(code) => {
                  setOtp(code);
                  handleVerifyAndRegister(undefined, code);
                }} 
                error={error} 
                loading={loading}
                onResend={() => handleSendOtp()}
              />
            </div>

            <div className="text-center mt-4 pt-4 border-t border-border">
              <button 
                type="button" 
                onClick={() => setStep("details")}
                className="text-sm font-bold text-muted hover:text-primary transition-colors"
              >
                Go back
              </button>
            </div>
          </form>
        )}

        {step === "details" && (
          <div className="mt-8 text-center border-t border-border pt-6">
            <p className="text-muted text-sm font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
