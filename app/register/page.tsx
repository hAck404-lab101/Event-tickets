"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Loader2, Smartphone, User, Lock, Ticket, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { OtpInput } from "@/components/ui/OtpInput";
import { formatPhoneNumber } from "@/lib/utils";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "organizer">("user");
  const [otp, setOtp] = useState("");
  
  const [step, setStep] = useState<"details" | "otp">("details");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();
  const [checkingPhone, setCheckingPhone] = useState(false);

  const checkPhoneExists = async () => {
    if (phone.length < 9) return;
    const formattedPhone = formatPhoneNumber(phone);
    setCheckingPhone(true);
    try {
      const res = await fetch("/api/auth/check-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone }),
      });
      const data = await res.json();
      if (data.exists) {
        setErrorMessage("Phone number is already registered. Please log in.");
        toast.error("Phone number is already registered. Please log in.");
      } else {
        setErrorMessage(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingPhone(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkPhoneExists();
    }, 500);
    return () => clearTimeout(timer);
  }, [phone]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    
    const formattedPhone = formatPhoneNumber(phone);
    
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, mode: "register" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send SMS code.");
      
      setStep("otp");
      toast.success(`Verification code sent to ${phone}`);
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || "Failed to send SMS code. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e?: React.FormEvent, codeToVerify?: string) => {
    if (e) e.preventDefault();
    const targetOtp = codeToVerify || otp;
    if (!targetOtp || targetOtp.length < 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    
    const formattedPhone = formatPhoneNumber(phone);

    try {
      // 1. Verify OTP and Register user securely via API
      const res = await fetch("/api/auth/verify-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formattedPhone,
          email: email.trim(),
          otp: targetOtp,
          password,
          name: name.trim(),
          role
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed. Please check your details and try again.");
      }

      // 2. Log in securely with email or phone
      let loginRes = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (loginRes.error) {
        loginRes = await supabase.auth.signInWithPassword({
          phone: formattedPhone,
          password: password,
        });
      }

      if (loginRes.error) {
        throw new Error(loginRes.error.message || "Account created, but auto login failed. Please go to the login page.");
      }

      toast.success("Account created successfully!");
      if (role === "organizer") {
        router.push("/organizer/dashboard");
      } else {
        router.push("/account");
      }
      router.refresh();
    } catch (err: any) {
      console.error("Verification error:", err);
      const msg = typeof err === "string" ? err : err?.message || "Verification failed. Please check your code and try again.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-4 sm:p-8">
      <Link href="/" className="absolute top-6 left-6 text-2xl font-bold font-serif text-primary">Tixly</Link>
      
      <div className="w-full max-w-md bg-surface p-6 sm:p-8 rounded-3xl border border-border shadow-xl mt-12 sm:mt-0">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">
            {step === "details" ? "Create an account" : "Verify your number"}
          </h1>
          <p className="text-muted text-sm">
            {step === "details" 
              ? "Join Tixly to buy tickets or host events." 
              : `We sent a 6-digit code to ${phone}`}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-2xl flex items-start gap-3 text-red-300 text-sm animate-in fade-in duration-200">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
            <div className="flex-1 font-medium">{errorMessage}</div>
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
              <label htmlFor="email" className="text-sm font-bold text-primary block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Mail size={20} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
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
              disabled={loading || checkingPhone || !phone || !password || !name || !email}
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
                loading={loading}
                onResend={() => handleSendOtp()}
              />
            </div>

            <div className="text-center mt-4 pt-4 border-t border-border">
              <button 
                type="button" 
                onClick={() => {
                  setStep("details");
                  setErrorMessage(null);
                }}
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
