import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

function orderReference() {
  return `TIX-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, eventTitle, ticketTypeId, ticketName, quantity, unitPrice, customer } = body;

    if (!eventId || !eventTitle || !ticketTypeId || !ticketName) {
      return NextResponse.json({ error: "Incomplete ticket information" }, { status: 400 });
    }

    if (!customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json({ error: "Name, email and phone number are required" }, { status: 400 });
    }

    const safeQuantity = Number(quantity);
    const safeUnitPrice = Number(unitPrice);
    if (!Number.isInteger(safeQuantity) || safeQuantity < 1 || safeQuantity > 10 || !Number.isFinite(safeUnitPrice) || safeUnitPrice < 0) {
      return NextResponse.json({ error: "Invalid ticket quantity or price" }, { status: 400 });
    }

    const reference = orderReference();
    const subtotal = safeUnitPrice * safeQuantity;
    const serviceFee = Math.round(subtotal * 0.03 * 100) / 100;
    const total = subtotal + serviceFee;
    const supabase = createServerClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        reference,
        event_slug: eventId,
        ticket_type_id: ticketTypeId,
        ticket_name: ticketName,
        quantity: safeQuantity,
        unit_price: safeUnitPrice,
        subtotal,
        service_fee: serviceFee,
        total,
        customer_name: customer.name.trim(),
        customer_email: customer.email.trim().toLowerCase(),
        customer_phone: customer.phone.trim(),
        payment_status: "pending"
      })
      .select("id, reference")
      .single();

    if (orderError) throw orderError;

    const invoiceApiUrl = process.env.INVOICE_API_URL;
    const invoiceApiKey = process.env.INVOICE_API_KEY;

    if (!invoiceApiUrl || !invoiceApiKey) {
      await supabase.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
      return NextResponse.json({ error: "Invoice API is not configured yet" }, { status: 503 });
    }

    const callbackBase = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const invoiceResponse = await fetch(invoiceApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${invoiceApiKey}`
      },
      body: JSON.stringify({
        customer: {
          name: customer.name.trim(),
          email: customer.email.trim().toLowerCase(),
          phone: customer.phone.trim()
        },
        items: [{
          name: `${ticketName} - ${eventTitle}`,
          quantity: safeQuantity,
          unit_price: safeUnitPrice
        }],
        service_fee: serviceFee,
        amount: total,
        currency: "GHS",
        reference,
        callback_url: `${callbackBase}/payment/callback?reference=${reference}`
      }),
      cache: "no-store"
    });

    const invoice = await invoiceResponse.json();
    if (!invoiceResponse.ok) {
      await supabase.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
      return NextResponse.json({ error: invoice.message || "Invoice creation failed" }, { status: 502 });
    }

    const checkoutUrl = invoice.invoice_url || invoice.checkout_url || invoice.payment_url || invoice.url;
    if (!checkoutUrl) throw new Error("Invoice API did not return a checkout URL");

    await supabase.from("orders").update({
      invoice_id: invoice.invoice_id || invoice.id || null,
      invoice_number: invoice.invoice_number || invoice.number || null,
      invoice_url: checkoutUrl
    }).eq("id", order.id);

    return NextResponse.json({ orderId: order.id, reference, checkoutUrl });
  } catch (error) {
    console.error("Order creation error", error);
    return NextResponse.json({ error: "Unable to create ticket order" }, { status: 500 });
  }
}
