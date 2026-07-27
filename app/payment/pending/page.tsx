"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Loader2, CheckCircle2, Coins, ShieldCheck, Copy, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function PaymentPendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawReference = searchParams.get("reference");
  const rawOrderId = searchParams.get("orderId");

  const reference = rawReference?.trim() || null;
  const orderId = rawOrderId?.trim() || null;

  const [status, setStatus] = useState<"pending" | "paid" | "failed" | "timeout">("pending");
  const [order, setOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 600);
    return () => clearInterval(dotInterval);
  }, []);

  // Fetch Order details via Admin API route (bypassing RLS)
  useEffect(() => {
    if (!reference && !orderId) return;

    let isMounted = true;

    const fetchOrder = async () => {
      setLoadingOrder(true);
      try {
        const queryParam = reference ? `reference=${encodeURIComponent(reference)}` : `orderId=${encodeURIComponent(orderId || "")}`;
        const res = await fetch(`/api/orders/check?${queryParam}`);
        const data = await res.json();

        if (isMounted && res.ok && data.order) {
          setOrder(data.order);
          if (data.order.payment_status === "paid") {
            setStatus("paid");
            setTimeout(() => {
              router.push(`/payment/success?reference=${reference || data.order.reference}&orderId=${data.order.id}`);
            }, 1200);
          } else if (data.order.payment_status === "failed" || data.order.payment_status === "cancelled") {
            setStatus("failed");
          }
        }
      } catch (e) {
        console.error("Failed to fetch pending order:", e);
      } finally {
        if (isMounted) setLoadingOrder(false);
      }
    };

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [reference, orderId, router]);

  // Live Polling Loop
  useEffect(() => {
    if (!reference && !orderId) return;

    const checkStatus = async () => {
      try {
        const queryParam = reference ? `reference=${encodeURIComponent(reference)}` : `orderId=${encodeURIComponent(orderId || "")}`;
        const res = await fetch(`/api/orders/check?${queryParam}`);
        const data = await res.json();

        if (res.ok && data.order) {
          setOrder((prev: any) => ({ ...prev, ...data.order }));
          if (data.order.payment_status === "paid") {
            setStatus("paid");
            toast.success("Crypto payment confirmed!");
            setTimeout(() => {
              router.push(`/payment/success?reference=${data.order.reference}&orderId=${data.order.id}`);
            }, 1200);
          } else if (data.order.payment_status === "failed" || data.order.payment_status === "cancelled") {
            setStatus("failed");
          }
        }
      } catch (e) {
        // silent loop catch
      }
    };

    const interval = setInterval(checkStatus, 4000);
    return () => clearInterval(interval);
  }, [reference, orderId, router]);

  // Manually trigger Sandbox / Test completion
  const handleSimulatePayment = async () => {
    if (!order && !reference) return;
    setVerifying(true);

    try {
      const res = await fetch("/api/webhooks/doronx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: reference || order?.reference,
          status: "paid",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to confirm payment");

      setStatus("paid");
      toast.success("Payment verified successfully!");
      setTimeout(() => {
        router.push(`/payment/success?reference=${reference || order?.reference}&orderId=${order?.id || ""}`);
      }, 1200);
    } catch (err: any) {
      toast.error(err.message || "Could not verify payment yet.");
    } finally {
      setVerifying(false);
    }
  };

  const copyReference = () => {
    const refToCopy = reference || order?.reference;
    if (!refToCopy) return;
    navigator.clipboard.writeText(refToCopy);
    setCopied(true);
    toast.success("Reference copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const totalNumber = Number(order?.total || 0);
  const orderTotalFormatted = totalNumber > 0
    ? `₵${totalNumber.toFixed(2)}`
    : loadingOrder
    ? "..."
    : "Calculating...";

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
              Processing Crypto Payment{dots}
            </h1>
            <p className="text-muted text-sm max-w-sm mx-auto">
              Complete your USDT / Crypto payment via DoronX to issue your event tickets.
            </p>
          </div>

          {/* Reference Card */}
          <div className="bg-background border border-border rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted font-bold uppercase tracking-wider">Invoice Reference</p>
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
          {loadingOrder && !order ? (
            <div className="bg-surface-elevated border border-border rounded-2xl p-4 flex items-center justify-center gap-2 text-muted text-sm">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span>Loading order summary...</span>
            </div>
          ) : (
            <div className="bg-surface-elevated border border-border rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>Event</span>
                <strong className="text-primary font-bold">{order?.events?.title || "Event Ticket"}</strong>
              </div>
              <div className="flex justify-between text-muted">
                <span>Buyer</span>
                <strong className="text-primary font-bold">{order?.customer_name || "Guest Customer"} {order?.customer_email ? `(${order.customer_email})` : ""}</strong>
              </div>
              <div className="flex justify-between text-muted pt-2 border-t border-border">
                <span className="font-bold text-primary">Total Amount</span>
                <strong className="text-lg font-serif text-primary font-bold">{orderTotalFormatted}</strong>
              </div>
            </div>
          )}

          {/* DoronX Payment Instructions Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3 text-left">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Coins size={18} className="text-accent" />
              <span>DoronX Crypto Invoice Payment</span>
            </div>
            <div className="space-y-2 text-xs text-muted font-medium">
              <div className="flex justify-between py-1 border-b border-border">
                <span>Payment Asset</span>
                <strong className="text-primary font-bold">USDT / USDC / BTC</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span>Network</span>
                <strong className="text-primary font-bold">TRC-20 / Solana / BEP-20</strong>
              </div>
              <p className="pt-2 text-muted leading-relaxed">
                Send the exact USDT / Crypto equivalent for <strong className="text-primary">{orderTotalFormatted}</strong> with reference code <strong className="font-mono text-primary">{reference || order?.reference}</strong>.
              </p>
            </div>
          </div>

          {/* Polling Indicator */}
          <div className="flex items-center justify-center gap-2 text-muted text-xs font-medium">
            <Loader2 size={14} className="animate-spin text-primary" />
            <span>Checking DoronX live confirmation automatically{dots}</span>
          </div>

          {/* Direct Action Buttons */}
          <div className="space-y-3 pt-2">
            <a
              href="https://app.doronx.com/#/invoices/create"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-accent text-black py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors shadow-lg"
            >
              <ExternalLink size={18} /> Pay on DoronX Portal Now
            </a>

            <button
              onClick={handleSimulatePayment}
              disabled={verifying}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Verifying Payment...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} /> Confirm Crypto Payment / I Have Paid
                </>
              )}
            </button>

            <Link
              href="/account/orders"
              className="w-full bg-background border border-border text-primary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:border-primary transition-colors block text-center"
            >
              View My Orders
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
            <Loader2 size={16} className="animate-spin text-primary" />
            <span>Redirecting to your tickets...</span>
          </div>
        </div>
      )}

      {status === "failed" && (
        <div className="bg-surface border border-border rounded-3xl p-8 shadow-2xl text-center space-y-4">
          <h1 className="text-2xl font-serif font-bold text-red-400">Payment Unsuccessful</h1>
          <p className="text-muted text-sm">
            We could not verify your crypto payment for reference <strong className="font-mono text-primary">{reference}</strong>.
          </p>
          <div className="flex gap-3 pt-4">
            <Link href="/events/explore" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm text-center">
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
