import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { CalendarDays, Clock3, MapPin, Ticket as TicketIcon, CheckCircle2, QrCode } from "lucide-react";
import Link from "next/link";
import { formatGhs } from "@/lib/events";

export default async function TicketConfirmationPage({ params }: { params: Promise<{ id: string; ticketId: string }> }) {
  const { id: eventId, ticketId } = await params;

  const supabase = createServerClient();
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(`
      *,
      order:orders (
        customer_name,
        customer_email,
        reference
      ),
      ticket_type:ticket_types (
        name,
        price
      )
    `)
    .eq('id', ticketId)
    .single();

  if (error || !ticket) {
    notFound();
  }

  // We should also fetch the event from the DB, but currently events are hardcoded in lib/events
  // So we will import getEventById
  const { getEventById } = await import("@/lib/events");
  const event = await getEventById(eventId);
  
  if (!event) {
    notFound();
  }

  // We need to generate a real QR code or a placeholder that looks real
  // Using an image API to generate the QR Code for the ticket's qr_payload
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.qr_payload)}`;

  return (
    <main className="min-h-screen bg-background pb-24">
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary group">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl group-hover:bg-primary-hover transition-colors">
              <TicketIcon size={24} />
            </div>
            <span className="text-2xl font-serif font-bold tracking-tight">Tixly</span>
          </Link>
          <Link href="/account" className="text-sm font-bold text-muted hover:text-primary transition-colors">
            My Tickets
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="bg-surface rounded-[2rem] border border-border overflow-hidden shadow-2xl">
          <div className="bg-green-500/10 p-8 text-center border-b border-border">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-2xl font-serif font-bold text-primary mb-2">Payment Successful!</h1>
            <p className="text-muted">Your order <strong className="text-primary">{ticket.order?.reference}</strong> has been confirmed.</p>
          </div>

          <div className="p-8 sm:p-12">
            <div className="flex flex-col md:flex-row gap-12 items-center md:items-start border-b border-border pb-12">
              <div className="flex-1 space-y-6 w-full">
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Event</p>
                  <h2 className="text-3xl font-serif font-bold text-primary leading-tight">{event.title}</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg border border-border text-primary"><CalendarDays size={20} /></div>
                    <div>
                      <p className="text-xs text-muted font-bold uppercase">Date</p>
                      <p className="font-bold text-primary">{event.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg border border-border text-primary"><Clock3 size={20} /></div>
                    <div>
                      <p className="text-xs text-muted font-bold uppercase">Time</p>
                      <p className="font-bold text-primary">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg border border-border text-primary"><MapPin size={20} /></div>
                    <div>
                      <p className="text-xs text-muted font-bold uppercase">Location</p>
                      <p className="font-bold text-primary">{event.venue}, {event.city}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-center bg-background p-6 rounded-3xl border border-border">
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeUrl} alt="Ticket QR Code" className="w-40 h-40" />
                </div>
                <p className="font-mono text-sm font-bold text-primary tracking-widest">{ticket.ticket_code}</p>
                <p className="text-xs text-muted mt-2">Scan to check-in</p>
              </div>
            </div>

            <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Attendee Name</p>
                <p className="font-bold text-primary">{ticket.attendee_name || ticket.order?.customer_name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Ticket Type</p>
                <p className="font-bold text-primary">{ticket.ticket_type?.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Price</p>
                <p className="font-bold text-primary">{formatGhs(ticket.ticket_type?.price)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Order Status</p>
                <p className="font-bold text-green-600 capitalize">{ticket.status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
