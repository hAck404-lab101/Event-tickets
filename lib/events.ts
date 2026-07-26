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

export const events: Event[] = [
  {
    id: "accra-night-live",
    title: "Accra Night Live",
    description: "A high-energy live music experience featuring emerging and established Ghanaian performers, food vendors and an unforgettable crowd atmosphere.",
    category: "Music",
    date: "Saturday, 15 August 2026",
    time: "7:00 PM",
    venue: "Untamed Empire",
    city: "Accra",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=85",
    organizer: "Nightlife Ghana",
    ticketTypes: [
      { id: "regular", name: "Regular", description: "General admission", price: 120, quantityAvailable: 450 },
      { id: "vip", name: "VIP", description: "Priority entry and VIP area", price: 280, quantityAvailable: 120 },
      { id: "vvip", name: "VVIP", description: "Premium seating, drinks and backstage access", price: 600, quantityAvailable: 30 }
    ]
  },
  {
    id: "creative-business-summit",
    title: "Creative Business Summit",
    description: "A practical one-day summit for designers, founders, creators and young professionals building profitable creative businesses.",
    category: "Business",
    date: "Friday, 28 August 2026",
    time: "9:00 AM",
    venue: "Accra International Conference Centre",
    city: "Accra",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=85",
    organizer: "Create Ghana",
    ticketTypes: [
      { id: "student", name: "Student", description: "Valid student ID required", price: 80, quantityAvailable: 300 },
      { id: "professional", name: "Professional", description: "Full summit access", price: 180, quantityAvailable: 400 },
      { id: "team", name: "Team Pass", description: "Entry for five team members", price: 750, quantityAvailable: 40 }
    ]
  },
  {
    id: "food-and-culture-fest",
    title: "Food & Culture Fest",
    description: "Celebrate Ghanaian food, music, fashion and culture with local vendors, live performances and family-friendly activities.",
    category: "Lifestyle",
    date: "Sunday, 6 September 2026",
    time: "11:00 AM",
    venue: "Jubilee Park",
    city: "Ho",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=85",
    organizer: "Volta Experiences",
    ticketTypes: [
      { id: "early-bird", name: "Early Bird", description: "Limited discounted entry", price: 50, quantityAvailable: 200 },
      { id: "standard", name: "Standard", description: "General event access", price: 75, quantityAvailable: 600 },
      { id: "family", name: "Family Pass", description: "Entry for two adults and two children", price: 220, quantityAvailable: 100 }
    ]
  }
];

export function getEventById(id: string) {
  return events.find((event) => event.id === id);
}

export function formatGhs(amount: number) {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount);
}
