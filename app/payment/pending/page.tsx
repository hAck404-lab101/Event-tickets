"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Loader2, CheckCircle2, Smartphone, ShieldCheck, ExternalLink, RefreshCw, Copy, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { toast } from "sonner";

function PaymentPendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const orderId = searchParams.get("orderId");

  const [status, setStatus] = useState<"pending" | "paid" | "failed" | "timeout">("pending");
  const [order, setOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dots, setDots] = useState(".");

  const supabase = createClient();

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 600);
    return () => clearInterval(dotInterval);
  }, []);

  // Fetch Order details
  useEffect(() => {
    if (!reference && !orderId) return;

    const fetchOrder = async () => {
      const query = supabase
        .from("orders")
        .select(`
          *,
          events(title, banner_url, city, starts_at)
        `);

      if (reference) query.eq("reference", reference);
      else if (orderId) query.eq("id", orderId);

      const { data } = await query.maybeSingle();

      if (data) {
        setOrder(data);
        if (data.payment_status === "paid") {
          setStatus("paid");
          setTimeout(() => {
            router.push(`/payment/success?reference=${reference || data.reference}&orderId=${data.id}`);
          }, 1200);
        } else if (data.payment_status === "failed" || data.payment_status === "cancelled") {
          setStatus("failed");
        }
      }
      setLoadingOrder(false);
    };

    fetchOrder();
  }, [reference, orderId, supabase, router]);

  // Status Polling Loop
  useEffect(() => {
    if (!reference && !orderId) return;

    const checkStatus = async () => {
      const query = supabase.from("orders").select("payment_status, id, reference");
      if (reference) query.eq("reference", reference);
      else if (orderId) query.eq("id", orderId);

      const { data } = await query.maybeSingle();

      if (data?.payment_status === "paid") {
        setStatus("paid");
        toast.success("Payment confirmed!");
        setTimeout(() => {
          router.push(`/payment/success?reference=${data.reference}&orderId=${data.id}`);
        }, 1200);
      } else if (data?.payment_status === "failed" || data?.payment_status === "cancelled") {
        setStatus("failed");
      }
    };

    const interval = setInterval(checkStatus, 4000);
    return () => clearInterval(interval);
  }, [reference, orderId, supabase, router]);

  // Manually trigger Sandbox / Test completion
  const handleSimulatePayment = async () => {
    if (!order) return;
    setVerifying(true);

    try {
      const res = await fetch("/api/webhooks/doronx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: order.reference,
          status: "paid",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to confirm payment");

      setStatus("paid");
      toast.success("Payment verified successfully!");
      setTimeout(() => {
        router.push(`/payment/success?reference=${order.reference}&orderId=${order.id}`);
      }, 1200);
    } catch (err: any) {
      toast.error(err.message || "Could not verify payment yet.");
    } finally {
      setVerifying(false);
    }
  };

  const copyReference = () => {
    if (!reference && !order?.reference) return;
    navigator.clipboard.writeText(reference || order?.reference || "");
    setCopied(true);
    toast.success("Reference copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-lg w-full">
      {status === "pending" && (
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-300">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-yellow-900/30 border-2 border-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={40} className="text-yellow-500 animate-pulse" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-primary">
              Processing Payment{dots}
            </h1>
            <p className="text-muted text-sm max-w-sm mx-auto">
              Follow the instructions below to complete your transaction.
            </p>
          </div>

          {/* Reference Card */}
          <div className="bg-background border border-border rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted font-bold uppercase tracking-wider">Payment Reference</p>
              <p className="font-mono font-bold text-lg text-primary">{reference || order?.reference || "Loading..."}</p>
            </div>
            <button
              onClick={copyReference}
              className="p-2 bg-surface border border-border rounded-xl text-primary hover:border-primary transition-colors"
              title="Copy Reference"
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            </button>
          </div>

          {/* Order Details */}
          {order && (
            <div className="bg-surface-elevated border border-border rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>Event</span>
                <strong className="text-primary font-bold">{order.events?.title || "Event Ticket"}</strong>
              </div>
              <div className="flex justify-between text-muted">
                <span>Customer</span>
                <strong className="text-primary font-bold">{order.customer_name} ({order.customer_phone})</strong>
              </div>
              <div className="flex justify-between text-muted pt-2 border-t border-border">
                <span className="font-bold text-primary">Total Amount</span>
                <strong className="text-lg font-serif text-primary font-bold">₵{Number(order.total).toFixed(2)}</strong>
              </div>
            </div>
          )}

          {/* MoMo Payment Instructions */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3 text-left">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Smartphone size={18} className="text-accent" />
              <span>Mobile Money Payment Instructions</span>
            </div>
            <ol className="text-xs text-muted space-y-2 list-decimal pl-4 leading-relaxed font-medium">
              <li>Check your phone (<strong>{order?.customer_phone || "your mobile number"}</strong>) for an authorization prompt.</li>
              <li>Enter your Mobile Money PIN to approve the payment of <strong>₵{order?.total ? Number(order.total).toFixed(2) : "0.00"}</strong>.</li>
              <li>If you didn't receive a prompt, dial <strong>*170#</strong> (MTN) or <strong>*110#</strong> (Telecel/AirtelTigo), go to <em>My Wallet &gt; Approvals</em>, and approve the pending transaction.</li>
            </ol>
          </div>

          {/* Polling Indicator */}
          <div className="flex items-center justify-center gap-2 text-muted text-xs font-medium">
            <Loader2 size={14} className="animate-spin text-primary" />
            <span>Checking live payment confirmation automatically{dots}</span>
          </div>

          {/* Manual Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleSimulatePayment}
              disabled={verifying}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} /> Confirm Payment / I Have Approved
                </>
              )}
            </button>

            <Link
              href="/account/orders"
              className="w-full bg-background border border-border text-primary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:border-primary transition-colors block text-center"
            >
              Check My Orders Page
            </Link>
          </div>
        </div>
      )}

      {status === "paid" && (
        <div className="bg-surface border border-border rounded-3xl p-8 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-900/30 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={44} className="text-green-400" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary">Payment Confirmed!</h1>
          <p className="text-muted text-sm">Your order has been paid. Generating your tickets now...</p>
          <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm pt-2">
            <Loader2 size={16} className="animate-spin" />
            <span>Redirecting to your tickets...</span>
          </div>
        </div>
      )}

      {status === "failed" && (
        <div className="bg-surface border border-border rounded-3xl p-8 shadow-2xl text-center space-y-4">
          <h1 className="text-2xl font-serif font-bold text-red-400">Payment Unsuccessful</h1>
          <p className="text-muted text-sm">
            We could not verify your payment for reference <strong className="font-mono text-primary">{reference}</strong>.
          </p>
          <div className="flex gap-3 pt-4">
            <Link href="/events/explore" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm">
              Try Again
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <Suspense fallback={
        <div className="flex items-center gap-2 text-muted text-sm">
          <Loader2 size={18} className="animate-spin text-primary" />
          <span>Loading payment details...</span>
        </div>
      }>
        <PaymentPendingContent />
      </Suspense>
    </main>
  );
}
