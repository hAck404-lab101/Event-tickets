import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 });
    }

    const supabase = createServerClient();

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

    // 2. Mark OTP as used by deleting it (or all otps for this phone)
    await supabase.from("otps").delete().eq("phone", phone);

    // 3. Find the user
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const user = usersData.users.find(u => u.phone === phone);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 400 });
    }

    // 4. Generate a one-time random password
    const temporaryPassword = crypto.randomUUID() + crypto.randomUUID();

    // 5. Update user's password using the admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: temporaryPassword,
      phone_confirm: true
    });

    if (updateError) {
      console.error("Update User Error:", updateError);
      return NextResponse.json({ error: "Failed to authenticate user" }, { status: 500 });
    }

    // 6. Return the temporary password securely to the client
    // The client will immediately use this to login via signInWithPassword!
    return NextResponse.json({ success: true, password: temporaryPassword });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
