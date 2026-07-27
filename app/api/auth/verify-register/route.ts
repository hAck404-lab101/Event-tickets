import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { phone, email, otp, password, name, role } = await req.json();

    if (!phone || !otp || !password || !name || !role || !email) {
      return NextResponse.json({ error: "Missing required signup fields" }, { status: 400 });
    }

    const supabase = getAdminClient();

    // 1. Normalize inputs
    const formattedEmail = email.trim().toLowerCase();
    const formattedPhone = phone.replace(/\s+/g, "").trim();

    // 2. Verify OTP from otps table
    const { data: otps, error: dbError } = await supabase
      .from("otps")
      .select("*")
      .or(`phone.eq.${formattedPhone},phone.eq.${phone}`)
      .eq("otp", otp.trim())
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (dbError || !otps || otps.length === 0) {
      return NextResponse.json({ error: "Invalid or expired verification code. Please check your SMS code and try again." }, { status: 400 });
    }

    // 3. Mark OTP as used
    await supabase.from("otps").delete().or(`phone.eq.${formattedPhone},phone.eq.${phone}`);

    // 4. Create User in Supabase Auth via Admin Client
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      phone: formattedPhone,
      email: formattedEmail,
      password: password,
      phone_confirm: true,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
        full_name: name.trim(),
        role: role
      }
    });

    if (createError) {
      console.error("Create User Error:", createError);
      const rawMsg = createError.message || String(createError);
      let userFriendlyMsg = rawMsg;

      if (rawMsg.includes("already registered") || rawMsg.includes("already exists")) {
        userFriendlyMsg = "An account with this email or phone number is already registered. Please log in instead.";
      }

      return NextResponse.json({ error: userFriendlyMsg }, { status: 400 });
    }

    const newUser = userData.user;

    if (newUser) {
      // 5. Split name into first and last name
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || name;
      const lastName = nameParts.slice(1).join(" ") || "";

      // 6. Upsert Profile
      await supabase.from("profiles").upsert({
        id: newUser.id,
        name: name.trim(),
        first_name: firstName,
        last_name: lastName,
        email: formattedEmail,
        phone: formattedPhone,
        role: role
      });

      // 7. If organizer, auto-create organizer record
      if (role === "organizer") {
        await supabase.from("organizers").upsert({
          owner_id: newUser.id,
          business_name: name.trim(),
          contact_email: formattedEmail,
          contact_phone: formattedPhone
        });
      }
    }

    return NextResponse.json({ success: true, message: "Account created successfully" });
  } catch (err: any) {
    console.error("Verify Register Route Error:", err);
    const msg = err?.message || (typeof err === "string" ? err : "Verification failed. Please try again.");
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
