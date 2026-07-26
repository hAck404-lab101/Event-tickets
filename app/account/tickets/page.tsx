import { Ticket } from "lucide-react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export default async function MyTickets() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch real tickets here. For now, since DB is fresh, show empty state.
  const tickets: any[] = [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-serif font-bold text-primary">My Tickets</h1>
        <div className="flex bg-surface border border-border rounded-lg p-1">
          <button className="px-4 py-1.5 rounded-md text-sm font-bold bg-background text-primary shadow-sm border border-border">Upcoming</button>
          <button className="px-4 py-1.5 rounded-md text-sm font-bold text-muted hover:text-primary">Past</button>
        </div>
      </div>
      
      {tickets && tickets.length > 0 ? (
        <div className="space-y-6">
          {/* List real tickets */}
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <Ticket size={48} className="text-muted mb-4 opacity-50" />
          <h3 className="text-xl font-bold font-serif mb-2">No tickets found</h3>
          <p className="text-muted mb-6">You don't have any upcoming events.</p>
          <Link href="/events/explore" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors">
            Find Events
          </Link>
        </div>
      )}
    </div>
  );
}
