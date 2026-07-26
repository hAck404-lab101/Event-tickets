import { Search, CalendarDays, MapPin, ArrowRight, Ticket, User, Menu } from "lucide-react";
import Link from "next/link";

import { createServerClient } from "@/lib/supabase/server";

const mockEvents = [
  {
    id: "accra-night-live",
    title: "Accra Night Live",
    date: "Sat, 15 Aug · 7:00 PM",
    venue: "Untamed Empire, Accra",
    price: "₵ 120",
    category: "Music",
    image: "/images/accra-night-live.jpg",
  },
  {
    id: "creative-business-summit",
    title: "Creative Business Summit",
    date: "Fri, 28 Aug · 9:00 AM",
    venue: "AICC, Accra",
    price: "₵ 80",
    category: "Business",
    image: "/images/business-summit.jpg",
  },
  {
    id: "food-and-culture-fest",
    title: "Food & Culture Fest",
    date: "Sun, 6 Sep · 11:00 AM",
    venue: "Jubilee Park, Ho",
    price: "₵ 50",
    category: "Lifestyle",
    image: "/images/culture-fest.jpg",
  },
];

const categories = ["All", "Music", "Business", "Sports", "Lifestyle", "Campus"];

export default async function HomePage() {
  const supabase = createServerClient();
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      ticket_types (
        price
      )
    `)
    .eq('status', 'published')
    .order('date', { ascending: true });

  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;
  const dashboardLink = role === 'organizer' ? '/organizer/dashboard' : '/account';
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary group">
            <div className="bg-primary text-white p-2 rounded-xl group-hover:bg-accent transition-colors">
              <Ticket size={24} />
            </div>
            <span className="text-2xl font-serif font-bold tracking-tight">Tixly</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/events/explore" className="text-sm font-bold text-muted hover:text-primary transition-colors">Discover</Link>
            <Link href="/organizer/dashboard" className="text-sm font-bold text-muted hover:text-primary transition-colors">For Organizers</Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link href={dashboardLink} className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-accent transition-colors flex items-center gap-2">
                <User size={18} /> Account
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden md:flex items-center gap-2 text-sm font-bold text-primary hover:text-accent transition-colors">
                  Log In
                </Link>
                <Link href="/register" className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-accent transition-colors flex items-center gap-2">
                  Sign Up
                </Link>
              </>
            )}
            <button className="md:hidden text-primary p-2">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-20 pb-32 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            Live Experiences
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-primary leading-[1.1] tracking-tight">
            Find your next <br />
            <span className="text-accent italic">great experience.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted max-w-xl font-medium leading-relaxed">
            Discover exclusive concerts, industry conferences, and cultural festivals happening around you. Secure your spot instantly.
          </p>
          
          <div className="bg-surface p-2 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="flex-1 flex items-center px-4 gap-3">
              <Search className="text-muted shrink-0" size={20} />
              <input 
                type="text" 
                placeholder="Search events, artists, or venues..." 
                className="w-full bg-transparent border-none outline-none py-3 text-primary font-medium placeholder:text-muted/60"
              />
            </div>
            <button className="bg-primary text-white px-8 py-4 sm:py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all active:scale-95 whitespace-nowrap">
              Find Events
            </button>
          </div>
        </div>

        <div className="flex-1 relative w-full max-w-lg lg:max-w-none hidden sm:block">
          <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden relative shadow-2xl">
            <img 
              src="/images/hero-concert.jpg" 
              alt="Live concert"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white">
                <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4 inline-block">Featured</span>
                <h3 className="text-2xl font-bold font-serif mb-1">Accra Night Live</h3>
                <p className="text-white/80 font-medium flex items-center gap-2"><MapPin size={16}/> Untamed Empire, Accra</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="bg-surface border-t border-border py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-serif font-bold text-primary mb-4">Trending Now</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <button 
                    key={category} 
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
                      index === 0 
                        ? "bg-primary text-white" 
                        : "bg-background border border-border text-muted hover:border-primary hover:text-primary"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <Link href="/events/explore" className="text-accent font-bold hover:underline flex items-center gap-2 group">
              View all events <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events && events.length > 0 ? events.map((event: any) => {
              const prices = event.ticket_types?.map((t: any) => t.price) || [];
              const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
              const formattedDate = new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
              
              return (
              <Link href={`/events/${event.id}`} key={event.id} className="group block">
                <div className="bg-background rounded-3xl overflow-hidden border border-border hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                  <div className="h-64 relative overflow-hidden">
                    <img 
                      src={event.image_url || '/images/hero-concert.jpg'} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-primary px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide">
                      {event.category || 'Event'}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-accent font-bold text-sm mb-2 flex items-center gap-2">
                      <CalendarDays size={16} /> {formattedDate}
                    </p>
                    <h3 className="text-xl font-bold font-serif text-primary mb-3 group-hover:text-accent transition-colors">{event.title}</h3>
                    <p className="text-muted text-sm font-medium flex items-center gap-2 mb-6">
                      <MapPin size={16} /> {event.location}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted font-bold uppercase">From</p>
                        <p className="font-bold text-lg text-primary">₵ {minPrice.toFixed(2)}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}) : mockEvents.map((event) => (
              <Link href={`/events/${event.id}`} key={event.id} className="group block">
                <div className="bg-background rounded-3xl overflow-hidden border border-border hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                  <div className="h-64 relative overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-primary px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide">
                      {event.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-accent font-bold text-sm mb-2 flex items-center gap-2">
                      <CalendarDays size={16} /> {event.date}
                    </p>
                    <h3 className="text-xl font-bold font-serif text-primary mb-3 group-hover:text-accent transition-colors">{event.title}</h3>
                    <p className="text-muted text-sm font-medium flex items-center gap-2 mb-6">
                      <MapPin size={16} /> {event.venue}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted font-bold uppercase">From</p>
                        <p className="font-bold text-lg text-primary">{event.price}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Organizer Call to Action */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-[3rem] p-10 sm:p-16 lg:p-20 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-12">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-accent rounded-full opacity-20 blur-3xl mix-blend-screen pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-6">
                Turn your audience into attendees.
              </h2>
              <p className="text-white/80 text-lg sm:text-xl font-medium mb-10 leading-relaxed max-w-xl">
                Create beautiful event pages, manage ticket sales effortlessly, and get paid securely with our smart invoicing system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/organizer/events/create" className="bg-accent text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-accent transition-colors inline-flex items-center justify-center gap-2">
                  Host an event <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-primary">
            <Ticket size={24} className="text-accent" />
            <span className="text-xl font-serif font-bold">Tixly</span>
          </div>
          <p className="text-muted text-sm font-medium">© 2026 Tixly. Premium event ticketing.</p>
          <div className="flex gap-6">
            <a href="#" className="text-muted hover:text-primary transition-colors text-sm font-bold">Terms</a>
            <a href="#" className="text-muted hover:text-primary transition-colors text-sm font-bold">Privacy</a>
            <a href="#" className="text-muted hover:text-primary transition-colors text-sm font-bold">Support</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
