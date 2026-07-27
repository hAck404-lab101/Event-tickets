'use client';

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
            
          setProfile(profile);

          const metaName = user.user_metadata?.name || user.user_metadata?.full_name || '';
          const nameParts = metaName.split(' ');
          
          setFirstName(profile?.first_name || nameParts[0] || '');
          setLastName(profile?.last_name || nameParts.slice(1).join(' ') || '');
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (!user) throw new Error("No user found");

      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      // Upsert profile in Supabase profiles table
      const { error: profileErr } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          name: fullName,
          email: user.email,
          phone: user.phone || profile?.phone,
        });

      if (profileErr) throw profileErr;

      // Update Auth metadata
      await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        }
      });

      toast.success("Profile updated successfully");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
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
              <label className="block text-sm font-bold mb-2 text-primary">First Name</label>
              <input 
                type="text" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-3 outline-none focus:border-primary text-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-primary">Last Name</label>
              <input 
                type="text" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-3 outline-none focus:border-primary text-primary" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold mb-2 text-primary">Email Address</label>
            <input type="email" value={user?.email || ""} disabled className="w-full bg-border text-muted border border-border rounded-xl p-3 outline-none cursor-not-allowed" />
            <p className="text-xs text-muted mt-2">To change your email address, please contact support.</p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-primary">Phone Number</label>
            <input type="tel" value={profile?.phone || user?.phone || ""} disabled className="w-full bg-border text-muted border border-border rounded-xl p-3 outline-none cursor-not-allowed" />
          </div>

          <div className="pt-4 border-t border-border">
            <button 
              disabled={saving} 
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
