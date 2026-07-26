import { NextResponse } from "next/server";

type CheckoutRequest = {
  eventId: string;
  eventName: string;
  ticketType: string;
  quantity: number;
  unitPrice: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequest;

    if (!body.eventId || !body.eventName || !body.ticketType) {
      return NextResponse.json({ error: "Event and ticket information is required." }, { status: 400 });
    }

    if (!Number.isInteger(body.quantity) || body.quantity < 1 || body.unitPrice <= 0) {
      return NextResponse.json({ error: "A valid ticket quantity and price are required." }, { status: 400 });
    }

    if (!body.customer?.name || !body.customer?.email || !body.customer?.phone) {
      return NextResponse.json({ error: "Customer name, email and phone are required." }, { status: 400 });
    }

    const apiUrl = process.env.INVOICE_API_URL;
    const apiKey = process.env.INVOICE_API_KEY;

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: "Invoice API is not configured yet.", code: "INVOICE_API_NOT_CONFIGURED" },
        { status: 503 },
      );
    }

    const reference = `TIX-${body.eventId}-${Date.now()}`;
    const invoiceResponse = await fetch(`${apiUrl.replace(/\/$/, "")}/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        customer: body.customer,
        items: [
          {
            name: `${body.eventName} - ${body.ticketType} ticket`,
            quantity: body.quantity,
            unit_price: body.unitPrice,
          },
        ],
        currency: "GHS",
        reference,
        metadata: {
          event_id: body.eventId,
          ticket_type: body.ticketType,
        },
      }),
      cache: "no-store",
    });

    const invoice = await invoiceResponse.json();

    if (!invoiceResponse.ok) {
      console.error("Invoice API error", invoice);
      return NextResponse.json({ error: "Unable to create invoice." }, { status: 502 });
    }

    const checkoutUrl = invoice.invoice_url ?? invoice.checkout_url ?? invoice.payment_url;
    if (!checkoutUrl) {
      return NextResponse.json({ error: "Invoice API did not return a checkout URL." }, { status: 502 });
    }

    return NextResponse.json({
      reference,
      invoiceId: invoice.invoice_id ?? invoice.id,
      invoiceNumber: invoice.invoice_number ?? invoice.number,
      checkoutUrl,
      status: invoice.status ?? "unpaid",
    });
  } catch (error) {
    console.error("Checkout error", error);
    return NextResponse.json({ error: "Unexpected checkout error." }, { status: 500 });
  }
}
