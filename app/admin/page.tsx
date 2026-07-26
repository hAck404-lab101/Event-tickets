import { CreditCard, Users, CalendarDays, Ticket, TrendingUp, AlertCircle, Building2 } from "lucide-react";
import Link from "next/link";

export default function AdminOverview() {
  const kpis = [
    { title: "Total Revenue", value: "₵ 124,500.00", icon: CreditCard, trend: "+12.5%" },
    { title: "Tickets Sold", value: "3,420", icon: Ticket, trend: "+8.2%" },
    { title: "Active Events", value: "45", icon: CalendarDays, trend: "+2" },
    { title: "Total Customers", value: "1,204", icon: Users, trend: "+154" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Dashboard Overview</h1>
          <p className="text-muted mt-1">Platform performance and live metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-surface border border-border rounded-lg px-4 py-2 text-sm text-primary outline-none focus:border-primary">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This Year</option>
          </select>
          <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-colors">
            Download Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-background text-primary">
                <kpi.icon size={22} />
              </div>
              <span className="text-accent text-sm font-bold bg-error-bg px-2 py-1 rounded-md flex items-center gap-1">
                <TrendingUp size={14} /> {kpi.trend}
              </span>
            </div>
            <div>
              <p className="text-muted text-sm font-medium">{kpi.title}</p>
              <h3 className="text-3xl font-serif font-bold mt-1 text-primary">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-xl font-bold font-serif mb-6">Revenue Over Time</h3>
          {/* Simple CSS-based bar chart for demonstration without heavy deps */}
          <div className="h-64 flex items-end gap-2 sm:gap-4 mt-8 pt-4 border-b border-border">
            {[40, 70, 45, 90, 65, 80, 100].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-border rounded-t-md group-hover:bg-primary transition-colors relative"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-primary text-white text-xs py-1 px-2 rounded transition-opacity">
                    ₵{height * 1000}
                  </div>
                </div>
                <span className="text-xs text-muted font-medium">Day {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold font-serif">Action Required</h3>
            <span className="bg-error-bg text-error text-xs font-bold px-2 py-1 rounded-full">3 pending</span>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            <div className="p-4 rounded-xl border border-border bg-background flex gap-4">
              <AlertCircle className="text-accent shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-sm">Event Approval</h4>
                <p className="text-xs text-muted mt-1">"Accra Tech Summit" requires manual review before publishing.</p>
                <Link href="/admin/events" className="text-xs font-bold text-primary mt-2 inline-block hover:underline">Review Event &rarr;</Link>
              </div>
            </div>
            
            <div className="p-4 rounded-xl border border-border bg-background flex gap-4">
              <Building2 className="text-primary shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-sm">Organizer Verification</h4>
                <p className="text-xs text-muted mt-1">"Rhythms & Vibes LTD" uploaded their business registration.</p>
                <Link href="/admin/organizers" className="text-xs font-bold text-primary mt-2 inline-block hover:underline">View Documents &rarr;</Link>
              </div>
            </div>
            
            <div className="p-4 rounded-xl border border-border bg-background flex gap-4">
              <CreditCard className="text-primary shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-sm">Refund Request</h4>
                <p className="text-xs text-muted mt-1">Order #REF-8921 is requesting a ₵150.00 refund.</p>
                <Link href="/admin/orders" className="text-xs font-bold text-primary mt-2 inline-block hover:underline">Process Refund &rarr;</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-xl font-bold font-serif">Recent Orders</h3>
          <Link href="/admin/orders" className="text-sm font-bold hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background text-sm text-muted">
                <th className="px-6 py-4 font-medium">Order Ref</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Event</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { ref: "ORD-9128", name: "Kwame Mensah", event: "Afrochella 2026", amount: "₵ 450.00", status: "paid" },
                { ref: "ORD-9127", name: "Ama Serwaa", event: "Tech in Accra", amount: "₵ 120.00", status: "pending" },
                { ref: "ORD-9126", name: "John Doe", event: "Live Comedy Night", amount: "₵ 80.00", status: "paid" },
                { ref: "ORD-9125", name: "Sarah Connor", event: "Food Festival", amount: "₵ 250.00", status: "failed" },
              ].map((order, i) => (
                <tr key={i} className="border-b border-border hover:bg-background transition-colors">
                  <td className="px-6 py-4 font-medium">{order.ref}</td>
                  <td className="px-6 py-4">{order.name}</td>
                  <td className="px-6 py-4 text-muted">{order.event}</td>
                  <td className="px-6 py-4 font-bold">
                    {order.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      order.status === 'paid' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-error-bg text-error'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
