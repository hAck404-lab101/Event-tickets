"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, Minus, Plus, Coins } from "lucide-react";
import type { Event } from "@/lib/events";
import { formatGhs } from "@/lib/events";

type Props = { event: Event };

export default function TicketCheckout({ event }: Props) {
  const [ticketId, setTicketId] = useState(event.ticketTypes[0].id);
  const [quantity, setQuantity] = useState(1);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ticket = event.ticketTypes.find((item) => item.id === ticketId) ?? event.ticketTypes[0];
  const subtotal = ticket.price * quantity;
  const serviceFee = useMemo(() => Math.round(subtotal * 0.03 * 100) / 100, [subtotal]);
  const total = subtotal + serviceFee;

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          eventTitle: event.title,
          ticketTypeId: ticket.id,
          ticketName: ticket.name,
          quantity,
          unitPrice: ticket.price,
          paymentMethod: "crypto",
          customerEmail: customer.email,
          customerPhone: customer.phone,
          customerName: customer.name
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to start checkout");
      window.location.href = result.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout");
      setLoading(false);
    }
  }

  return (
    <form className="bg-surface p-6 sm:p-8 rounded-[2rem] border border-border shadow-2xl" onSubmit={handleCheckout}>
      <div className="mb-8">
        <p className="text-accent text-sm font-bold uppercase tracking-wider mb-2">Choose your ticket</p>
        <h2 className="text-3xl font-serif font-bold text-primary">Reserve your spot</h2>
      </div>

      <div className="space-y-3 mb-8">
        {event.ticketTypes.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex justify-between items-center ${
              ticketId === item.id 
                ? "border-primary bg-primary/5 ring-1 ring-primary" 
                : "border-border bg-background hover:border-primary/40"
            }`}
            onClick={() => { setTicketId(item.id); setQuantity(1); }}
          >
            <div>
              <strong className="block text-primary font-bold mb-1">{item.name}</strong>
              <small className="block text-muted">{item.description}</small>
            </div>
            <strong className="text-lg text-primary">{formatGhs(item.price)}</strong>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between py-5 border-y border-border mb-8">
        <div>
          <strong className="block text-primary">Quantity</strong>
          <small className="text-muted text-sm">Maximum 10 tickets</small>
        </div>
        <div className="flex items-center gap-4 bg-background border border-border rounded-xl p-1">
          <button 
            type="button" 
            aria-label="Reduce quantity" 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-primary hover:bg-surface disabled:opacity-50"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            <Minus size={18} />
          </button>
          <strong className="text-lg w-4 text-center text-primary">{quantity}</strong>
          <button 
            type="button" 
            aria-label="Increase quantity" 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-primary hover:bg-surface disabled:opacity-50"
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            disabled={quantity >= 10}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Payment Method Display */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-primary mb-3">Payment Method</label>
        <div className="p-4 rounded-xl border border-primary bg-primary/10 text-primary flex items-center gap-3 font-bold text-sm">
          <Coins size={20} className="text-accent" />
          <div>
            <p>Crypto Payment (DoronX Smart Invoice)</p>
            <p className="text-xs text-muted font-normal mt-0.5">Pay with USDT / USDC / BTC / ETH</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-bold text-primary mb-2">Full name</label>
          <input 
            required 
            value={customer.name} 
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })} 
            placeholder="Ama Mensah" 
            className="w-full bg-background border border-border rounded-xl p-3.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-primary placeholder:text-muted/60"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-primary mb-2">Email</label>
          <input 
            required 
            type="email" 
            value={customer.email} 
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })} 
            placeholder="ama@example.com" 
            className="w-full bg-background border border-border rounded-xl p-3.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-primary placeholder:text-muted/60"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-primary mb-2">Phone number</label>
          <input 
            required 
            value={customer.phone} 
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} 
            placeholder="+233 24 000 0000" 
            className="w-full bg-background border border-border rounded-xl p-3.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-primary placeholder:text-muted/60"
          />
        </div>
      </div>

      <div className="border-t border-border pt-6 space-y-3 mb-8">
        <p className="flex justify-between text-muted font-medium">
          <span>Tickets</span>
          <strong className="text-primary">{formatGhs(subtotal)}</strong>
        </p>
        <p className="flex justify-between text-muted font-medium pb-4 border-b border-border">
          <span>Service fee</span>
          <strong className="text-primary">{formatGhs(serviceFee)}</strong>
        </p>
        <p className="flex justify-between items-center pt-2">
          <span className="text-primary font-bold">Total</span>
          <strong className="text-2xl font-serif text-primary">{formatGhs(total)}</strong>
        </p>
      </div>

      {error && <p className="bg-error-bg text-error p-4 rounded-xl text-sm font-medium mb-6" role="alert">{error}</p>}
      
      <button 
        className="w-full bg-primary text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed" 
        disabled={loading}
      >
        {loading ? (
          <><LoaderCircle className="animate-spin" size={20} /> Processing...</>
        ) : (
          `Pay ${formatGhs(total)} via Crypto (DoronX)`
        )}
      </button>
      <p className="text-center text-muted text-xs font-medium mt-4">
        You will be redirected to the secure DoronX Crypto Smart Invoice checkout page (USDT / BTC).
      </p>
    </form>
  );
}
