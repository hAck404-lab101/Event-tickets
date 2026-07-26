import { CreditCard } from "lucide-react";
import Link from "next/link";

export default async function AccountOrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-primary">Order History</h1>
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-background text-muted uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl">Order Ref</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 rounded-tr-2xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-background/50 transition-colors">
                <td className="px-6 py-4 font-bold text-primary">#ORD-9128</td>
                <td className="px-6 py-4 font-bold">Accra Tech Summit 2026</td>
                <td className="px-6 py-4 text-muted font-medium">Oct 12, 2026</td>
                <td className="px-6 py-4 font-bold">₵ 450.00</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Completed</span>
                </td>
              </tr>
              <tr className="hover:bg-background/50 transition-colors">
                <td className="px-6 py-4 font-bold text-primary">#ORD-8432</td>
                <td className="px-6 py-4 font-bold">Detty December Concert</td>
                <td className="px-6 py-4 text-muted font-medium">Dec 24, 2025</td>
                <td className="px-6 py-4 font-bold">₵ 120.00</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Completed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
