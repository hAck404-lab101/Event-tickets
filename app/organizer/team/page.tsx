import { Users, UserPlus } from "lucide-react";

export default async function OrganizerTeamPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Team Management</h1>
          <p className="text-muted mt-1">Manage who has access to your organizer account.</p>
        </div>
        <button className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-colors flex items-center gap-2">
          <UserPlus size={18} /> Invite Member
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="divide-y divide-border">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold text-lg">
                Y
              </div>
              <div>
                <h3 className="font-bold">You (Owner)</h3>
                <p className="text-sm text-muted">owner@example.com</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
              Admin
            </span>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                K
              </div>
              <div>
                <h3 className="font-bold">Kofi Owusu</h3>
                <p className="text-sm text-muted">kofi.owusu@example.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                Scanner
              </span>
              <button className="text-sm font-bold text-muted hover:text-error transition-colors">Remove</button>
            </div>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                A
              </div>
              <div>
                <h3 className="font-bold">Akua Afriyie</h3>
                <p className="text-sm text-muted">akua.a@example.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                Manager
              </span>
              <button className="text-sm font-bold text-muted hover:text-error transition-colors">Remove</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
