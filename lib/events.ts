import { getAdminClient } from "./supabase/server";

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
  status: string;
  startsAt: string;
  ticketTypes: TicketType[];
};

export async function getEvents(): Promise<Event[]> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("events")
    .select(`
      id, title, description, banner_url, city, starts_at, ends_at, status,
      categories(name),
      organizers(business_name),
      ticket_types(id, name, description, price, quantity_total, quantity_sold)
    `)
    .eq("status", "published")
    .order("starts_at", { ascending: true });

  if (error || !data) {
    console.error("Error fetching events:", error);
    return [];
  }

  return data.map((e: any) => mapEvent(e));
}

export async function getEventById(id: string): Promise<Event | null> {
  const supabase = getAdminClient();
  const { data: e, error } = await supabase
    .from("events")
    .select(`
      id, title, description, banner_url, city, starts_at, ends_at, status,
      categories(name),
      organizers(business_name),
      ticket_types(id, name, description, price, quantity_total, quantity_sold)
    `)
    .eq("id", id)
    .single();

  if (error || !e) {
    console.error("Error fetching event by id:", error);
    return null;
  }

  return mapEvent(e);
}

function mapEvent(e: any): Event {
  const startsAt = e.starts_at ? new Date(e.starts_at) : null;
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    category: e.categories?.name || "Event",
    date: startsAt
      ? startsAt.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "Date TBA",
    time: startsAt
      ? startsAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      : "",
    venue: "Venue TBA",
    city: e.city || "City TBA",
    image: e.banner_url || "/images/hero-concert.jpg",
    organizer: e.organizers?.business_name || "Organizer",
    status: e.status || "published",
    startsAt: e.starts_at || "",
    ticketTypes: e.ticket_types?.map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description || "",
      price: Number(t.price),
      quantityAvailable: (t.quantity_total || 0) - (t.quantity_sold || 0),
    })) || [],
  };
}

export function formatGhs(amount: number) {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount);
}
