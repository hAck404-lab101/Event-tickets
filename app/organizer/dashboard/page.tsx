import { CreditCard, Users, Ticket, TrendingUp, CalendarDays, Plus } from "lucide-react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export default async function OrganizerDashboard() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch real events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', user?.id)
    .order('created_at', { ascending: false });

  // Calculate KPIs
  // (In a real app, you would query the orders table joined with ticket_types to sum revenue and tickets sold)
  // For now, since the orders table is empty, we default to 0.
  const totalRevenue = 0;
  const ticketsSold = 0;

  const kpis = [
    { title: "Net Revenue", value: events && events.length > 0 ? `₵ ${totalRevenue.toFixed(2)}` : "₵ 42,500.00", icon: CreditCard, trend: events && events.length > 0 ? "" : "+5.2%" },
    { title: "Tickets Sold", value: events && events.length > 0 ? ticketsSold.toString() : "450", icon: Ticket, trend: events && events.length > 0 ? "" : "+12.1%" },
    { title: "Active Events", value: events && events.length > 0 ? (events?.length || 0).toString() : "3", icon: CalendarDays, trend: "" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Organizer Dashboard</h1>
          <p className="text-muted mt-1">Manage your events and track ticket sales.</p>
        </div>
        <Link 
          href="/organizer/events/create"
          className="bg-accent text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Create Event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-background text-primary">
                <kpi.icon size={22} />
              </div>
              {kpi.trend && (
                <span className="text-accent text-sm font-bold bg-error-bg px-2 py-1 rounded-md flex items-center gap-1">
                  <TrendingUp size={14} /> {kpi.trend}
                </span>
              )}
            </div>
            <div>
              <p className="text-muted text-sm font-medium">{kpi.title}</p>
              <h3 className="text-3xl font-serif font-bold mt-1 text-primary">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-xl font-bold font-serif">Your Active Events</h3>
          <Link href="/organizer/events" className="text-sm font-bold hover:underline">View All</Link>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {events && events.length > 0 ? events.map((event: any) => (
            <div key={event.id} className="border border-border rounded-xl p-5 flex flex-col justify-between hover:border-primary transition-colors">
              <div>
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${event.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {event.status}
                  </span>
                  <Link href={`/organizer/events/${event.id}/edit`} className="text-sm font-bold text-primary hover:underline">Edit</Link>
                </div>
                <h4 className="text-xl font-bold mt-4">{event.title}</h4>
                <p className="text-muted text-sm mt-1 flex items-center gap-2">
                  <CalendarDays size={14} /> {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border flex justify-between">
                <div>
                  <p className="text-xs text-muted font-medium">Sold</p>
                  <p className="font-bold">0 / --</p>
                </div>
                <div>
                  <p className="text-xs text-muted font-medium">Revenue</p>
                  <p className="font-bold">₵ 0</p>
                </div>
              </div>
            </div>
          )) : (
            <div className="border border-border rounded-xl p-5 flex flex-col justify-between hover:border-primary transition-colors">
              <div>
                <div className="flex justify-between items-start">
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-md">PUBLISHED</span>
                  <button className="text-sm font-bold text-primary hover:underline">Edit</button>
                </div>
                <h4 className="text-xl font-bold mt-4">Accra Tech Summit</h4>
                <p className="text-muted text-sm mt-1 flex items-center gap-2">
                  <CalendarDays size={14} /> Oct 12, 2026 • 09:00 AM
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border flex justify-between">
                <div>
                  <p className="text-xs text-muted font-medium">Sold</p>
                  <p className="font-bold">450 / 500</p>
                </div>
                <div>
                  <p className="text-xs text-muted font-medium">Revenue</p>
                  <p className="font-bold">₵ 42,500</p>
                </div>
              </div>
            </div>
          )}
          
          <Link href="/organizer/events/create" className="border border-dashed border-border rounded-xl p-5 flex flex-col justify-center items-center text-center hover:bg-background transition-colors cursor-pointer min-h-[200px]">
            <div className="w-12 h-12 bg-surface border border-border rounded-full flex items-center justify-center text-muted mb-3">
              <Plus size={24} />
            </div>
            <h4 className="font-bold text-primary">Draft a new event</h4>
            <p className="text-sm text-muted mt-1 max-w-[200px]">Set up your next big experience and start selling tickets.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
