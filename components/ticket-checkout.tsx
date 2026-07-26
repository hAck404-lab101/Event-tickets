"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, Minus, Plus } from "lucide-react";
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
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          eventTitle: event.title,
          ticketTypeId: ticket.id,
          ticketName: ticket.name,
          quantity,
          unitPrice: ticket.price,
          customer
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to start checkout");
      window.location.href = result.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout");
      setLoading(false);
    }
  }

  return (
    <form className="checkout-card" onSubmit={handleCheckout}>
      <div>
        <p className="eyebrow">Choose your ticket</p>
        <h2>Reserve your spot</h2>
      </div>

      <div className="ticket-options">
        {event.ticketTypes.map((item) => (
          <button
            type="button"
            key={item.id}
            className={ticketId === item.id ? "ticket-option selected" : "ticket-option"}
            onClick={() => { setTicketId(item.id); setQuantity(1); }}
          >
            <span><strong>{item.name}</strong><small>{item.description}</small></span>
            <strong>{formatGhs(item.price)}</strong>
          </button>
        ))}
      </div>

      <div className="quantity-row">
        <span><strong>Quantity</strong><small>Maximum 10 tickets</small></span>
        <div className="stepper">
          <button type="button" aria-label="Reduce quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))}><Minus size={17} /></button>
          <strong>{quantity}</strong>
          <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((q) => Math.min(10, q + 1))}><Plus size={17} /></button>
        </div>
      </div>

      <div className="customer-grid">
        <label>Full name<input required value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Ama Mensah" /></label>
        <label>Email<input required type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="ama@example.com" /></label>
        <label>Phone number<input required value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="+233 24 000 0000" /></label>
      </div>

      <div className="summary-lines">
        <p><span>Tickets</span><strong>{formatGhs(subtotal)}</strong></p>
        <p><span>Service fee</span><strong>{formatGhs(serviceFee)}</strong></p>
        <p className="total"><span>Total</span><strong>{formatGhs(total)}</strong></p>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="pay-button" disabled={loading}>
        {loading ? <><LoaderCircle className="spin" size={19} /> Creating invoice...</> : `Pay ${formatGhs(total)}`}
      </button>
      <small className="secure-note">You will be redirected to the secure invoice checkout page.</small>
    </form>
  );
}
