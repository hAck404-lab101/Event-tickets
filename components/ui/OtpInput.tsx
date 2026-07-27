"use client";

import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { Loader2 } from 'lucide-react';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  error?: string | null;
  loading?: boolean;
  onResend?: () => void;
}

export function OtpInput({ 
  length = 6, 
  onComplete, 
  error, 
  loading,
  onResend 
}: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const [activeInput, setActiveInput] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(30);
  const [shake, setShake] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle error shake and success glow
  useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Restore focus after loading state changes from true to false
  const [wasLoading, setWasLoading] = useState(false);
  useEffect(() => {
    if (loading) {
      setWasLoading(true);
    } else if (wasLoading) {
      setWasLoading(false);
      // Small timeout to ensure DOM is ready and not disabled
      setTimeout(() => {
         inputRefs.current[activeInput]?.focus();
      }, 50);
    }
  }, [loading, activeInput, wasLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Allow only one character per box
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < length - 1) {
      setActiveInput(index + 1);
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify if all fields are filled
    const otpValue = newOtp.join('');
    if (otpValue.length === length) {
      // Small timeout to allow the last digit to render
      setTimeout(() => {
        if (!error) {
          onComplete(otpValue);
        }
      }, 50);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      
      // Auto focus previous input
      if (index > 0) {
        setActiveInput(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      setActiveInput(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      setActiveInput(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length);
    if (!/^\d+$/.test(pastedData)) return; // Ensure only numbers

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus on the next empty box or the last one
    const nextIndex = Math.min(pastedData.length, length - 1);
    setActiveInput(nextIndex);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === length) {
       setTimeout(() => onComplete(pastedData), 50);
    }
  };
  
  const handleResendClick = () => {
      if (onResend && countdown === 0) {
          setOtp(new Array(length).fill(""));
          setActiveInput(0);
          inputRefs.current[0]?.focus();
          setCountdown(30);
          onResend();
      }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        className={`flex justify-between gap-2 sm:gap-3 w-full mb-6 ${shake ? 'animate-shake' : ''}`}
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={() => setActiveInput(index)}
            disabled={loading}
            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 outline-none transition-all duration-200
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              ${error ? 'border-error text-error bg-error-bg/30' : ''}
              ${!error && digit && !loading ? 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)] text-green-600' : ''}
              ${activeInput === index && !error && !digit ? 'border-primary ring-2 ring-primary/30' : ''}
              ${!error && !digit && activeInput !== index ? 'border-border bg-background' : ''}
            `}
          />
        ))}
      </div>
      
      {loading && (
          <div className="flex items-center text-primary mb-4 font-bold text-sm gap-2">
              <Loader2 size={16} className="animate-spin" /> Verifying...
          </div>
      )}

      {onResend && (
        <div className="text-center text-sm font-medium mt-2">
          {countdown > 0 ? (
            <p className="text-muted">
              Resend code in <span className="text-primary font-bold">{countdown}s</span>
            </p>
          ) : (
            <button 
              type="button" 
              onClick={handleResendClick}
              disabled={loading}
              className="text-primary font-bold hover:underline"
            >
              Resend Code
            </button>
          )}
        </div>
      )}
    </div>
  );
}
