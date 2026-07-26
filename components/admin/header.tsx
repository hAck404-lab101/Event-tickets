"use client";

import { Menu, Bell, Search } from "lucide-react";

export function Header({ setIsOpen }: { setIsOpen: (val: boolean) => void }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-surface border-b border-border lg:px-8">
      <div className="flex items-center gap-4">
        <button 
          className="lg:hidden text-muted hover:text-primary" 
          onClick={() => setIsOpen(true)}
        >
          <Menu size={24} />
        </button>
        <div className="hidden md:flex items-center bg-background rounded-full px-4 py-2 border border-border focus-within:border-primary transition-colors w-96">
          <Search size={16} className="text-muted mr-2" />
          <input 
            type="text" 
            placeholder="Search events, orders, or customers..." 
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted hover:text-primary transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-surface"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
          A
        </div>
      </div>
    </header>
  );
}
