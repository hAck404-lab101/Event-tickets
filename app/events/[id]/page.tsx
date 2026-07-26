import { notFound } from "next/navigation";
import { CalendarDays, Clock3, MapPin, Share2, Ticket } from "lucide-react";
import TicketCheckout from "@/components/ticket-checkout";
import { events, getEventById, formatGhs } from "@/lib/events";

export function generateStaticParams() {
  return events.map((event) => ({ id: event.id }));
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) notFound();

  const lowestPrice = Math.min(...event.ticketTypes.map((ticket) => ticket.price));

  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="/"><span><Ticket size={19} /></span>Tixly</a>
        <a className="back-link" href="/">← Back to events</a>
      </header>

      <section className="event-hero shell">
        <div className="event-hero-image" style={{ backgroundImage: `linear-gradient(180deg, transparent, rgba(8,8,12,.75)), url(${event.image})` }}>
          <span className="event-category">{event.category}</span>
          <div><p>From {formatGhs(lowestPrice)}</p><h1>{event.title}</h1></div>
        </div>
      </section>

      <section className="event-detail-layout shell">
        <div className="event-information">
          <div className="event-actions"><span>Hosted by <strong>{event.organizer}</strong></span><button><Share2 size={17} /> Share</button></div>
          <div className="detail-grid">
            <article><CalendarDays size={21} /><span><small>Date</small><strong>{event.date}</strong></span></article>
            <article><Clock3 size={21} /><span><small>Time</small><strong>{event.time}</strong></span></article>
            <article><MapPin size={21} /><span><small>Venue</small><strong>{event.venue}, {event.city}</strong></span></article>
          </div>
          <div className="about-event"><p className="eyebrow">About this event</p><h2>What to expect</h2><p>{event.description}</p></div>
          <div className="event-notice"><strong>Important</strong><p>Bring a valid ticket QR code and a matching form of identification. Tickets are only valid once.</p></div>
        </div>
        <TicketCheckout event={event} />
      </section>
    </main>
  );
}
