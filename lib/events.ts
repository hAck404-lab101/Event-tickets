import { createServerClient } from "./supabase/server";

export type TicketType = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantityAvailable: number;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  image: string;
  organizer: string;
  ticketTypes: TicketType[];
};

export async function getEvents(): Promise<Event[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      categories(name),
      organizers(business_name),
      ticket_types(*)
    `)
    // .eq("status", "published") // Uncomment if you want to only show published events, but for dev it might be empty
    .order("starts_at", { ascending: true });

  if (error || !data) {
    console.error("Error fetching events:", error);
    return [];
  }

  return data.map((e: any) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    category: e.categories?.name || "Event",
    date: new Date(e.starts_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    time: new Date(e.starts_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    venue: e.location ? e.location.split(',')[0] : "Venue TBA",
    city: e.location ? e.location.split(',')[1]?.trim() || "City TBA" : "City TBA",
    image: e.image_url || e.banner_url || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=85",
    organizer: e.organizers?.business_name || "Organizer",
    ticketTypes: e.ticket_types?.map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description || "",
      price: Number(t.price),
      quantityAvailable: t.quantity_total - t.quantity_sold
    })) || []
  }));
}

export async function getEventById(id: string): Promise<Event | null> {
  const supabase = createServerClient();
  const { data: e, error } = await supabase
    .from("events")
    .select(`
      *,
      categories(name),
      organizers(business_name),
      ticket_types(*)
    `)
    .eq("id", id)
    .single();

  if (error || !e) {
    console.error("Error fetching event by id:", error);
    return null;
  }

  return {
    id: e.id,
    title: e.title,
    description: e.description,
    category: e.categories?.name || "Event",
    date: new Date(e.starts_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    time: new Date(e.starts_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    venue: e.location ? e.location.split(',')[0] : "Venue TBA",
    city: e.location ? e.location.split(',')[1]?.trim() || "City TBA" : "City TBA",
    image: e.image_url || e.banner_url || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=85",
    organizer: e.organizers?.business_name || "Organizer",
    ticketTypes: e.ticket_types?.map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description || "",
      price: Number(t.price),
      quantityAvailable: t.quantity_total - t.quantity_sold
    })) || []
  };
}

export function formatGhs(amount: number) {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount);
}
