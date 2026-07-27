import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service-role client to update DB without RLS restrictions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("DoronX Webhook received:", JSON.stringify(body));

    // Handle different DoronX webhook payload formats
    // Payload can be: { event: 'invoice.paid', data: { reference: '...', status: 'paid' } }
    // or direct: { reference: '...', status: 'paid', invoice_id: '...' }
    const eventType = body.event || body.type;
    const data = body.data || body;

    const reference = data.reference || data.order_reference || data.order_id || data.invoice_id;
    const status = (data.status || eventType || "").toLowerCase();

    if (!reference) {
      return NextResponse.json({ error: "Missing reference in webhook payload" }, { status: 400 });
    }

    // 1. Find matching order in database
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .or(`reference.eq.${reference},invoice_id.eq.${reference},id.eq.${reference}`)
      .maybeSingle();

    if (orderError || !order) {
      console.warn("Webhook: Order not found for reference:", reference);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isPaid = status.includes("paid") || status.includes("success") || status.includes("completed");
    const isFailed = status.includes("failed") || status.includes("cancel") || status.includes("declined");

    if (isPaid) {
      // 2. Mark order as paid
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "paid" })
        .eq("id", order.id);

      // 3. Generate tickets if not already generated
      const { data: existingTickets } = await supabaseAdmin
        .from("tickets")
        .select("id")
        .eq("order_id", order.id);

      if (!existingTickets || existingTickets.length === 0) {
        // Fetch order items to know ticket_type_id and quantity
        const { data: items } = await supabaseAdmin
          .from("order_items")
          .select("ticket_type_id, quantity")
          .eq("order_id", order.id);

        const newTickets = [];
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        if (items && items.length > 0) {
          for (const item of items) {
            for (let i = 0; i < item.quantity; i++) {
              const ticketCode = `TCK-${order.reference}-${i + 1}`;
              const qrPayload = `${siteUrl}/verify/${ticketCode}`;

              newTickets.push({
                order_id: order.id,
                ticket_type_id: item.ticket_type_id,
                ticket_code: ticketCode,
                qr_payload: qrPayload,
                attendee_name: order.customer_name,
                status: "valid",
              });
            }

            // Update quantity_sold on ticket_type
            const { data: tType } = await supabaseAdmin
              .from("ticket_types")
              .select("quantity_sold")
              .eq("id", item.ticket_type_id)
              .single();

            if (tType) {
              await supabaseAdmin
                .from("ticket_types")
                .update({ quantity_sold: (tType.quantity_sold || 0) + item.quantity })
                .eq("id", item.ticket_type_id);
            }
          }
        } else {
          // Fallback if no order_items record
          const ticketCode = `TCK-${order.reference}-1`;
          newTickets.push({
            order_id: order.id,
            ticket_code: ticketCode,
            qr_payload: `${siteUrl}/verify/${ticketCode}`,
            attendee_name: order.customer_name,
            status: "valid",
          });
        }

        if (newTickets.length > 0) {
          await supabaseAdmin.from("tickets").insert(newTickets);
        }
      }

      return NextResponse.json({ success: true, message: "Payment recorded and tickets generated" });
    } else if (isFailed) {
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", order.id);

      return NextResponse.json({ success: true, message: "Order status updated to failed" });
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (err: any) {
    console.error("DoronX Webhook Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "DoronX webhook listener active" });
}
