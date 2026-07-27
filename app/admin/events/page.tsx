import { CalendarDays, Filter, Plus, Search, Tag, Eye, RefreshCw } from "lucide-react";
import Link from "next/link";
import { getAdminClient } from "@/lib/supabase/server";

export default async function AdminEventsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: statusParam } = await searchParams;
  const statusFilter = statusParam;
  const supabase = getAdminClient();

  let query = supabase
    .from('events')
    .select(`
      id,
      title,
      city,
      starts_at,
      status,
      categories(name),
      organizer:organizers(business_name),
      ticket_types(quantity_total, quantity_sold)
    `)
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data: eventsData } = await query;
  const events = eventsData || [];

  const tabs = [
    { name: "All", value: "all" },
    { name: "Draft", value: "draft" },
    { name: "Published", value: "published" },
    { name: "Cancelled", value: "cancelled" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Events</h1>
          <p className="text-muted mt-1">Manage platform events, approvals, and featuring.</p>
        </div>
        <Link href="/organizer/events/create" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm hover:bg-opacity-90 flex items-center gap-2 transition-colors">
          <Plus size={18} /> New Event
        </Link>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex px-4 border-b border-border bg-surface-elevated overflow-x-auto">
          {tabs.map(tab => (
            <Link 
              key={tab.value}
              href={`/admin/events${tab.value === 'all' ? '' : `?status=${tab.value}`}`}
              className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                (statusFilter === tab.value) || (!statusFilter && tab.value === 'all')
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted hover:text-primary hover:border-primary/50'
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </div>

        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between bg-background">
          <div className="flex items-center bg-surface rounded-lg px-4 py-2 border border-border focus-within:border-primary flex-1 max-w-md transition-colors">
            <Search size={16} className="text-muted mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Search by title, organizer, or venue..." 
              className="bg-transparent border-none outline-none text-sm w-full text-primary placeholder:text-muted"
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-surface-elevated border border-border px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-background transition-colors text-foreground">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-background text-sm text-muted">
                <th className="px-6 py-4 font-medium">Event Name</th>
                <th className="px-6 py-4 font-medium">Organizer</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Tickets</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {events.map((event: any) => {
                let sold = 0;
                let total = 0;
                event.ticket_types?.forEach((tt: any) => {
                  sold += tt.quantity_sold;
                  total += tt.quantity_total;
                });
                return (
                <tr key={event.id} className="border-b border-border hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-primary">{event.title}</div>
                    <div className="text-xs text-muted mt-1 flex items-center gap-1">
                      {event.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted">{event.organizer?.business_name || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-muted text-xs bg-surface-elevated w-max px-2 py-1 rounded-md border border-border">
                      <Tag size={12} />
                      {event.categories?.name || 'Uncategorized'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-primary">
                      <CalendarDays size={14} className="text-muted" />
                      {event.starts_at ? new Date(event.starts_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-primary">{sold} / {total}</div>
                    <div className="w-full bg-surface h-1.5 rounded-full mt-1.5 overflow-hidden border border-border">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${total > 0 ? (sold/total)*100 : 0}%` }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      event.status === 'published' ? 'bg-green-900/30 text-green-400 border border-green-800' :
                      event.status === 'cancelled' ? 'bg-red-900/30 text-red-400 border border-red-800' :
                      event.status === 'draft' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800' :
                      'bg-border text-muted border border-border'
                    }`}>
                      {(event.status || 'draft').replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/events/${event.id}`} target="_blank" className="text-muted hover:text-primary transition-colors" title="View Event Page">
                        <Eye size={18} />
                      </Link>
                      <button className="text-muted hover:text-accent transition-colors" title="Toggle Status">
                        <RefreshCw size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
              
              {events.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-muted">
                      <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
                        <CalendarDays size={24} className="text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-primary mb-1">No events found</h3>
                      <p className="max-w-sm mx-auto text-sm">
                        {statusFilter && statusFilter !== 'all' 
                          ? `There are no ${statusFilter} events at the moment.`
                          : "No events have been created on the platform yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
