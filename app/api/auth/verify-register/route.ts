import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { phone, email, otp, password, name, role } = await req.json();

    if (!phone || !otp || !password || !name || !role || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = getAdminClient();

    // 1. Verify OTP from custom table
    const { data: otps, error: dbError } = await supabase
      .from("otps")
      .select("*")
      .eq("phone", phone)
      .eq("otp", otp)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (dbError || !otps || otps.length === 0) {
      return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
    }

    // 2. Mark OTP as used by deleting it
    await supabase.from("otps").delete().eq("phone", phone);

    // 3. Create the user permanently
    const { error: createError } = await supabase.auth.admin.createUser({
      phone: phone,
      email: email,
      password: password,
      phone_confirm: true,
      email_confirm: true,
      user_metadata: {
        name: name,
        role: role
      }
    });

    if (createError) {
      console.error("Create User Error:", createError);
      const errorMessage = typeof createError === 'object' && createError !== null && 'message' in createError 
        ? (createError as any).message 
        : typeof createError === 'string' ? createError : "Failed to create user account. It may already exist.";
        
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
