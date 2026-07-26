export default async function AccountSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-primary">Preferences</h1>
      
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
        <div className="max-w-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-4">Email Notifications</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-border text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Order confirmations & tickets</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-border text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Event reminders & updates</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded border-border text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Marketing and promotional emails</span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors">
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
