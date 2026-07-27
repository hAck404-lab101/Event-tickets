'use client';

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AccountProfile() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(profile);

        const metaName = user.user_metadata?.name || user.user_metadata?.full_name || '';
        const nameParts = metaName.split(' ');
        
        setFirstName(profile?.first_name || nameParts[0] || '');
        setLastName(profile?.last_name || nameParts.slice(1).join(' ') || '');
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (!user) throw new Error("No user found");
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-surface-elevated rounded"></div>
        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 space-y-6">
          <div className="h-12 w-full bg-surface-elevated rounded"></div>
          <div className="h-12 w-full bg-surface-elevated rounded"></div>
          <div className="h-12 w-full bg-surface-elevated rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-primary">My Profile</h1>
      
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
        <form className="max-w-xl space-y-6" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2">First Name</label>
              <input 
                type="text" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:border-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Last Name</label>
              <input 
                type="text" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:border-primary" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold mb-2">Email Address</label>
            <input type="email" value={user?.email || ""} disabled className="w-full bg-border text-muted border border-border rounded-lg p-3 outline-none cursor-not-allowed" />
            <p className="text-xs text-muted mt-2">To change your email address, please contact support.</p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Phone Number</label>
            <input type="tel" value={profile?.phone || user?.phone || ""} disabled className="w-full bg-border text-muted border border-border rounded-lg p-3 outline-none cursor-not-allowed" />
          </div>

          <div className="pt-4 border-t border-border">
            <button disabled={saving} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
