import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");
    const orderId = searchParams.get("orderId");

    if (!reference && !orderId) {
      return NextResponse.json({ error: "Reference or Order ID is required" }, { status: 400 });
    }

    const adminSupabase = getAdminClient();
    const query = adminSupabase
      .from("orders")
      .select(`
        id, reference, total, subtotal, service_fee, payment_status, customer_name, customer_email, customer_phone, created_at,
        events(id, title, banner_url, city, starts_at)
      `);

    if (reference) query.eq("reference", reference);
    else if (orderId) query.eq("id", orderId);

    const { data: order, error } = await query.maybeSingle();

    if (error) {
      console.error("Order lookup error:", error);
      return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: any) {
    console.error("Orders API route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
