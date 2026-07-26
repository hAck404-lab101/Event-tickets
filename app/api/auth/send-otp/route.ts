import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Generate 6-digit OTP
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

    const params = new URLSearchParams({
      action: "send-sms",
      api_key: API_KEY as string,
      to: phone,
      from: SENDER_ID,
      sms: `Your Tixly login code is ${otp}. Do not share this with anyone.`,
    });

    const smsRes = await fetch(`${API_URL}?${params.toString()}`, {
      method: "GET",
    });

    if (!smsRes.ok) {
      return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
    }

    // 5. We also need to ensure the user exists in Supabase Auth so they can log in later!
    // Supabase allows creating a user if they don't exist.
    // We can list users, if not found, create one.
    const { data: users } = await supabase.auth.admin.listUsers();
    const userExists = users.users.find(u => u.phone === phone);
    
    if (!userExists) {
       // Create dummy user. Password will be reset on verification.
       await supabase.auth.admin.createUser({
          phone: phone,
          password: crypto.randomUUID(), // Temp password
          phone_confirm: true // Force confirm
       });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
