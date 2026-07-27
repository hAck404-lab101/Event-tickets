import { CreditCard, Ticket, CalendarDays, TrendingUp, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createServerClient, getAdminClient } from "@/lib/supabase/server";

export default async function OrganizerDashboard() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminSupabase = getAdminClient();

  let organizer: any = null;

  if (user) {
    const userEmail = user.email?.toLowerCase().trim();
    const filterParts: string[] = [`owner_id.eq.${user.id}`];
    if (userEmail) filterParts.push(`contact_email.ilike.${userEmail}`);

    const { data: orgData } = await adminSupabase
      .from('organizers')
      .select('id, business_name, owner_id')
      .or(filterParts.join(","))
      .maybeSingle();

    if (orgData) {
      organizer = orgData;
      if (orgData.owner_id !== user.id) {
        await adminSupabase.from('organizers').update({ owner_id: user.id }).eq('id', orgData.id);
      }
    } else {
      const defaultName = user.user_metadata?.business_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'My Organization';
      const { data: newOrg } = await adminSupabase
        .from('organizers')
        .insert({ owner_id: user.id, business_name: defaultName, contact_email: user.email })
        .select('id, business_name, owner_id')
        .maybeSingle();
      if (newOrg) organizer = newOrg;
    }
  }

  // Fetch organizer events
  const { data: events } = organizer
    ? await adminSupabase
        .from('events')
        .select(`
          id, title, city, starts_at, status, created_at,
          ticket_types(id, price, quantity_total, quantity_sold)
        `)
        .eq('organizer_id', organizer.id)
        .order('created_at', { ascending: false })
    : { data: [] };

  const eventList = events || [];

  let totalTicketsSold = 0;
  let totalRevenue = 0;

  eventList.forEach((e: any) => {
    e.ticket_types?.forEach((tt: any) => {
      totalTicketsSold += tt.quantity_sold || 0;
      totalRevenue += (tt.quantity_sold || 0) * (tt.price || 0);
    });
  });

  const kpis = [
    { title: "Total Revenue", value: `₵${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: CreditCard },
    { title: "Tickets Sold", value: totalTicketsSold.toString(), icon: Ticket },
    { title: "Total Events", value: eventList.length.toString(), icon: CalendarDays },
    { title: "Active Events", value: eventList.filter((e: any) => e.status === 'published').length.toString(), icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Organizer Dashboard</h1>
          <p className="text-muted mt-1">Welcome back! Here's an overview of your events and sales.</p>
        </div>
        <Link
          href="/organizer/events/create"
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-opacity-90 transition-colors flex items-center gap-2 self-start"
        >
          <Plus size={18} /> Create New Event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-xl font-bold font-serif text-primary">My Events</h3>
          <Link href="/organizer/events" className="text-sm font-bold hover:underline text-primary flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {eventList.length > 0 ? (
          <div className="divide-y divide-border">
            {eventList.slice(0, 5).map((event: any) => {
              const sold = event.ticket_types?.reduce((sum: number, t: any) => sum + (t.quantity_sold || 0), 0) ?? 0;
              const totalCap = event.ticket_types?.reduce((sum: number, t: any) => sum + (t.quantity_total || 0), 0) ?? 0;
              return (
                <div key={event.id} className="p-5 flex items-center justify-between hover:bg-background/50 transition-colors">
                  <div>
                    <h4 className="font-bold font-serif text-primary">{event.title}</h4>
                    <p className="text-sm text-muted mt-0.5">
                      {event.starts_at ? new Date(event.starts_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'} • {event.city || 'TBA'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-muted">{sold} / {totalCap} tickets sold</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-md uppercase ${
                      event.status === 'published' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-muted">
            <p className="mb-4">You haven't created any events yet.</p>
            <Link href="/organizer/events/create" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm inline-block">
              Create Event Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
