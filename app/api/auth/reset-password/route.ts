import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { phone, otp, password } = await req.json();

    if (!phone || !otp || !password) {
      return NextResponse.json({ error: "Phone, OTP, and new password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
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

    // 3. Find the user
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const user = usersData.users.find(u => u.phone === phone);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 400 });
    }

    // 4. Update user's password using the admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: password,
      phone_confirm: true
    });

    if (updateError) {
      console.error("Update User Error:", updateError);
      return NextResponse.json({ error: "Failed to reset password. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
