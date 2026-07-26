import { CalendarDays, MapPin, Search, Ticket, UserRound } from "lucide-react";

const events = [
  {
    id: "accra-night-live",
    title: "Accra Night Live",
    date: "Sat, 15 Aug · 7:00 PM",
    venue: "Untamed Empire, Accra",
    price: "GHS 120",
    category: "Music",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "creative-business-summit",
    title: "Creative Business Summit",
    date: "Fri, 28 Aug · 9:00 AM",
    venue: "AICC, Accra",
    price: "GHS 80",
    category: "Business",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "food-and-culture-fest",
    title: "Food & Culture Fest",
    date: "Sun, 6 Sep · 11:00 AM",
    venue: "Jubilee Park, Ho",
    price: "GHS 50",
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  },
];

const categories = ["All", "Music", "Business", "Sports", "Lifestyle", "Campus"];

export default function HomePage() {
  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="#"><span><Ticket size={19} /></span>Tixly</a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#events">Discover</a>
          <a href="#how-it-works">How it works</a>
          <a href="#organizers">For organizers</a>
        </nav>
        <button className="profile-button" aria-label="Open profile"><UserRound size={19} /></button>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">Events worth showing up for</p>
          <h1>Find your next<br /><em>great experience.</em></h1>
          <p className="hero-text">Discover concerts, conferences, festivals and community events happening around you.</p>
          <div className="search-box">
            <Search size={20} />
            <input aria-label="Search events" placeholder="Search events, artists or venues" />
            <button>Search</button>
          </div>
        </div>
        <div className="hero-card" role="img" aria-label="Crowd enjoying a live concert">
          <div className="floating-ticket">
            <span>FEATURED EVENT</span>
            <strong>Accra Night Live</strong>
            <small>15 AUG · ACCRA</small>
          </div>
        </div>
      </section>

      <section className="shell section" id="events">
        <div className="section-heading">
          <div><p className="eyebrow">Explore</p><h2>Popular events</h2></div>
          <a href="#all-events">View all events →</a>
        </div>

        <div className="category-row" aria-label="Event categories">
          {categories.map((category, index) => <button className={index === 0 ? "active" : ""} key={category}>{category}</button>)}
        </div>

        <div className="event-grid">
          {events.map((event) => (
            <article className="event-card" key={event.id}>
              <div className="event-image" style={{ backgroundImage: `url(${event.image})` }}>
                <span>{event.category}</span>
              </div>
              <div className="event-content">
                <p className="date"><CalendarDays size={16} />{event.date}</p>
                <h3>{event.title}</h3>
                <p className="venue"><MapPin size={16} />{event.venue}</p>
                <div className="event-footer"><strong>From {event.price}</strong><a href={`/events/${event.id}`}>Get tickets</a></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="shell organizer-banner" id="organizers">
        <div><p className="eyebrow">Host your own event</p><h2>Turn your audience into attendees.</h2><p>Create events, sell tickets and let our invoice checkout handle payment.</p></div>
        <button>Create an event</button>
      </section>

      <footer className="shell footer"><a className="brand" href="#"><span><Ticket size={18} /></span>Tixly</a><p>© 2026 Tixly. Event ticketing powered by secure invoice checkout.</p></footer>
    </main>
  );
}
