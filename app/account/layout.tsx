"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Ticket, CreditCard, Settings, LogOut } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setUserProfile(profile || { first_name: 'User', last_name: '', email: user.email, phone: user.phone });
      }
    };
    fetchUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: "My Profile", href: "/account", icon: User },
    { name: "My Tickets", href: "/account/tickets", icon: Ticket },
    { name: "Order History", href: "/account/orders", icon: CreditCard },
    { name: "Preferences", href: "/account/settings", icon: Settings },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="shell py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg font-serif">Tixly</Link>
        </div>
      </div>

      <div className="shell py-10 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border text-center">
              <div className="w-20 h-20 bg-primary text-white text-3xl font-bold rounded-full flex items-center justify-center mx-auto mb-4 uppercase">
                {userProfile ? userProfile.first_name?.[0] : "A"}
              </div>
              <h2 className="font-bold text-lg">{userProfile ? `${userProfile.first_name} ${userProfile.last_name || ''}` : 'Ama Serwaa'}</h2>
              <p className="text-sm text-muted">{userProfile ? (userProfile.email || userProfile.phone || '') : 'ama.serwaa@example.com'}</p>
            </div>
            <nav className="p-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-primary text-white" 
                        : "text-muted hover:bg-background hover:text-primary"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error hover:bg-error-bg transition-colors mt-4"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </nav>
          </div>
        </aside>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
