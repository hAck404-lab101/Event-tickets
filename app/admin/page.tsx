import { CreditCard, Users, CalendarDays, Ticket, TrendingUp, AlertCircle, Building2 } from "lucide-react";
import Link from "next/link";
import { getAdminClient } from "@/lib/supabase/server";
import { formatGhs } from "@/lib/events";

export default async function AdminOverview() {
  const supabase = getAdminClient();
  
  // Fetch live metrics
  const { data: totalRevenueData } = await supabase
    .from('orders')
    .select('total')
    .eq('payment_status', 'paid');
    
  const totalRevenue = totalRevenueData?.reduce((acc, order) => acc + Number(order.total), 0) || 0;

  const { count: ticketsSold } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'valid');

  const { count: activeEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  const { count: totalCustomers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      id,
      reference,
      customer_name,
      total,
      payment_status,
      created_at,
      events (title)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  const kpis = [
    { title: "Total Revenue", value: formatGhs(totalRevenue), icon: CreditCard, trend: "" },
    { title: "Tickets Sold", value: (ticketsSold || 0).toString(), icon: Ticket, trend: "" },
    { title: "Active Events", value: (activeEvents || 0).toString(), icon: CalendarDays, trend: "" },
    { title: "Total Customers", value: (totalCustomers || 0).toString(), icon: Users, trend: "" },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-xl font-bold font-serif mb-6">Revenue Over Time</h3>
          {/* We will leave this simple CSS-based bar chart with hardcoded proportional heights for aesthetics, but ideally this would use a chart library */}
          <div className="h-64 flex items-end gap-2 sm:gap-4 mt-8 pt-4 border-b border-border">
            {[40, 70, 45, 90, 65, 80, 100].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-border rounded-t-md group-hover:bg-primary transition-colors relative"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-primary text-white text-xs py-1 px-2 rounded transition-opacity">
                    ₵{(height * totalRevenue / 100).toFixed(0)}
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
            <span className="bg-background text-muted text-xs font-bold px-2 py-1 rounded-full border border-border">0 pending</span>
          </div>
          
          <div className="flex-1 flex flex-col gap-4 items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center text-muted mb-2">
              <AlertCircle size={24} />
            </div>
            <h4 className="font-bold text-primary">All caught up</h4>
            <p className="text-xs text-muted">No pending events or organizer verifications.</p>
          </div>
        </div>
      </div>
      
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-xl font-bold font-serif">Recent Orders</h3>
          <Link href="/admin/orders" className="text-sm font-bold hover:underline text-primary">View All</Link>
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
              {recentOrders?.map((order: any, i: number) => (
                <tr key={i} className="border-b border-border hover:bg-background transition-colors">
                  <td className="px-6 py-4 font-medium text-primary">{order.reference}</td>
                  <td className="px-6 py-4 text-primary">{order.customer_name}</td>
                  <td className="px-6 py-4 text-muted">{order.events?.title}</td>
                  <td className="px-6 py-4 font-bold text-primary">
                    {formatGhs(Number(order.total))}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-error-bg text-error'
                    }`}>
                      {order.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted">No recent orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
