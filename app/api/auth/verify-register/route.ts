import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, email, otp, password, name, role } = body || {};

    if (!phone || !otp || !password || !name || !role || !email) {
      return NextResponse.json(
        { error: "Please fill in all required fields (Name, Email, Phone, Password, Role, OTP)." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // 1. Normalize inputs
    const formattedEmail = String(email).trim().toLowerCase();
    const rawPhone = String(phone).trim();
    const cleanPhoneDigits = rawPhone.replace(/\D/g, "");
    const formattedPhone = rawPhone.startsWith("+") ? rawPhone : `+${cleanPhoneDigits}`;

    // Candidate phone values to match otps table
    const candidatePhones = Array.from(
      new Set([rawPhone, formattedPhone, cleanPhoneDigits, `+${cleanPhoneDigits}`])
    );

    // 2. Verify OTP from otps table
    const { data: otps, error: dbError } = await supabase
      .from("otps")
      .select("*")
      .in("phone", candidatePhones)
      .eq("otp", String(otp).trim())
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (dbError) {
      console.error("DB Error verifying OTP:", dbError);
      return NextResponse.json(
        { error: "Database error checking code. Please click 'Resend Code' and try again." },
        { status: 500 }
      );
    }

    if (!otps || otps.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired 6-digit code. Please check your SMS and try again." },
        { status: 400 }
      );
    }

    // 3. Delete used OTPs for candidate phones
    await supabase.from("otps").delete().in("phone", candidatePhones);

    // 4. Create User in Supabase Auth via Admin Client
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      phone: formattedPhone,
      email: formattedEmail,
      password: String(password),
      phone_confirm: true,
      email_confirm: true,
      user_metadata: {
        name: String(name).trim(),
        full_name: String(name).trim(),
        role: role,
      },
    });

    if (createError) {
      console.error("Create User Error:", createError);
      const rawMsg = createError.message || String(createError);
      let userFriendlyMsg = rawMsg;

      if (rawMsg.includes("already registered") || rawMsg.includes("already exists") || rawMsg.includes("unique")) {
        userFriendlyMsg = "An account with this email address or phone number is already registered. Please log in.";
      }

      return NextResponse.json({ error: userFriendlyMsg }, { status: 400 });
    }

    const newUser = userData.user;

    if (newUser) {
      const trimmedName = String(name).trim();
      const nameParts = trimmedName.split(" ");
      const firstName = nameParts[0] || trimmedName;
      const lastName = nameParts.slice(1).join(" ") || "";

      // Upsert Profile
      await supabase.from("profiles").upsert({
        id: newUser.id,
        name: trimmedName,
        first_name: firstName,
        last_name: lastName,
        email: formattedEmail,
        phone: formattedPhone,
        role: role,
      });

      // If organizer, auto-create organizer record
      if (role === "organizer") {
        await supabase.from("organizers").upsert({
          owner_id: newUser.id,
          business_name: trimmedName,
          contact_email: formattedEmail,
          contact_phone: formattedPhone,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
    });
  } catch (err: any) {
    console.error("Verify Register Route Catch Error:", err);
    const msg =
      typeof err === "string"
        ? err
        : err?.message || "An unexpected error occurred during account creation. Please try again.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
