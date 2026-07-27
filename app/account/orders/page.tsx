import { Receipt, CalendarDays, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { formatGhs } from "@/lib/events";

export default async function MyOrders() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch real orders associated with the logged-in user
  const { data: ordersData } = await supabase
    .from('orders')
    .select(`
      id, reference, total, payment_status, created_at,
      events(id, title, starts_at)
    `)
    .eq('customer_id', user?.id)
    .order('created_at', { ascending: false });

  const orders = ordersData || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-serif font-bold text-primary">My Orders</h1>
        <div className="flex bg-surface border border-border rounded-lg p-1">
          <Link href="/account/tickets" className="px-4 py-1.5 rounded-md text-sm font-bold text-muted hover:text-primary">Tickets</Link>
          <Link href="/account/orders" className="px-4 py-1.5 rounded-md text-sm font-bold bg-background text-primary shadow-sm border border-border">Orders</Link>
        </div>
      </div>
      
      {orders && orders.length > 0 ? (
        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background text-sm text-muted border-b border-border">
                  <th className="px-6 py-4 font-medium">Order Ref</th>
                  <th className="px-6 py-4 font-medium">Event</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {orders.map((order: any) => (
                  <tr key={order.id} className="border-b border-border hover:bg-surface-elevated transition-colors group">
                    <td className="px-6 py-4 font-medium font-mono text-xs">{order.reference}</td>
                    <td className="px-6 py-4 font-bold text-primary">
                      {order.events ? (
                        <Link href={`/events/${order.events.id}`} className="hover:underline">
                          {order.events.title}
                        </Link>
                      ) : 'Unknown Event'}
                    </td>
                    <td className="px-6 py-4 text-muted">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} /> 
                        {order.events?.starts_at ? new Date(order.events.starts_at).toLocaleDateString() : 'TBA'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold">{formatGhs(Number(order.total))}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase inline-block ${
                        order.payment_status === 'paid' ? 'bg-primary/20 text-primary' :
                        order.payment_status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-error-bg text-error'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Link href="/account/tickets" className="text-primary hover:text-primary/80 font-bold inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         View Tickets <ArrowRight size={14} />
                       </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <Receipt size={48} className="text-muted mb-4 opacity-50" />
          <h3 className="text-xl font-bold font-serif mb-2">No orders found</h3>
          <p className="text-muted mb-6">You haven't made any purchases yet.</p>
          <Link href="/events" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors">
            Find Events
          </Link>
        </div>
      )}
    </div>
  );
}
