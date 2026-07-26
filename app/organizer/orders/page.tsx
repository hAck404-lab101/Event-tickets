import { Ticket, Search } from "lucide-react";

export default async function OrganizerOrdersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Orders</h1>
        <p className="text-muted mt-1">View and manage all ticket orders.</p>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <input 
              type="text" 
              placeholder="Search by order ID, email, or name..." 
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <button className="px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-colors">
            Export CSV
          </button>
        </div>

        <div className="border border-border rounded-xl overflow-hidden text-center py-16">
          <Ticket size={48} className="mx-auto text-muted mb-4 opacity-50" />
          <h3 className="text-xl font-bold font-serif mb-2">No orders found</h3>
          <p className="text-muted">Once attendees start buying tickets, their orders will appear here.</p>
        </div>
      </div>
    </div>
  );
}
