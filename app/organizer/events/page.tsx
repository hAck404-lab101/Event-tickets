import { CalendarDays, Plus, MapPin } from "lucide-react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export default async function OrganizerEventsPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', user?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">My Events</h1>
          <p className="text-muted mt-1">Manage and edit your upcoming events.</p>
        </div>
        <Link 
          href="/organizer/events/create"
          className="bg-accent text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Create Event
        </Link>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        {events && events.length > 0 ? (
          <div className="divide-y divide-border">
            {events.map((event: any) => (
              <div key={event.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-background/50 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-border">
                    <img src={event.image_url || '/images/hero-concert.jpg'} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-serif mb-1">{event.title}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted font-medium">
                      <span className="flex items-center gap-1.5"><CalendarDays size={16} /> {new Date(event.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={16} /> {event.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-md uppercase ${event.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {event.status}
                  </span>
                  <Link href={`/organizer/events/${event.id}/edit`} className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-bold hover:border-primary transition-colors">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-background border border-border rounded-full flex items-center justify-center text-muted mb-4">
              <CalendarDays size={32} />
            </div>
            <h3 className="text-xl font-bold font-serif mb-2">No events yet</h3>
            <p className="text-muted mb-6">Create your first event and start selling tickets!</p>
            <Link 
              href="/organizer/events/create"
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors"
            >
              Create Event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
