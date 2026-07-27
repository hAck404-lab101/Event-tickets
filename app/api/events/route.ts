import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

// Service-role client to bypass RLS for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();

    // Authenticate user via token from client
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    let { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (!user) {
      const { data: currentAuth } = await supabase.auth.getUser();
      user = currentAuth.user;
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in to create an event." }, { status: 401 });
    }

    const payload = await req.json();
    const { title, description, category_id, banner_url, starts_at, ends_at, city, venue_name, tickets } = payload;

    if (!title || !description || !starts_at || !city || !tickets || tickets.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Get or auto-create organizer profile for this user
    let { data: organizer } = await supabaseAdmin
      .from("organizers")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!organizer) {
      const defaultName =
        user.user_metadata?.business_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "My Organization";

      const { data: newOrg, error: newOrgErr } = await supabaseAdmin
        .from("organizers")
        .insert({
          owner_id: user.id,
          business_name: defaultName,
          contact_email: user.email,
        })
        .select("id")
        .single();

      if (newOrgErr || !newOrg) {
        console.error("Failed to auto-create organizer profile:", newOrgErr);
        return NextResponse.json({ error: "Could not initialize organizer profile." }, { status: 500 });
      }
      organizer = newOrg;
    }

    // 2. Handle image - if it's a base64 string, upload to Supabase Storage
    let finalBannerUrl: string | null = null;
    if (banner_url) {
      if (banner_url.startsWith("data:image")) {
        try {
          const base64Data = banner_url.split(",")[1];
          const buffer = Buffer.from(base64Data, "base64");
          const ext = banner_url.split(";")[0].split("/")[1] || "jpg";
          const fileName = `events/${organizer.id}/${Date.now()}.${ext}`;

          const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from("event-banners")
            .upload(fileName, buffer, { contentType: `image/${ext}`, upsert: true });

          if (!uploadError && uploadData) {
            const { data: urlData } = supabaseAdmin.storage
              .from("event-banners")
              .getPublicUrl(uploadData.path);
            finalBannerUrl = urlData.publicUrl;
          } else {
            console.warn("Banner upload failed, skipping:", uploadError?.message);
          }
        } catch (e) {
          console.warn("Error processing banner upload:", e);
        }
      } else if (banner_url.startsWith("http")) {
        finalBannerUrl = banner_url;
      }
    }

    // 3. Generate Event Slug
    const eventSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

    // 4. Insert Event using admin client
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .insert({
        title,
        description,
        slug: eventSlug,
        category_id: category_id || null,
        banner_url: finalBannerUrl,
        starts_at,
        ends_at: ends_at || null,
        city,
        status: "published",
        organizer_id: organizer.id,
      })
      .select()
      .single();

    if (eventError) {
      console.error("Insert Event Error:", eventError);
      return NextResponse.json({ error: "Failed to create event: " + eventError.message }, { status: 500 });
    }

    // 5. Insert Ticket Types
    const ticketTypes = tickets.map((t: any) => ({
      event_id: event.id,
      name: t.name,
      price: t.price,
      quantity_total: t.quantity,
      quantity_sold: 0,
    }));

    const { error: ticketsError } = await supabaseAdmin
      .from("ticket_types")
      .insert(ticketTypes);

    if (ticketsError) {
      console.error("Insert Tickets Error:", ticketsError);
    }

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    console.error("Event Creation API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "published";

    const { data: events, error } = await supabase
      .from("events")
      .select(`
        id, title, description, banner_url, city, starts_at, ends_at, status,
        categories(name),
        organizers(business_name),
        ticket_types(id, name, price, quantity_total, quantity_sold)
      `)
      .eq("status", status)
      .order("starts_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }

    return NextResponse.json({ events: events || [] });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
