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

    // 3. Initiate DoronX Smart Invoicing API Call directly
    const doronxApiKey = process.env.DORONX_API_KEY || "drx_live_de491229fa84aaa33702feeaeb32bca3e2e450b724fc3712d5242b6eec42eacc";
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const callbackUrl = `${origin}/payment/pending?reference=${reference}`;
    const webhookUrl = `${origin}/api/webhooks/doronx`;

    let checkoutUrl: string | null = null;
    let invoiceId: string | null = null;

    const endpoint = "https://webapi.doronpay.com/smart-invoicing/invoices";
    const assetType = paymentMethod === "crypto" ? "USDT" : "GHS";
    const networkType = paymentMethod === "crypto" ? "TRC20" : "BEP20";

    try {
      const invoiceRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-doronpay-api-key": doronxApiKey,
          "Authorization": `Bearer ${doronxApiKey}`,
        },
        body: JSON.stringify({
          asset: assetType,
          network: networkType,
          amount: total,
          currency: "GHS",
          reference: reference,
          callback_url: callbackUrl,
          webhook_url: webhookUrl,
        }),
      });

      const invoiceData = await invoiceRes.json();
      console.log("DoronX Direct Invoice API Status:", invoiceRes.status, "Response:", invoiceData);

      if (invoiceRes.ok && invoiceData) {
        checkoutUrl =
          invoiceData.invoice_url ||
          invoiceData.checkout_url ||
          invoiceData.payment_url ||
          invoiceData.url ||
          invoiceData.data?.url ||
          invoiceData.data?.invoice_url;

        invoiceId = invoiceData.invoice_id || invoiceData.id || invoiceData.data?.id || null;

        if (invoiceId) {
          await supabaseAdmin.from("orders").update({ invoice_id: invoiceId }).eq("id", order.id);
        }
      }
    } catch (doronxErr) {
      console.warn("DoronX direct API fetch error:", doronxErr);
    }

    // 4. Redirect to DoronX checkout portal if generated, otherwise to /payment/pending?reference=TX-...
    const finalUrl = checkoutUrl || callbackUrl;

    return NextResponse.json({
      success: true,
      paymentUrl: finalUrl,
      reference,
      orderId: order.id,
      hasDirectInvoice: !!checkoutUrl,
    });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
