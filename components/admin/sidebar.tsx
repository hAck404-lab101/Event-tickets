"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Building2, 
  CreditCard, 
  Settings,
  X,
  LogOut
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Events", href: "/admin/events", icon: CalendarDays },
  { name: "Organizers", href: "/admin/organizers", icon: Building2 },
  { name: "Orders", href: "/admin/orders", icon: CreditCard },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-primary-foreground border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-primary-foreground/10 shrink-0">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-lg text-primary-foreground">
            <div className="w-8 h-8 rounded-md bg-background text-primary flex items-center justify-center">T</div>
            Admin Panel
          </Link>
          <button className="lg:hidden text-primary-foreground/80 hover:text-primary-foreground" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
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

        <div className="p-4 border-t border-primary-foreground/10 shrink-0">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-primary-foreground/80 hover:bg-background/20 hover:text-primary-foreground transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
