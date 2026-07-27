import { Receipt, CalendarDays } from "lucide-react";
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
      id,
      reference,
      total,
      payment_status,
      created_at,
      event:events!inner (
        title
      )
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
                <tr className="bg-background text-sm text-muted">
                  <th className="px-6 py-4 font-medium">Order Ref</th>
                  <th className="px-6 py-4 font-medium">Event</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {orders.map((order: any) => (
                  <tr key={order.id} className="border-b border-border hover:bg-background transition-colors">
                    <td className="px-6 py-4 font-medium">{order.reference}</td>
                    <td className="px-6 py-4 font-bold text-primary">{order.event?.title}</td>
                    <td className="px-6 py-4 text-muted flex items-center gap-2">
                      <CalendarDays size={14} /> {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold">{formatGhs(Number(order.total))}</td>
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
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <Receipt size={48} className="text-muted mb-4 opacity-50" />
          <h3 className="text-xl font-bold font-serif mb-2">No orders found</h3>
          <p className="text-muted mb-6">You haven't made any purchases yet.</p>
          <Link href="/events/explore" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors">
            Find Events
          </Link>
        </div>
      )}
    </div>
  );
}
