import { createServerClient, getAdminClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";
import InviteClient from "./InviteClient";

export default async function OrganizerTeamPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminSupabase = getAdminClient();

  let profile: any = null;
  if (user) {
    const { data } = await adminSupabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    profile = data || {
      first_name: user.user_metadata?.first_name || user.email?.split('@')[0],
      last_name: user.user_metadata?.last_name || '',
      email: user.email,
    };
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Team Management</h1>
          <p className="text-muted mt-1">Manage who has access to your organizer account.</p>
        </div>
        <InviteClient />
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="divide-y divide-border">
          {profile && (
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg uppercase">
                  {profile.first_name?.[0] || profile.email?.[0] || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-primary">{profile.first_name} {profile.last_name} (You)</h3>
                  <p className="text-sm text-muted">{profile.email}</p>
                </div>
              </div>
              <span className="bg-green-900/30 text-green-400 border border-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                Owner
              </span>
            </div>
          )}
        </div>
        
        <div className="border-t border-border p-12 text-center">
           <Users size={48} className="mx-auto text-muted mb-4 opacity-50" />
           <h3 className="text-xl font-bold font-serif mb-2 text-primary">No other team members</h3>
           <p className="text-muted mb-6 max-w-sm mx-auto">Invite team members to help manage your events, scan tickets, and view analytics.</p>
           <InviteClient isButton />
        </div>
      </div>
    </div>
  );
}
