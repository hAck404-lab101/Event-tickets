"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Ticket, 
  CalendarDays, 
  Scan,
  Users,
  Settings,
  Menu,
  Bell
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      if (user.user_metadata?.role !== "organizer") {
        router.push("/events/explore");
        return;
      }
      setIsAuthorized(true);
    };
    checkAuth();
  }, [supabase, router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", href: "/organizer/dashboard", icon: LayoutDashboard },
    { name: "My Events", href: "/organizer/events", icon: CalendarDays },
    { name: "Scan Tickets", href: "/organizer/scanner", icon: Scan },
    { name: "Orders", href: "/organizer/orders", icon: Ticket },
    { name: "Team", href: "/organizer/team", icon: Users },
    { name: "Settings", href: "/organizer/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-primary">
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-accent text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/20">
          <Link href="/organizer/dashboard" className="font-bold text-lg">
            Tixly Organizer
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/organizer/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-white text-accent" 
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-surface border-b border-border lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-muted hover:text-primary" 
              onClick={() => setIsOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="font-serif font-bold text-lg hidden sm:block">Welcome, Tech In Ghana</h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted hover:text-primary transition-colors">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              T
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
