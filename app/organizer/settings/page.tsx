"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function OrganizerSettingsPage() {
  const [businessName, setBusinessName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchOrganizer = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push("/login");

        const { data, error } = await supabase
          .from("organizers")
          .select("*")
          .eq("owner_id", user.id)
          .single();

        if (data) {
          setBusinessName(data.business_name || "");
          setContactEmail(data.contact_email || "");
          setDescription(data.description || "");
          setPhone(data.contact_phone || "");
        } else if (error && error.code !== 'PGRST116') {
          console.error("Error fetching organizer:", error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrganizer();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("organizers")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("organizers")
          .update({
            business_name: businessName,
            contact_email: contactEmail,
            description,
            contact_phone: phone,
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("organizers")
          .insert({
            owner_id: user.id,
            business_name: businessName,
            contact_email: contactEmail,
            description,
            contact_phone: phone
          });
          
        if (error) throw error;
      }

      setSuccess("Profile saved successfully");
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Settings</h1>
        <p className="text-muted mt-1">Manage your organizer profile.</p>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm p-8">
        {error && <div className="mb-6 p-4 bg-error-bg text-error rounded-xl text-sm font-bold">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-sm font-bold border border-green-200">{success}</div>}

        <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold block">Organizer/Business Name</label>
            <input 
              type="text" 
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Echo House" 
              className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold block">Contact Email</label>
            <input 
              type="email" 
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contact@example.com" 
              className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold block">Contact Phone</label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+233 24 000 0000" 
              className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold block">About Organizer</label>
            <textarea 
              rows={4} 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your organization..." 
              className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none text-primary"
            ></textarea>
          </div>

          <div className="pt-6 border-t border-border">
            <button 
              type="submit" 
              disabled={saving}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
