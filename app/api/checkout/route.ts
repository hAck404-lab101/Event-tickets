import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, eventTitle, ticketTypeId, ticketName, quantity, unitPrice, customerEmail, customerPhone, customerName } = body;

    // Validate request
    if (!eventId || !ticketTypeId || !quantity || !customerEmail || !customerPhone || !customerName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Mock AdronX Payment Processing
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    let formattedPhone = customerPhone.replace(/\s+/g, '').trim();
    if (formattedPhone === "+233241112222") {
      return NextResponse.json(
        { error: "Payment failed. Insufficient funds or card declined." },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Calculate totals
    const subtotal = unitPrice * quantity;
    const serviceFee = Math.round(subtotal * 0.03 * 100) / 100;
    const total = subtotal + serviceFee;
    const reference = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Try to find customer profile to link order
    let customerId = null;
    const { data: profiles } = await supabase.from('profiles').select('id').eq('phone', formattedPhone).limit(1);
    if (profiles && profiles.length > 0) {
      customerId = profiles[0].id;
    }

    // Insert Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        reference,
        customer_id: customerId,
        event_id: eventId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        subtotal,
        service_fee: serviceFee,
        discount: 0,
        total,
        payment_status: 'paid'
      })
      .select('id')
      .single();

    if (orderError || !order) {
      console.error("Order Insert Error:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Insert Order Item
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        ticket_type_id: ticketTypeId,
        quantity,
        unit_price: unitPrice
      });

    if (itemError) {
      console.error("Order Item Insert Error:", itemError);
      return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
    }

    // Generate Tickets
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticketCode = `TCK-${reference}-${i + 1}`;
      const qrPayload = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/verify/${ticketCode}`;
      
      tickets.push({
        order_id: order.id,
        ticket_type_id: ticketTypeId,
        ticket_code: ticketCode,
        qr_payload: qrPayload,
        attendee_name: customerName,
        status: 'valid'
      });
    }

    const { data: createdTickets, error: ticketsError } = await supabase
      .from('tickets')
      .insert(tickets)
      .select('id');

    if (ticketsError || !createdTickets || createdTickets.length === 0) {
      console.error("Tickets Insert Error:", ticketsError);
      return NextResponse.json({ error: "Failed to generate tickets" }, { status: 500 });
    }

    // Redirect to the first ticket's page (or an order summary if multiple, but we will redirect to the first ticket for simplicity)
    const firstTicketId = createdTickets[0].id;

    // We can also update quantity_sold on ticket_types here!
    // But we don't have an easy way without a DB function unless we read/write.
    // Let's do a simple read/write to update quantity sold.
    const { data: tType } = await supabase.from('ticket_types').select('quantity_sold').eq('id', ticketTypeId).single();
    if (tType) {
      await supabase.from('ticket_types').update({ quantity_sold: tType.quantity_sold + quantity }).eq('id', ticketTypeId);
    }

    return NextResponse.json({
      success: true,
      paymentUrl: `/events/${eventId}/tickets/${firstTicketId}`,
      invoiceId: reference,
    });

  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
