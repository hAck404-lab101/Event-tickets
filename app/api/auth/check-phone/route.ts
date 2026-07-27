import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ exists: false });

    // Normalize phone (strip +)
    const normalizedPhone = phone.startsWith("+") ? phone.substring(1) : phone;
    const withPlus = `+${normalizedPhone}`;

    const supabase = getAdminClient();
    
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
       console.error("List users error:", error);
       return NextResponse.json({ exists: false });
    }

    const userExists = users.users.find(u => u.phone === phone || u.phone === normalizedPhone || u.phone === withPlus);

    return NextResponse.json({ exists: !!userExists });
  } catch (err) {
    console.error("Check phone error:", err);
    return NextResponse.json({ exists: false });
  }
}
