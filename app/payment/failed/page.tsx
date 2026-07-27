import { XCircle, RefreshCw, ArrowLeft, Ticket } from "lucide-react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; eventId?: string }>;
}) {
  const { reference, eventId } = await searchParams;

  const supabase = createServerClient();
  let order: any = null;

  if (reference) {
    const { data } = await supabase
      .from("orders")
      .select("id, reference, total, events(id, title)")
      .eq("reference", reference)
      .single();
    order = data;
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center">
        <div className="w-24 h-24 bg-red-900/30 border-2 border-red-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={48} className="text-red-500" />
        </div>

        <h1 className="text-4xl font-serif font-bold text-primary mb-3">Payment Failed</h1>
        <p className="text-muted text-lg mb-8">
          We couldn't process your payment. No charges were made to your account.
        </p>

        {order && (
          <div className="bg-surface border border-border rounded-2xl p-6 mb-8 text-left">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-muted">Order Reference</span>
              <span className="font-mono font-bold text-primary">{order.reference}</span>
            </div>
            {order.events?.title && (
              <div className="flex justify-between text-sm">
                <span className="text-muted">Event</span>
                <span className="font-bold text-primary">{order.events.title}</span>
              </div>
            )}
          </div>
        )}

        <div className="bg-surface border border-border rounded-2xl p-6 mb-8 text-left space-y-3">
          <h3 className="font-bold text-primary mb-2">Common reasons for payment failure:</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li>• Insufficient account balance</li>
            <li>• Payment timeout — the session expired</li>
            <li>• Network interruption during processing</li>
            <li>• Transaction declined by your bank or mobile money provider</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {(order?.events?.id || eventId) && (
            <Link
              href={`/events/${order?.events?.id || eventId}`}
              className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-accent transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} /> Try Again
            </Link>
          )}
          <Link
            href="/events/explore"
            className="flex-1 bg-surface border border-border py-4 rounded-xl font-bold text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> Browse Events
          </Link>
          <Link
            href="/account/orders"
            className="flex-1 bg-surface border border-border py-4 rounded-xl font-bold text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"
          >
            <Ticket size={18} /> My Orders
          </Link>
        </div>

        <p className="text-xs text-muted mt-8">
          Need help? Contact us at{" "}
          <a href="mailto:support@tixly.co" className="text-primary hover:underline">
            support@tixly.co
          </a>
        </p>
      </div>
    </main>
  );
}
