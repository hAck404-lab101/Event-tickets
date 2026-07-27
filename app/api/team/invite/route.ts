import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/team/invite — invite a team member
export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, full_name, role } = await req.json();
    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }

    // Get organizer
    const { data: organizer } = await supabaseAdmin
      .from("organizers")
      .select("id, business_name")
      .eq("owner_id", user.id)
      .single();

    if (!organizer) {
      return NextResponse.json({ error: "Organizer profile not found" }, { status: 404 });
    }

    // Check if invitation already exists
    const { data: existing } = await supabaseAdmin
      .from("team_invitations")
      .select("id, status")
      .eq("organizer_id", organizer.id)
      .eq("email", email.toLowerCase())
      .eq("status", "pending")
      .single();

    if (existing) {
      return NextResponse.json({ error: "An invitation for this email is already pending" }, { status: 409 });
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from("team_invitations")
      .insert({
        organizer_id: organizer.id,
        invited_by: user.id,
        email: email.toLowerCase(),
        full_name,
        role,
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Invite error:", inviteError);
      return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
    }

    return NextResponse.json({ success: true, invitation });
  } catch (err: any) {
    console.error("Team invite error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/team/invite — list invitations for the organizer
export async function GET(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: organizer } = await supabaseAdmin
      .from("organizers")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!organizer) {
      return NextResponse.json({ invitations: [] });
    }

    const { data: invitations } = await supabaseAdmin
      .from("team_invitations")
      .select("*")
      .eq("organizer_id", organizer.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ invitations: invitations || [] });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
