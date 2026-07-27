import { CreditCard, Users, Ticket, TrendingUp, CalendarDays, Plus, MapPin } from "lucide-react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export default async function OrganizerDashboard() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get the organizer record for this user
  const { data: organizer } = await supabase
    .from('organizers')
    .select('id, business_name')
    .eq('owner_id', user?.id)
    .single();

  // Fetch real events via organizer.id (not user.id)
  const { data: eventsData } = organizer
    ? await supabase
        .from('events')
        .select(`*, ticket_types(id, quantity_total, quantity_sold, price)`)
        .eq('organizer_id', organizer.id)
        .order('created_at', { ascending: false })
    : { data: [] };

  const events = eventsData || [];

  // Calculate KPIs from real data
  let totalRevenue = 0;
  let ticketsSold = 0;

  const processedEvents = events.map((event: any) => {
    let eventRevenue = 0;
    let eventTicketsSold = 0;
    let eventTicketsTotal = 0;

    event.ticket_types?.forEach((tt: any) => {
      eventTicketsSold += tt.quantity_sold || 0;
      eventTicketsTotal += tt.quantity_total || 0;
      eventRevenue += (tt.quantity_sold || 0) * (tt.price || 0);
    });

    totalRevenue += eventRevenue;
    ticketsSold += eventTicketsSold;

    return { ...event, eventRevenue, eventTicketsSold, eventTicketsTotal };
  });

  const kpis = [
    { title: "Net Revenue", value: `₵ ${totalRevenue.toFixed(2)}`, icon: CreditCard },
    { title: "Tickets Sold", value: ticketsSold.toString(), icon: Ticket },
    { title: "Total Events", value: events.length.toString(), icon: CalendarDays },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Organizer Dashboard</h1>
          <p className="text-muted mt-1">
            {organizer?.business_name ? `Managing ${organizer.business_name}` : "Manage your events and track ticket sales."}
          </p>
        </div>
        <Link
          href="/organizer/events/create"
          className="bg-accent text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-colors flex items-center gap-2 self-start"
        >
          <Plus size={18} /> Create Event
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-background text-primary">
                <kpi.icon size={22} />
              </div>
            </div>
            <div>
              <p className="text-muted text-sm font-medium">{kpi.title}</p>
              <h3 className="text-3xl font-serif font-bold mt-1 text-primary">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Events */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-xl font-bold font-serif text-primary">Your Events</h3>
          <Link href="/organizer/events" className="text-sm font-bold text-accent hover:underline">
            View All
          </Link>
        </div>

        {processedEvents.length > 0 ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {processedEvents.slice(0, 4).map((event: any) => (
              <div key={event.id} className="border border-border rounded-xl p-5 flex flex-col justify-between hover:border-primary transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${
                      event.status === 'published' ? 'bg-green-900/30 text-green-400 border border-green-800' :
                      'bg-border text-muted'
                    }`}>
                      {event.status}
                    </span>
                    <Link href={`/events/${event.id}`} target="_blank" className="text-xs font-bold text-muted hover:text-primary">
                      View →
                    </Link>
                  </div>
                  <h4 className="text-lg font-bold font-serif text-primary">{event.title}</h4>
                  <p className="text-muted text-sm mt-1 flex items-center gap-2">
                    <CalendarDays size={14} />
                    {new Date(event.starts_at || event.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {event.city && (
                    <p className="text-muted text-sm mt-1 flex items-center gap-2">
                      <MapPin size={14} /> {event.city}
                    </p>
                  )}
                </div>
                <div className="mt-5 pt-4 border-t border-border flex justify-between">
                  <div>
                    <p className="text-xs text-muted font-medium">Sold</p>
                    <p className="font-bold text-primary">{event.eventTicketsSold} / {event.eventTicketsTotal}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted font-medium">Revenue</p>
                    <p className="font-bold text-primary">₵ {event.eventRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}

            <Link
              href="/organizer/events/create"
              className="border border-dashed border-border rounded-xl p-5 flex flex-col justify-center items-center text-center hover:bg-background transition-colors cursor-pointer min-h-[180px]"
            >
              <div className="w-12 h-12 bg-surface border border-border rounded-full flex items-center justify-center text-muted mb-3">
                <Plus size={24} />
              </div>
              <h4 className="font-bold text-primary">Create a new event</h4>
              <p className="text-sm text-muted mt-1 max-w-[200px]">
                Set up your next experience and start selling tickets.
              </p>
            </Link>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-background border border-border rounded-full flex items-center justify-center text-muted mx-auto mb-4">
              <CalendarDays size={32} />
            </div>
            <h3 className="text-xl font-bold font-serif mb-2 text-primary">No events yet</h3>
            <p className="text-muted mb-6 max-w-sm mx-auto">
              {!organizer
                ? "Please complete your organizer profile in Settings before creating events."
                : "Create your first event and start selling tickets to your audience."}
            </p>
            {organizer ? (
              <Link href="/organizer/events/create" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors inline-flex items-center gap-2">
                <Plus size={18} /> Create Your First Event
              </Link>
            ) : (
              <Link href="/organizer/settings" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors inline-block">
                Complete Profile →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
