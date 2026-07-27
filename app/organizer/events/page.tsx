import { CalendarDays, Plus, MapPin, Ticket, TrendingUp } from "lucide-react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export default async function OrganizerEventsPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // First get the organizer record for this user using maybeSingle()
  let { data: organizer } = user
    ? await supabase
        .from('organizers')
        .select('id, business_name')
        .eq('owner_id', user.id)
        .maybeSingle()
    : { data: null };

  // If no organizer profile exists yet, auto-create one
  if (!organizer && user) {
    const defaultName = user.user_metadata?.business_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'My Organization';
    const { data: newOrg } = await supabase
      .from('organizers')
      .insert({ owner_id: user.id, business_name: defaultName, contact_email: user.email })
      .select('id, business_name')
      .maybeSingle();
    if (newOrg) organizer = newOrg;
  }

  // Then fetch events belonging to this organizer
  const { data: events, error } = organizer
    ? await supabase
        .from('events')
        .select(`
          *,
          categories(name),
          ticket_types(id, name, price, quantity_total, quantity_sold)
        `)
        .eq('organizer_id', organizer.id)
        .order('created_at', { ascending: false })
    : { data: [], error: null };

  const hasEvents = events && events.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">My Events</h1>
          <p className="text-muted mt-1">Manage and edit your upcoming events.</p>
        </div>
        {hasEvents && (
          <Link
            href="/organizer/events/create"
            className="bg-accent text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-colors flex items-center gap-2 self-start"
          >
            <Plus size={18} /> Create Event
          </Link>
        )}
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        {hasEvents ? (
          <div className="divide-y divide-border">
            {events.map((event: any) => {
              const totalSold = event.ticket_types?.reduce((sum: number, t: any) => sum + (t.quantity_sold || 0), 0) ?? 0;
              const totalCapacity = event.ticket_types?.reduce((sum: number, t: any) => sum + (t.quantity_total || 0), 0) ?? 0;
              const revenue = event.ticket_types?.reduce((sum: number, t: any) => sum + ((t.quantity_sold || 0) * (t.price || 0)), 0) ?? 0;
              return (
                <div key={event.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-background/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-border bg-background">
                      <img
                        src={event.banner_url || '/images/hero-concert.jpg'}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-serif mb-1 text-primary">{event.title}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted font-medium">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {event.starts_at ? new Date(event.starts_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBA'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} />
                          {event.city || 'Location TBA'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Ticket size={14} />
                          {totalSold} / {totalCapacity} sold
                        </span>
                        <span className="flex items-center gap-1.5">
                          <TrendingUp size={14} />
                          ₵{revenue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-md uppercase ${
                      event.status === 'published' ? 'bg-green-900/30 text-green-400 border border-green-800' :
                      event.status === 'draft' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800' :
                      'bg-border text-muted'
                    }`}>
                      {event.status}
                    </span>
                    <Link
                      href={`/events/${event.id}`}
                      target="_blank"
                      className="px-3 py-2 bg-background border border-border rounded-lg text-sm font-bold hover:border-primary transition-colors text-primary"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-background border border-border rounded-full flex items-center justify-center text-muted mb-6">
              <CalendarDays size={36} />
            </div>
            <h3 className="text-2xl font-bold font-serif mb-3 text-primary">No events yet</h3>
            <p className="text-muted mb-8 max-w-sm">
              Create your first event and start selling tickets to your audience!
            </p>
            <Link
              href="/organizer/events/create"
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors flex items-center gap-2"
            >
              <Plus size={18} /> Create Your First Event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
