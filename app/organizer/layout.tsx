"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Calendar, 
  Users, 
  Settings, 
  Bell, 
  Menu, 
  LogOut, 
  Ticket 
} from "lucide-react";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      
      const metaName = user.user_metadata?.name || user.user_metadata?.full_name || 'Organizer';
      const nameParts = metaName.split(' ');
      const firstName = profile?.first_name || nameParts[0];
      const lastName = profile?.last_name || nameParts.slice(1).join(' ');

      setUserProfile(profile ? { ...profile, first_name: firstName, last_name: lastName } : { first_name: firstName, last_name: lastName, email: user.email });
    };
    fetchUser();
  }, [supabase, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isProfileMenuOpen) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isProfileMenuOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: "Dashboard", href: "/organizer/dashboard", icon: Home },
    { name: "Events", href: "/organizer/events", icon: Calendar },
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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-primary-foreground transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-primary-foreground/10">
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
                    ? "bg-background text-primary" 
                    : "text-primary-foreground/80 hover:bg-background/20 hover:text-primary-foreground"
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
            <h2 className="font-serif font-bold text-lg hidden sm:block">Welcome, {userProfile?.first_name || 'Organizer'}</h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted hover:text-primary transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-surface"></span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm hover:ring-2 hover:ring-primary/40 transition-all uppercase"
              >
                {userProfile?.first_name?.[0] || "O"}
              </button>
              
              {isProfileMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-border mb-2">
                      <p className="text-sm font-bold truncate">{userProfile ? `${userProfile.first_name} ${userProfile.last_name || ''}` : 'Organizer'}</p>
                      <p className="text-xs text-muted truncate">{userProfile?.email || 'Loading...'}</p>
                    </div>
                    <Link href="/organizer/settings" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-surface-elevated transition-colors">
                      <Settings size={16} /> Settings
                    </Link>
                    <button 
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error-bg transition-colors text-left"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </>
              )}
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
