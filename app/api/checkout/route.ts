import { NextResponse } from "next/server";
import { createServerClient, getAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      eventId,
      eventTitle,
      ticketTypeId,
      ticketName,
      quantity,
      unitPrice,
      paymentMethod = "momo",
      customerEmail,
      customerPhone,
      customerName,
    } = body;

    // Validate request
    if (!eventId || !ticketTypeId || !quantity || !customerEmail || !customerPhone || !customerName) {
      return NextResponse.json(
        { error: "Missing required fields for checkout (Name, Email, Phone, Ticket details)." },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const supabaseAdmin = getAdminClient();

    // Check if customer is authenticated
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    let user = null;

    if (token) {
      const { data: authData } = await supabase.auth.getUser(token);
      user = authData?.user || null;
    }

    if (!user) {
      const { data: currentAuth } = await supabase.auth.getUser();
      user = currentAuth?.user || null;
    }

    let customerId = user?.id || null;
    const formattedEmail = customerEmail.trim().toLowerCase();
    const formattedPhone = customerPhone.replace(/\s+/g, "").trim();

    // Link profile by email or phone if customerId isn't set
    if (!customerId) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .or(`email.ilike.${formattedEmail},phone.eq.${formattedPhone}`)
        .maybeSingle();

      if (profile) {
        customerId = profile.id;
      }
    }

    // Calculate totals
    const subtotal = Number(unitPrice) * Number(quantity);
    const serviceFee = Math.round(subtotal * 0.03 * 100) / 100;
    const total = subtotal + serviceFee;
    const reference = `TX-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // 1. Insert Order with initial 'pending' status
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        reference,
        customer_id: customerId,
        event_id: eventId,
        customer_name: customerName.trim(),
        customer_email: formattedEmail,
        customer_phone: formattedPhone,
        subtotal,
        service_fee: serviceFee,
        discount: 0,
        total,
        payment_status: "pending",
      })
      .select("id, reference")
      .single();

    if (orderError || !order) {
      console.error("Order Insert Error:", orderError);
      return NextResponse.json({ error: "Failed to create pending order" }, { status: 500 });
    }

    // 2. Insert Order Items
    const { error: itemError } = await supabaseAdmin.from("order_items").insert({
      order_id: order.id,
      ticket_type_id: ticketTypeId,
      quantity,
      unit_price: unitPrice,
    });

    if (itemError) {
      console.error("Order Item Insert Error:", itemError);
    }

    // 3. Initiate DoronX Smart Invoicing API Call
    const doronxApiUrl = process.env.DORONX_API_URL || "https://webapi.doronpay.com";
    const doronxApiKey = process.env.DORONX_API_KEY;

    let checkoutUrl: string | null = null;
    let invoiceId: string | null = null;

    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const callbackUrl = `${origin}/payment/pending?reference=${reference}`;
    const webhookUrl = `${origin}/api/webhooks/doronx`;

    if (doronxApiKey) {
      const endpointsToTry = [
        `${doronxApiUrl.replace(/\/$/, "")}/smart-invoicing`,
        `${doronxApiUrl.replace(/\/$/, "")}/v1/invoices`,
        `https://webapi.doronpay.com/smart-invoicing`,
      ];

      for (const endpoint of endpointsToTry) {
        if (checkoutUrl) break;
        try {
          const invoiceRes = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${doronxApiKey}`,
              "x-api-key": doronxApiKey,
            },
            body: JSON.stringify({
              customer: {
                name: customerName.trim(),
                email: formattedEmail,
                phone: formattedPhone,
              },
              items: [
                {
                  name: `${ticketName} - ${eventTitle || "Event Ticket"}`,
                  quantity,
                  unit_price: unitPrice,
                },
              ],
              amount: total,
              currency: "GHS",
              reference,
              payment_method: paymentMethod, // 'momo' or 'crypto'
              callback_url: callbackUrl,
              webhook_url: webhookUrl,
            }),
          });

          if (invoiceRes.ok) {
            const invoiceData = await invoiceRes.json();
            checkoutUrl =
              invoiceData.invoice_url ||
              invoiceData.checkout_url ||
              invoiceData.payment_url ||
              invoiceData.url ||
              invoiceData.data?.url;
            invoiceId = invoiceData.invoice_id || invoiceData.id || invoiceData.data?.id || null;

            if (invoiceId) {
              await supabaseAdmin.from("orders").update({ invoice_id: invoiceId }).eq("id", order.id);
            }
          }
        } catch (doronxErr) {
          console.warn(`DoronX fetch to ${endpoint} failed:`, doronxErr);
        }
      }
    }

    // 4. Return checkout URL if available, otherwise redirect to pending page with order reference
    // Order strictly remains in 'pending' status until verified by DoronX webhook
    const finalUrl = checkoutUrl || callbackUrl;

    return NextResponse.json({
      success: true,
      paymentUrl: finalUrl,
      reference,
      orderId: order.id,
      pending: !checkoutUrl,
    });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
