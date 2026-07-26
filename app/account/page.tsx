import { createServerClient } from "@/lib/supabase/server";

export default async function AccountProfile() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single();

    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-primary">My Profile</h1>
      
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
        <form className="max-w-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2">First Name</label>
              <input type="text" defaultValue={profile?.first_name || "Ama"} className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Last Name</label>
              <input type="text" defaultValue={profile?.last_name || "Serwaa"} className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:border-primary" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold mb-2">Email Address</label>
            <input type="email" defaultValue={user?.email || "ama.serwaa@example.com"} disabled className="w-full bg-border text-muted border border-border rounded-lg p-3 outline-none cursor-not-allowed" />
            <p className="text-xs text-muted mt-2">To change your email address, please contact support.</p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Phone Number</label>
            <input type="tel" defaultValue={user?.phone || "+233501234567"} disabled={!!user} className="w-full bg-border text-muted border border-border rounded-lg p-3 outline-none cursor-not-allowed" />
          </div>

          <div className="pt-4 border-t border-border">
            <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
