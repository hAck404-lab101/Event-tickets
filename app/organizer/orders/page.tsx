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

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-background text-muted uppercase font-bold text-xs border-b border-border">
              <tr>
                <th className="px-6 py-4">Order Ref</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-background/50 transition-colors">
                <td className="px-6 py-4 font-bold text-primary">#ORD-9128</td>
                <td className="px-6 py-4 font-medium">Ama Serwaa<br/><span className="text-xs text-muted font-normal">ama@example.com</span></td>
                <td className="px-6 py-4 font-bold">Accra Tech Summit</td>
                <td className="px-6 py-4 font-bold">₵ 120.00</td>
                <td className="px-6 py-4 text-right text-muted font-medium">Oct 10, 2026</td>
              </tr>
              <tr className="hover:bg-background/50 transition-colors">
                <td className="px-6 py-4 font-bold text-primary">#ORD-8432</td>
                <td className="px-6 py-4 font-medium">Kwame Mensah<br/><span className="text-xs text-muted font-normal">kwame@example.com</span></td>
                <td className="px-6 py-4 font-bold">Accra Tech Summit</td>
                <td className="px-6 py-4 font-bold">₵ 240.00</td>
                <td className="px-6 py-4 text-right text-muted font-medium">Oct 09, 2026</td>
              </tr>
              <tr className="hover:bg-background/50 transition-colors">
                <td className="px-6 py-4 font-bold text-primary">#ORD-7193</td>
                <td className="px-6 py-4 font-medium">Abena Osei<br/><span className="text-xs text-muted font-normal">abena@example.com</span></td>
                <td className="px-6 py-4 font-bold">Detty December Concert</td>
                <td className="px-6 py-4 font-bold">₵ 500.00</td>
                <td className="px-6 py-4 text-right text-muted font-medium">Oct 09, 2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
