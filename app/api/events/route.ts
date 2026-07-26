import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const { title, category, image_url, date, end_date, location, tickets } = payload;

    if (!title || !category || !date || !location || !tickets || tickets.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert Event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        title,
        category,
        image_url, // For prototype, assuming base64 string is fine for text column
        date,
        end_date: end_date || null,
        location,
        status: 'published',
        organizer_id: user.id
      })
      .select()
      .single();

    if (eventError) {
      console.error("Insert Event Error:", eventError);
      return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }

    // Map tickets to include event_id
    const ticketTypes = tickets.map((t: any) => ({
      event_id: event.id,
      name: t.name,
      price: t.price,
      quantity: t.quantity
    }));

    // Insert Tickets
    const { error: ticketsError } = await supabase
      .from("ticket_types")
      .insert(ticketTypes);

    if (ticketsError) {
      console.error("Insert Tickets Error:", ticketsError);
      // We could rollback event creation here if necessary, but we'll return error for now
      return NextResponse.json({ error: "Failed to create ticket tiers" }, { status: 500 });
    }

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    console.error("Event Creation API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
