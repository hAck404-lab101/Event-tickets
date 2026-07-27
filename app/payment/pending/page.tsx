"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function PaymentPendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const orderId = searchParams.get("orderId");

  const [status, setStatus] = useState<"pending" | "paid" | "failed" | "timeout">("pending");
  const [checks, setChecks] = useState(0);
  const [dots, setDots] = useState(".");

  const supabase = createClient();

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 600);
    return () => clearInterval(dotInterval);
  }, []);

  useEffect(() => {
    if (!reference && !orderId) return;

    const checkStatus = async () => {
      const query = supabase.from("orders").select("payment_status, id");
      if (reference) query.eq("reference", reference);
      else if (orderId) query.eq("id", orderId);

      const { data } = await query.single();

      if (data?.payment_status === "paid") {
        setStatus("paid");
        setTimeout(() => {
          router.push(`/payment/success?reference=${reference || ""}&orderId=${data.id}`);
        }, 1500);
      } else if (data?.payment_status === "failed" || data?.payment_status === "cancelled") {
        setStatus("failed");
        setTimeout(() => {
          router.push(`/payment/failed?reference=${reference || ""}`);
        }, 1500);
      }

      setChecks((c) => {
        if (c >= 24) {
          // 24 checks × 5s = 2 minutes
          setStatus("timeout");
        }
        return c + 1;
      });
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [reference, orderId, router, supabase]);

  return (
    <div className="max-w-md w-full text-center">
      {status === "pending" && (
        <>
          <div className="w-24 h-24 bg-yellow-900/30 border-2 border-yellow-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={48} className="text-yellow-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-3">
            Processing Payment{dots}
          </h1>
          <p className="text-muted text-lg mb-6">
            Please do not close this page. We're waiting for your payment confirmation.
          </p>
          {reference && (
            <div className="bg-surface border border-border rounded-xl p-4 mb-6 inline-block">
              <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Reference</p>
              <p className="font-mono font-bold text-primary">{reference}</p>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-muted text-sm">
            <Loader2 size={16} className="animate-spin" />
            <span>Checking payment status{dots}</span>
          </div>
          {checks > 6 && (
            <div className="mt-8 bg-surface border border-border rounded-2xl p-6">
              <p className="text-muted text-sm">
                Payment is taking longer than usual. If you've completed the payment on your phone, please wait a moment while we confirm it.
              </p>
            </div>
          )}
        </>
      )}

      {status === "paid" && (
        <>
          <div className="w-24 h-24 bg-green-900/30 border-2 border-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-3">Payment Confirmed!</h1>
          <p className="text-muted">Redirecting you to your tickets{dots}</p>
        </>
      )}

      {status === "timeout" && (
        <>
          <div className="w-24 h-24 bg-yellow-900/30 border-2 border-yellow-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={48} className="text-yellow-500" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-3">Still Processing</h1>
          <p className="text-muted mb-8">
            Your payment is still being processed. This can sometimes take a few minutes. Check your orders for the latest status.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/account/orders"
              className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-center hover:bg-accent transition-colors"
            >
              Check My Orders
            </Link>
            <Link
              href="/events/explore"
              className="flex-1 bg-surface border border-border py-4 rounded-xl font-bold text-primary text-center hover:border-primary transition-colors"
            >
              Browse Events
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-20">
      <Suspense fallback={
        <div className="flex items-center gap-2 text-muted text-sm">
          <Loader2 size={16} className="animate-spin text-primary" />
          <span>Loading payment details...</span>
        </div>
      }>
        <PaymentPendingContent />
      </Suspense>
    </main>
  );
}
