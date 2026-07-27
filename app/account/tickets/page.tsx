import { Ticket, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export default async function MyTickets() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Get user's orders matching customer_id OR customer_email
  let orderIds: string[] = [];
  if (user) {
    const userEmail = user.email?.toLowerCase();
    const query = userEmail
      ? supabase.from("orders").select("id").or(`customer_id.eq.${user.id},customer_email.ilike.${userEmail}`)
      : supabase.from("orders").select("id").eq("customer_id", user.id);

    const { data: orders } = await query;
    orderIds = orders?.map((o) => o.id) || [];
  }

  // 2. Get tickets for those orders
  const { data: ticketsData } = orderIds.length > 0
    ? await supabase
        .from("tickets")
        .select(`
          id, ticket_code, status, attendee_name,
          ticket_type:ticket_types(
            name, price,
            event:events(id, title, starts_at, city, banner_url)
          ),
          order:orders(reference, customer_name)
        `)
        .in("order_id", orderIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const tickets = ticketsData || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-serif font-bold text-primary">My Tickets</h1>
        <div className="flex bg-surface border border-border rounded-lg p-1">
          <Link href="/account/tickets" className="px-4 py-1.5 rounded-md text-sm font-bold bg-background text-primary shadow-sm border border-border">Tickets</Link>
          <Link href="/account/orders" className="px-4 py-1.5 rounded-md text-sm font-bold text-muted hover:text-primary">Orders</Link>
        </div>
      </div>
      
      {tickets && tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((t: any) => {
            const event = t.ticket_type?.event;
            const eventId = event?.id;
            return (
              <Link key={t.id} href={`/events/${eventId}/tickets/${t.id}`} className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary transition-colors flex flex-col sm:flex-row shadow-sm group">
                <div className="h-48 sm:h-auto sm:w-1/3 bg-background relative overflow-hidden">
                  <img src={event?.banner_url || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80"} alt={event?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase mb-2 inline-block ${
                      t.status === 'valid' ? 'bg-green-500/20 text-green-500' : 
                      t.status === 'checked_in' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-error-bg text-error'
                    }`}>
                      {t.status}
                    </span>
                    <h3 className="font-bold font-serif text-lg leading-tight mb-2 group-hover:text-primary transition-colors">{event?.title}</h3>
                    <p className="text-muted text-sm flex items-center gap-1.5 mb-1">
                      <CalendarDays size={14} /> {event?.starts_at ? new Date(event.starts_at).toLocaleDateString() : 'TBA'}
                    </p>
                    <p className="text-muted text-sm flex items-center gap-1.5 mb-4">
                      <MapPin size={14} /> {event?.city || 'TBA'}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted uppercase font-bold tracking-wider">Ticket Type</p>
                      <p className="font-bold text-sm text-primary">{t.ticket_type?.name}</p>
                    </div>
                    <div>
                       <p className="font-mono text-xs font-bold text-primary">{t.ticket_code}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <Ticket size={48} className="text-muted mb-4 opacity-50" />
          <h3 className="text-xl font-bold font-serif mb-2">No tickets found</h3>
          <p className="text-muted mb-6">You don't have any upcoming events.</p>
          <Link href="/events/explore" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors">
            Find Events
          </Link>
        </div>
      )}
    </div>
  );
}
