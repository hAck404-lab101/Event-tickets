import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    
    // Authenticate user via token from client
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth Error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const { title, description, category, image_url, date, end_date, location, tickets } = payload;

    if (!title || !description || !category || !date || !location || !tickets || tickets.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Get or Create Organizer
    let { data: organizer } = await supabase
      .from("organizers")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!organizer) {
      const { data: newOrg, error: orgError } = await supabase
        .from("organizers")
        .insert({ 
          owner_id: user.id, 
          business_name: user.user_metadata?.name || 'Organizer' 
        })
        .select()
        .single();
      
      if (orgError) {
        console.error("Create Organizer Error:", orgError);
        return NextResponse.json({ error: "Failed to setup organizer profile." }, { status: 500 });
      }
      organizer = newOrg;
    }

    // 2. Get or Create Category
    const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let { data: categoryRecord } = await supabase
      .from("categories")
      .select("id")
      .eq("name", category)
      .single();

    if (!categoryRecord) {
      const { data: newCategory, error: catError } = await supabase
        .from("categories")
        .insert({ name: category, slug: categorySlug })
        .select()
        .single();
        
      if (!catError) categoryRecord = newCategory;
    }

    // 3. Generate Event Slug
    const eventSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    // 4. Extract City from Location (Assuming "VenueName, City")
    const locationParts = location.split(',').map((p: string) => p.trim());
    const city = locationParts.length > 1 ? locationParts[locationParts.length - 1] : location;

    // 5. Insert Event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        title,
        description,
        slug: eventSlug,
        category_id: categoryRecord?.id || null,
        banner_url: image_url, 
        starts_at: date,
        ends_at: end_date || null,
        city: city,
        status: 'published',
        organizer_id: organizer!.id
      })
      .select()
      .single();

    if (eventError) {
      console.error("Insert Event Error:", eventError);
      return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }

    // 6. Map and Insert Tickets
    const ticketTypes = tickets.map((t: any) => ({
      event_id: event.id,
      name: t.name,
      price: t.price,
      quantity_total: t.quantity
    }));

    const { error: ticketsError } = await supabase
      .from("ticket_types")
      .insert(ticketTypes);

    if (ticketsError) {
      console.error("Insert Tickets Error:", ticketsError);
      return NextResponse.json({ error: "Failed to create ticket tiers" }, { status: 500 });
    }

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    console.error("Event Creation API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
