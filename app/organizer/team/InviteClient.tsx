"use client";

import { useState } from "react";
import { UserPlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function InviteClient({ isButton = false }: { isButton?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Viewer");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast.info("Invitations coming soon — team management is being set up");
    
    setLoading(false);
    setIsOpen(false);
    setName("");
    setEmail("");
    setRole("Viewer");
  };

  const trigger = isButton ? (
    <button onClick={() => setIsOpen(true)} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
      <UserPlus size={18} /> Invite Your First Member
    </button>
  ) : (
    <button onClick={() => setIsOpen(true)} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-colors flex items-center gap-2">
      <UserPlus size={18} /> Invite Member
    </button>
  );

  return (
    <>
      {trigger}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-serif font-bold text-primary">Invite Team Member</h2>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-primary transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold block text-primary">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Jane Doe" 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold block text-primary">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@example.com" 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold block text-primary">Role</label>
                <select 
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary appearance-none"
                >
                  <option value="Admin">Admin</option>
                  <option value="Event Manager">Event Manager</option>
                  <option value="Check-in Manager">Check-in Manager</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-transparent border border-border text-primary px-6 py-3 rounded-xl font-bold hover:bg-surface-elevated transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
