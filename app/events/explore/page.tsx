import { Search, Filter, MapPin, Calendar, Tag } from "lucide-react";
import Link from "next/link";

export default function ExploreEvents() {
  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Navbar placeholder - assuming root layout handles this, but for isolation we'll skip complex nav here */}
      <div className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="shell py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg font-serif">Tixly</Link>
          <div className="hidden md:flex bg-background border border-border rounded-full px-4 py-2 w-96 flex-1 max-w-lg mx-8 focus-within:border-primary transition-colors">
            <Search size={18} className="text-muted mr-3 mt-0.5" />
            <input 
              type="text" 
              placeholder="Search by event, artist, organizer, or venue..." 
              className="bg-transparent border-none outline-none w-full text-sm"
            />
          </div>
          <Link href="/account" className="w-10 h-10 rounded-full bg-border flex items-center justify-center font-bold">
            A
          </Link>
        </div>
      </div>

      <div className="shell mt-8">
        <h1 className="text-4xl font-serif font-bold text-primary mb-2">Explore Events</h1>
        <p className="text-muted text-lg mb-8">Discover what's happening in your city and beyond.</p>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-6">
            <div className="bg-surface p-5 rounded-2xl border border-border">
              <h3 className="font-bold font-serif mb-4 flex items-center gap-2"><Filter size={18} /> Filters</h3>
              
              <div className="space-y-5">
                <div>
                  <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><MapPin size={16} className="text-muted" /> Location</h4>
                  <select className="w-full bg-background border border-border rounded-lg p-2.5 text-sm outline-none">
                    <option>All Locations</option>
                    <option>Accra</option>
                    <option>Kumasi</option>
                    <option>Takoradi</option>
                  </select>
                </div>

                <div>
                  <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><Calendar size={16} className="text-muted" /> Date</h4>
                  <div className="space-y-2 text-sm text-muted">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="date" className="accent-primary" defaultChecked /> Any date
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="date" className="accent-primary" /> Today
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="date" className="accent-primary" /> This weekend
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="date" className="accent-primary" /> Next week
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><Tag size={16} className="text-muted" /> Price</h4>
                  <div className="space-y-2 text-sm text-muted">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="accent-primary rounded" defaultChecked /> Free
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="accent-primary rounded" defaultChecked /> Paid
                    </label>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-6 bg-primary text-white py-2.5 rounded-lg font-bold text-sm">Apply Filters</button>
            </div>
          </aside>

          {/* Event Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-muted">Showing <strong className="text-primary">124</strong> events</span>
              <select className="bg-transparent border-none text-sm font-bold outline-none cursor-pointer">
                <option>Popularity</option>
                <option>Date (Soonest)</option>
                <option>Date (Latest)</option>
                <option>Recently Added</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Link href={\`/events/event-\${i}\`} key={i} className="bg-surface rounded-2xl overflow-hidden border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group block">
                  <div className="h-48 bg-border relative overflow-hidden">
                    <img 
                      src={\`https://images.unsplash.com/photo-\${1500000000000 + i * 10000}?auto=format&fit=crop&w=600&q=80\`} 
                      alt="Event" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-primary text-xs font-bold px-2 py-1 rounded-md">
                      TECHNOLOGY
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif font-bold text-xl leading-tight mb-2 group-hover:text-accent transition-colors">
                        Accra Tech Summit 2026
                      </h3>
                    </div>
                    <p className="text-accent text-sm font-bold mb-1 flex items-center gap-1.5">
                      <Calendar size={14} /> Oct 12, 2026
                    </p>
                    <p className="text-muted text-sm flex items-center gap-1.5 mb-4">
                      <MapPin size={14} /> AICC, Accra
                    </p>
                    <div className="pt-4 border-t border-border flex justify-between items-center">
                      <span className="text-xs font-bold text-muted uppercase tracking-wider">Starting from</span>
                      <span className="font-bold text-primary">₵150.00</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <button className="bg-white border border-border px-6 py-3 rounded-xl font-bold text-sm hover:bg-background transition-colors">
                Load More Events
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
