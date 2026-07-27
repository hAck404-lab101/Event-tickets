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
      paymentMethod = "crypto",
      cryptoAsset = "USDT",
      cryptoNetwork = "TRC20",
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

    // 3. Direct Invoice Call on DoronX API (https://webapi.doronpay.com/smart-invoicing/invoices)
    const doronxApiKey = process.env.DORONX_API_KEY || "drx_live_6106b6e78d21eac22972e7a148b0b2accc304fbcd8f9a724497870f958b7783f";
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const callbackUrl = `${origin}/payment/pending?reference=${reference}`;

    let checkoutUrl: string | null = null;
    let invoiceId: string | null = null;
    let referenceCode: string | null = null;
    let doronxErrorMsg: string | null = null;

    const endpoint = "https://webapi.doronpay.com/smart-invoicing/invoices";

    try {
      const invoiceRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-doronpay-api-key": doronxApiKey,
        },
        body: JSON.stringify({
          payerName: customerName.trim(),
          payerEmail: formattedEmail,
          payerPhone: formattedPhone,
          amount: total,
          currency: "GHS",
          asset: cryptoAsset, // 'USDT' or 'BTC'
          network: cryptoNetwork, // 'TRC20', 'SOLANA', etc.
          description: `${quantity}x ${ticketName} - ${eventTitle || "Event Ticket"} (${reference})`,
          forceRateRefresh: true,
        }),
      });

      const invoiceData = await invoiceRes.json();
      console.log("DoronX Smart Invoice API Status:", invoiceRes.status, "Response:", invoiceData);

      if (invoiceRes.ok && invoiceData) {
        const inv = invoiceData.data?.invoice || invoiceData.invoice || invoiceData.data || invoiceData;
        referenceCode = inv.referenceCode || inv.reference_code || null;
        invoiceId = inv._id || inv.invoiceId || inv.id || null;

        checkoutUrl =
          inv.paymentUrl ||
          inv.checkout_url ||
          inv.checkoutUrl ||
          inv.invoice_url ||
          inv.invoiceUrl ||
          inv.hosted_url ||
          inv.url ||
          (referenceCode ? `https://pay.doronx.com/sikaflow/i/${referenceCode}` : null) ||
          (invoiceId ? `https://app.doronx.com/#/invoices/${invoiceId}` : null);
      } else {
        doronxErrorMsg = invoiceData?.message || invoiceData?.error || null;
      }
    } catch (doronxErr: any) {
      console.warn("DoronX invoice API fetch error:", doronxErr);
      doronxErrorMsg = doronxErr.message || "Network error connecting to DoronX";
    }

    // 4. Automatic Invoice Lookup Fallback if URL wasn't directly returned in body
    if (!checkoutUrl) {
      try {
        const listRes = await fetch(`${endpoint}?limit=5`, {
          headers: { "x-doronpay-api-key": doronxApiKey },
        });
        const listData = await listRes.json();

        if (listRes.ok && listData?.data && Array.isArray(listData.data)) {
          const matched = listData.data.find((inv: any) =>
            (inv.description && inv.description.includes(reference)) ||
            (inv.payerEmail && inv.payerEmail.toLowerCase() === formattedEmail)
          ) || listData.data[0];

          if (matched) {
            invoiceId = matched._id || matched.invoiceId || matched.id || null;
            referenceCode = matched.referenceCode || matched.reference_code || null;
            checkoutUrl =
              matched.paymentUrl ||
              matched.checkout_url ||
              matched.invoice_url ||
              matched.url ||
              (referenceCode ? `https://pay.doronx.com/sikaflow/i/${referenceCode}` : null) ||
              (matched._id ? `https://app.doronx.com/#/invoices/${matched._id}` : null);
          }
        }
      } catch (listErr) {
        console.warn("Could not auto-fetch created invoice fallback:", listErr);
      }
    }

    // Save invoice_id to Supabase order if found
    if (invoiceId) {
      await supabaseAdmin.from("orders").update({ invoice_id: invoiceId }).eq("id", order.id);
    }

    // 5. Return Direct DoronX Pay Link (`https://pay.doronx.com/sikaflow/i/DRXREF...`) or Pending Fallback URL
    const finalUrl = checkoutUrl || callbackUrl;

    return NextResponse.json({
      success: true,
      paymentUrl: finalUrl,
      directCheckoutUrl: checkoutUrl,
      pendingUrl: callbackUrl,
      reference,
      referenceCode,
      orderId: order.id,
      hasDirectInvoice: !!checkoutUrl,
      doronxError: doronxErrorMsg,
    });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
