import { getAdminClient } from "@/lib/supabase/server";
import { Receipt, CreditCard, CalendarDays } from "lucide-react";
import Link from "next/link";
import { formatGhs } from "@/lib/events";

export default async function AdminOrdersPage() {
  const supabase = getAdminClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id, reference, customer_name, customer_email, total, payment_status, created_at,
      events(id, title)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  const totalRevenue = orders
    ?.filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + Number(o.total), 0) || 0;

  const stats = {
    total: orders?.length || 0,
    paid: orders?.filter((o) => o.payment_status === "paid").length || 0,
    pending: orders?.filter((o) => o.payment_status === "pending").length || 0,
    revenue: totalRevenue,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">All Orders</h1>
        <p className="text-muted mt-1">Platform-wide order management.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: stats.total.toString(), icon: Receipt },
          { label: "Paid Orders", value: stats.paid.toString(), icon: CreditCard },
          { label: "Pending", value: stats.pending.toString(), icon: CalendarDays },
          { label: "Total Revenue", value: formatGhs(stats.revenue), icon: CreditCard },
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-5">
            <p className="text-muted text-sm">{stat.label}</p>
            <p className="text-2xl font-bold font-serif text-primary mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold font-serif text-primary">Orders</h2>
        </div>

        {orders && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background text-sm text-muted border-b border-border">
                  <th className="px-6 py-4 font-medium">Reference</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Event</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-border">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary text-xs">{order.reference}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-primary">{order.customer_name}</p>
                      <p className="text-muted text-xs">{order.customer_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/events/${order.events?.id}`}
                        className="text-primary hover:text-accent text-sm font-medium transition-colors"
                      >
                        {order.events?.title || "—"}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">{formatGhs(Number(order.total))}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                        order.payment_status === "paid"
                          ? "bg-green-900/30 text-green-400 border border-green-800"
                          : order.payment_status === "pending"
                          ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800"
                          : "bg-red-900/30 text-red-400 border border-red-800"
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted text-sm">
                      {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <Receipt size={48} className="mx-auto text-muted mb-4 opacity-50" />
            <h3 className="text-xl font-bold font-serif text-primary mb-2">No orders yet</h3>
            <p className="text-muted">Orders will appear here as buyers purchase tickets.</p>
          </div>
        )}
      </div>
    </div>
  );
}
