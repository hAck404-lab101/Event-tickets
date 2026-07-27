"use client";

import { useState } from "react";
import { Search, Download, Ticket } from "lucide-react";

export default function OrdersClient({ orders }: { orders: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter((order) => {
    const searchStr = `${order.reference} ${order.customer_name} ${order.customer_email}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const exportCSV = () => {
    if (orders.length === 0) return;
    const headers = ["Order Ref", "Buyer Name", "Buyer Email", "Event", "Ticket Types", "Amount", "Status", "Date"];
    const rows = orders.map(order => {
      const tickets = order.order_items?.map((item: any) => `${item.quantity}x ${item.ticket_types?.name}`).join(" | ") || "";
      return [
        order.reference,
        order.customer_name,
        order.customer_email,
        order.events?.title || "",
        tickets,
        order.total,
        order.payment_status,
        new Date(order.created_at).toLocaleString()
      ];
    });
    
    // Simple CSV escaping
    const escapeCsv = (str: any) => `"${String(str).replace(/"/g, '""')}"`;
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.map(escapeCsv).join(","), ...rows.map(row => row.map(escapeCsv).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input 
            type="text" 
            placeholder="Search by order ID, email, or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-primary"
          />
        </div>
        <button onClick={exportCSV} className="px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2 text-primary">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="border border-border rounded-xl overflow-hidden text-center py-16">
          <Ticket size={48} className="mx-auto text-muted mb-4 opacity-50" />
          <h3 className="text-xl font-bold font-serif mb-2 text-primary">No orders found</h3>
          <p className="text-muted">Once attendees start buying tickets, their orders will appear here.</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-primary">
                <th className="p-4 font-bold text-sm">Order Ref</th>
                <th className="p-4 font-bold text-sm">Buyer</th>
                <th className="p-4 font-bold text-sm">Event</th>
                <th className="p-4 font-bold text-sm">Tickets</th>
                <th className="p-4 font-bold text-sm">Amount</th>
                <th className="p-4 font-bold text-sm">Status</th>
                <th className="p-4 font-bold text-sm">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-surface/50 text-primary">
                  <td className="p-4 text-sm font-mono">{order.reference}</td>
                  <td className="p-4 text-sm">
                    <p className="font-bold">{order.customer_name}</p>
                    <p className="text-muted text-xs">{order.customer_email}</p>
                  </td>
                  <td className="p-4 text-sm">{order.events?.title}</td>
                  <td className="p-4 text-sm">
                    {order.order_items?.map((item: any, idx: number) => (
                      <div key={idx} className="text-xs">
                        {item.quantity}x {item.ticket_types?.name}
                      </div>
                    ))}
                  </td>
                  <td className="p-4 text-sm">₵{order.total}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      order.payment_status === 'paid' ? 'bg-green-900/30 text-green-400 border border-green-800' :
                      order.payment_status === 'pending' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800' :
                      'bg-red-900/30 text-red-400 border border-red-800'
                    }`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="p-4 text-sm whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
