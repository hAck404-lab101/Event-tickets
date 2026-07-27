import { Ticket, CheckCircle2, ArrowRight, Download } from "lucide-react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { formatGhs } from "@/lib/events";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; orderId?: string }>;
}) {
  const { reference, orderId } = await searchParams;

  const supabase = createServerClient();

  let order: any = null;
  let tickets: any[] = [];

  if (reference || orderId) {
    const query = supabase
      .from("orders")
      .select(`
        id, reference, total, payment_status, customer_name, customer_email, created_at,
        events(id, title, starts_at, city, banner_url)
      `);

    if (reference) query.eq("reference", reference);
    else if (orderId) query.eq("id", orderId);

    const { data } = await query.single();
    order = data;

    if (order) {
      const { data: ticketData } = await supabase
        .from("tickets")
        .select(`
          id, ticket_code, status,
          ticket_types(name, price)
        `)
        .eq("order_id", order.id);
      tickets = ticketData || [];
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-green-900/40 border-2 border-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-primary mb-3">Payment Confirmed!</h1>
          <p className="text-muted text-lg">
            Your tickets are ready. Check your email for a confirmation.
          </p>
        </div>

        {order ? (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
            {/* Event Banner */}
            {order.events?.banner_url && (
              <div className="h-40 overflow-hidden">
                <img
                  src={order.events.banner_url}
                  alt={order.events.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8 space-y-6">
              {/* Order Summary */}
              <div>
                <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Event</p>
                <h2 className="text-2xl font-serif font-bold text-primary">{order.events?.title}</h2>
                {order.events?.starts_at && (
                  <p className="text-muted text-sm mt-1">
                    {new Date(order.events.starts_at).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })} · {order.events.city}
                  </p>
                )}
              </div>

              {/* Order Details */}
              <div className="bg-background rounded-xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted font-medium">Order Reference</span>
                  <span className="font-bold font-mono text-primary">{order.reference}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted font-medium">Buyer</span>
                  <span className="font-bold text-primary">{order.customer_name}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-3">
                  <span className="text-muted font-bold">Total Paid</span>
                  <span className="font-bold text-primary text-lg">{formatGhs(Number(order.total))}</span>
                </div>
              </div>

              {/* Tickets */}
              {tickets.length > 0 && (
                <div>
                  <p className="text-xs text-muted font-bold uppercase tracking-wider mb-3">Your Tickets ({tickets.length})</p>
                  <div className="space-y-2">
                    {tickets.map((t: any) => (
                      <Link
                        key={t.id}
                        href={`/events/${order.events?.id}/tickets/${t.id}`}
                        className="flex items-center justify-between bg-background border border-border rounded-xl p-4 hover:border-primary transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-surface rounded-lg text-primary">
                            <Ticket size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-primary">{t.ticket_types?.name}</p>
                            <p className="font-mono text-xs text-muted">{t.ticket_code}</p>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-muted group-hover:text-primary transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center">
            <Ticket size={48} className="mx-auto text-muted mb-4 opacity-50" />
            <h3 className="text-xl font-bold font-serif text-primary mb-2">Order processed</h3>
            <p className="text-muted">Your order has been confirmed. Check My Tickets to view your tickets.</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/account/tickets"
            className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-center hover:bg-accent transition-colors flex items-center justify-center gap-2"
          >
            <Ticket size={18} /> View My Tickets
          </Link>
          <a
            href={`/api/orders/${order?.id}/receipt`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-surface-elevated border border-border py-4 rounded-xl font-bold text-center hover:bg-background transition-colors flex items-center justify-center gap-2 text-primary"
          >
            <Download size={18} /> Download Receipt
          </a>
        </div>
      </div>
    </main>
  );
}
