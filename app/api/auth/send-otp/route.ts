import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { phone, mode = "login" } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Basic regex to ensure the phone number only contains a plus sign and digits
    const phoneRegex = /^\+?[0-9]+$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number format. Please enter a valid number (e.g. +233240000000)." }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Check if user exists before sending OTP
    // Normalize phone (strip +)
    const normalizedPhone = phone.startsWith("+") ? phone.substring(1) : phone;
    const withPlus = `+${normalizedPhone}`;

    const { data: users } = await supabase.auth.admin.listUsers();
    const userExists = users.users.find(u => u.phone === phone || u.phone === normalizedPhone || u.phone === withPlus);

    if (mode === "register" && userExists) {
      return NextResponse.json({ error: "Phone number is already registered. Please log in." }, { status: 400 });
    }

    if (mode === "login" && !userExists) {
      return NextResponse.json({ error: "Account not found. Please create an account first." }, { status: 400 });
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 2. Calculate expiration (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 3. Save OTP in custom table
    const { error: dbError } = await supabase
      .from("otps")
      .insert({
        phone: phone,
        otp: otp,
        expires_at: expiresAt
      });

    if (dbError) {
      console.error("DB Error:", dbError);
      return NextResponse.json({ error: "Failed to generate OTP" }, { status: 500 });
    }

    // 4. Send SMS via G Online Sites API
    const API_KEY = process.env.GONLINESITES_API_KEY;
    const SENDER_ID = "TixlyEvents";
    const API_URL = "https://sms.gonlinesites.com/app/sms/api";

    // Strip the "+" sign if present, as some local gateways fail silently with it
    const cleanPhone = phone.startsWith("+") ? phone.substring(1) : phone;

    const params = new URLSearchParams({
      action: "send-sms",
      api_key: API_KEY as string,
      to: cleanPhone,
      from: SENDER_ID,
      sms: `Your Tixly login code is ${otp}. Do not share this with anyone.`,
    });

    const smsRes = await fetch(`${API_URL}?${params.toString()}`, {
      method: "GET",
    });

    const smsText = await smsRes.text();
    console.log("SMS API Response Status:", smsRes.status);
    console.log("SMS API Response Body:", smsText);

    if (!smsRes.ok) {
      return NextResponse.json({ error: `Failed to send SMS: ${smsRes.status} ${smsText}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
