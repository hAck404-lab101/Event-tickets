import { NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketTypeId, quantity, customerEmail, customerPhone, customerName } = body;

    // Validate request
    if (!ticketTypeId || !quantity || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to DoronX API for smart invoicing
    const DORONX_API_KEY = process.env.DORONX_API_KEY;
    const DORONX_API_URL = process.env.DORONX_API_URL || "https://api.doronx.com/v1";

    if (!DORONX_API_KEY) {
      console.warn("DoronX API key missing. Mocking checkout response for development.");
      // For development, mock a successful DoronX invoice creation
      
      // Simulate sending SMS if phone is provided
      if (customerPhone) {
        await sendSMS(
          customerPhone, 
          `Hi ${customerName || 'there'}, your order for ${quantity} ticket(s) is confirmed! Thanks for using Tixly.`
        );
      }
      
      return NextResponse.json({
        success: true,
        paymentUrl: "https://doronx.com/pay/mock-invoice-12345",
        invoiceId: "mock-invoice-12345",
        message: "Invoice created successfully (Mock Mode)",
      });
    }

    // Production DoronX Integration
    // Based on standard API structures for DoronX Invoice creation
    const doronxResponse = await fetch(`${DORONX_API_URL}/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DORONX_API_KEY}`
      },
      body: JSON.stringify({
        payerName: customerName || "Guest User",
        payerEmail: customerEmail,
        payerPhone: customerPhone || "",
        amount: 150.00 * quantity,
        currency: "GHS",
        description: `Tixly Event Ticket - ${quantity}x`,
      })
    });

    if (!doronxResponse.ok) {
      const errorData = await doronxResponse.text();
      console.error("DoronX API Error:", errorData);
      return NextResponse.json(
        { error: "Payment gateway error. Please try again." },
        { status: 502 }
      );
    }

    const responseJson = await doronxResponse.json();
    const invoiceData = responseJson.data;

    // After invoice creation, send an SMS with the payment link if a phone number exists
    if (customerPhone && invoiceData?.paymentUrl) {
      await sendSMS(
        customerPhone,
        `Hi ${customerName || 'there'}, complete your Tixly ticket purchase securely here: ${invoiceData.paymentUrl}`
      );
    }

    return NextResponse.json({
      success: true,
      paymentUrl: invoiceData?.paymentUrl,
      invoiceId: invoiceData?.invoice?.invoiceId,
    });

  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
