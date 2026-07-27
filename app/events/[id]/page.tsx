import { notFound } from "next/navigation";
import { CalendarDays, Clock3, MapPin, Share2, Ticket, ArrowLeft } from "lucide-react";
import TicketCheckout from "@/components/ticket-checkout";
import { getEventById, getEvents, formatGhs } from "@/lib/events";
import Link from "next/link";

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((event) => ({ id: event.id }));
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const lowestPrice = event.ticketTypes.length > 0 ? Math.min(...event.ticketTypes.map((ticket) => ticket.price)) : 0;

  return (
    <main className="min-h-screen bg-background pb-24">
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary group">
            <div className="bg-primary text-white p-2 rounded-xl group-hover:bg-accent transition-colors">
              <Ticket size={24} />
            </div>
            <span className="text-2xl font-serif font-bold tracking-tight">Tixly</span>
          </Link>
          <Link href="/events/explore" className="text-sm font-bold text-muted hover:text-primary transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> Back to events
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <section className="relative w-full h-[400px] sm:h-[500px] rounded-[2rem] overflow-hidden mb-12 shadow-xl">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${event.image})` }} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 flex flex-col justify-end">
            <span className="self-start bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg uppercase tracking-wider mb-6">
              {event.category}
            </span>
            <p className="text-white/80 font-bold mb-2">From {formatGhs(lowestPrice)}</p>
            <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white max-w-4xl leading-tight">
              {event.title}
            </h1>
          </div>
        </section>

        <section className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex-1 w-full space-y-12">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-8 border-b border-border">
              <span className="text-muted text-lg">
                Hosted by <strong className="text-primary">{event.organizer}</strong>
              </span>
              <button className="flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-xl font-bold hover:bg-background transition-colors shadow-sm">
                <Share2 size={18} /> Share
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <article className="bg-surface p-6 rounded-2xl border border-border flex flex-col gap-3 shadow-sm">
                <div className="p-3 bg-background rounded-xl w-fit text-primary"><CalendarDays size={24} /></div>
                <div>
                  <small className="block text-muted font-bold text-xs uppercase tracking-wider mb-1">Date</small>
                  <strong className="text-lg text-primary">{event.date}</strong>
                </div>
              </article>
              <article className="bg-surface p-6 rounded-2xl border border-border flex flex-col gap-3 shadow-sm">
                <div className="p-3 bg-background rounded-xl w-fit text-primary"><Clock3 size={24} /></div>
                <div>
                  <small className="block text-muted font-bold text-xs uppercase tracking-wider mb-1">Time</small>
                  <strong className="text-lg text-primary">{event.time}</strong>
                </div>
              </article>
              <article className="bg-surface p-6 rounded-2xl border border-border flex flex-col gap-3 shadow-sm">
                <div className="p-3 bg-background rounded-xl w-fit text-primary"><MapPin size={24} /></div>
                <div>
                  <small className="block text-muted font-bold text-xs uppercase tracking-wider mb-1">Venue</small>
                  <strong className="text-lg text-primary leading-tight block">{event.venue}, {event.city}</strong>
                </div>
              </article>
            </div>

            <div className="space-y-6">
              <p className="text-accent text-sm font-bold uppercase tracking-wider">About this event</p>
              <h2 className="text-3xl font-serif font-bold text-primary">What to expect</h2>
              <p className="text-muted text-lg leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6">
              <strong className="block text-accent font-bold mb-2">Important</strong>
              <p className="text-primary/80 leading-relaxed">Bring a valid ticket QR code and a matching form of identification. Tickets are only valid once.</p>
            </div>
          </div>
          
          <div className="w-full lg:w-[420px] lg:sticky lg:top-28 shrink-0">
            <TicketCheckout event={event} />
          </div>
        </section>
      </div>
    </main>
  );
}
