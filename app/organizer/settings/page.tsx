import { Settings } from "lucide-react";

export default async function OrganizerSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Settings</h1>
        <p className="text-muted mt-1">Manage your organizer profile and payouts.</p>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm p-8">
        <form className="max-w-xl space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold block">Organizer Name</label>
            <input type="text" placeholder="e.g. Echo House" className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold block">Contact Email</label>
            <input type="email" placeholder="contact@example.com" className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold block">About Organizer</label>
            <textarea rows={4} placeholder="Describe your organization..." className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none"></textarea>
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="text-xl font-bold font-serif mb-4">Payout Details</h3>
            <div className="space-y-2 mb-6">
              <label className="text-sm font-bold block">Mobile Money Number</label>
              <input type="tel" placeholder="+233 24 000 0000" className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
            </div>
            <button type="button" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
