import { CreditCard } from "lucide-react";
import Link from "next/link";

export default async function AccountOrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-primary">Order History</h1>
      <div className="bg-surface border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center">
        <CreditCard size={48} className="text-muted mb-4 opacity-50" />
        <h3 className="text-xl font-bold font-serif mb-2">No orders found</h3>
        <p className="text-muted mb-6">You haven't made any purchases yet.</p>
        <Link href="/events/explore" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors">
          Browse Events
        </Link>
      </div>
    </div>
  );
}
