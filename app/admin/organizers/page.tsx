import { getAdminClient } from "@/lib/supabase/server";
import { Building2, CheckCircle2, Clock, XCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function AdminOrganizersPage() {
  const supabase = getAdminClient();

  const { data: organizers } = await supabase
    .from("organizers")
    .select(`
      id, business_name, contact_email, contact_phone, verification_status, created_at,
      profiles:profiles!organizers_owner_id_fkey(first_name, last_name, email),
      events(count)
    `)
    .order("created_at", { ascending: false });

  const stats = {
    total: organizers?.length || 0,
    verified: organizers?.filter((o) => o.verification_status === "verified").length || 0,
    pending: organizers?.filter((o) => o.verification_status === "pending" || !o.verification_status).length || 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Organizers</h1>
        <p className="text-muted mt-1">Manage all event organizers on the platform.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Organizers", value: stats.total, icon: Building2, color: "text-primary" },
          { label: "Verified", value: stats.verified, icon: CheckCircle2, color: "text-green-400" },
          { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-yellow-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-background ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-muted text-sm">{stat.label}</p>
              <p className="text-2xl font-bold font-serif text-primary">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold font-serif text-primary">All Organizers</h2>
        </div>

        {organizers && organizers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background text-sm text-muted border-b border-border">
                  <th className="px-6 py-4 font-medium">Organizer</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Events</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-border">
                {organizers.map((org: any) => (
                  <tr key={org.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-primary">{org.business_name}</p>
                      <p className="text-muted text-xs">{org.profiles?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-primary text-sm">{org.contact_email || "—"}</p>
                      <p className="text-muted text-xs">{org.contact_phone || "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-primary">{org.events?.[0]?.count || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      {org.verification_status === "verified" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 text-green-400 border border-green-800 rounded-md text-xs font-bold uppercase">
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      ) : org.verification_status === "rejected" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-900/30 text-red-400 border border-red-800 rounded-md text-xs font-bold uppercase">
                          <XCircle size={12} /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900/30 text-yellow-400 border border-yellow-800 rounded-md text-xs font-bold uppercase">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted text-sm">
                      {new Date(org.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`/admin/organizers/${org.id}`}
                        className="text-xs font-bold text-primary hover:text-accent flex items-center gap-1 transition-colors"
                      >
                        View <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <Building2 size={48} className="mx-auto text-muted mb-4 opacity-50" />
            <h3 className="text-xl font-bold font-serif text-primary mb-2">No organizers yet</h3>
            <p className="text-muted">Organizers will appear here as they sign up and create profiles.</p>
          </div>
        )}
      </div>
    </div>
  );
}
