import { CalendarDays, Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import Link from "next/link";

export default function AdminEventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Events</h1>
          <p className="text-muted mt-1">Manage platform events, approvals, and featuring.</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-opacity-90 flex items-center gap-2">
          <Plus size={18} /> New Event
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between bg-background">
          <div className="flex items-center bg-white rounded-lg px-4 py-2 border border-border focus-within:border-primary flex-1 max-w-md">
            <Search size={16} className="text-muted mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Search by title, organizer, or venue..." 
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-white border border-border px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-background">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-background text-sm text-muted">
                <th className="px-6 py-4 font-medium">Event Name</th>
                <th className="px-6 py-4 font-medium">Organizer</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Tickets</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { name: "Accra Tech Summit", org: "Tech In Ghana", date: "Oct 12, 2026", time: "09:00 AM", tickets: "450 / 500", status: "published" },
                { name: "Live Comedy Night", org: "Laugh Out Loud", date: "Oct 15, 2026", time: "07:00 PM", tickets: "120 / 300", status: "pending_approval" },
                { name: "Food Festival", org: "Taste Makers", date: "Nov 01, 2026", time: "11:00 AM", tickets: "0 / 1000", status: "draft" },
                { name: "Afrochella 2026", org: "Culture Fest", date: "Dec 28, 2026", time: "12:00 PM", tickets: "5,000 / 10,000", status: "published" },
              ].map((event, i) => (
                <tr key={i} className="border-b border-border hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-primary">{event.name}</div>
                    <div className="text-xs text-muted mt-1">Accra, Ghana</div>
                  </td>
                  <td className="px-6 py-4 text-muted">{event.org}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-muted" />
                      {event.date}
                    </div>
                    <div className="text-xs text-muted mt-1">{event.time}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">{event.tickets}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      event.status === 'published' ? 'bg-green-100 text-green-800' :
                      event.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-muted hover:text-primary p-2">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-border flex justify-between items-center text-sm text-muted bg-background">
          <span>Showing 1 to 4 of 4 entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-border rounded hover:bg-white disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-border rounded bg-primary text-white">1</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-white disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
