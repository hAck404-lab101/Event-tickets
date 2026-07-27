'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AccountSettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Passwords
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Notification Prefs
  const [prefs, setPrefs] = useState({
    orderConfirmations: true,
    eventReminders: true,
    eventCancellations: true,
    promotional: false
  });

  useEffect(() => {
    const savedPrefs = localStorage.getItem("tixly_notification_prefs");
    if (savedPrefs) {
      try {
        setPrefs(JSON.parse(savedPrefs));
      } catch (e) {}
    }
    setMounted(true);
  }, []);

  const handleSavePrefs = () => {
    localStorage.setItem("tixly_notification_prefs", JSON.stringify(prefs));
    toast.success("Preferences saved successfully");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);
    try {
      // In Supabase, if the user signed in with password, we can just update it
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSignOutAll = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      toast.success("Signed out from all devices");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to sign out");
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-primary">Account Settings</h1>
      
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 space-y-12">
        
        {/* Section 1: Notifications */}
        <div className="max-w-xl">
          <h3 className="text-xl font-bold mb-4 text-primary">Notification Preferences</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={prefs.orderConfirmations} 
                onChange={(e) => setPrefs({...prefs, orderConfirmations: e.target.checked})}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary" 
              />
              <span className="text-sm font-medium">Order confirmations & tickets</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={prefs.eventReminders} 
                onChange={(e) => setPrefs({...prefs, eventReminders: e.target.checked})}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary" 
              />
              <span className="text-sm font-medium">Event reminders & updates</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={prefs.eventCancellations} 
                onChange={(e) => setPrefs({...prefs, eventCancellations: e.target.checked})}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary" 
              />
              <span className="text-sm font-medium">Event cancellation alerts</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={prefs.promotional} 
                onChange={(e) => setPrefs({...prefs, promotional: e.target.checked})}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary" 
              />
              <span className="text-sm font-medium">Marketing and promotional emails</span>
            </label>
          </div>
          <button 
            onClick={handleSavePrefs}
            className="mt-6 bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold hover:bg-opacity-90 transition-colors"
          >
            Save Preferences
          </button>
        </div>

        <hr className="border-border" />

        {/* Section 2: Security */}
        <div className="max-w-xl">
          <h3 className="text-xl font-bold mb-4 text-primary">Security</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Current Password</label>
              <input 
                type="password" 
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:border-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">New Password</label>
              <input 
                type="password" 
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:border-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Confirm New Password</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:border-primary" 
              />
            </div>
            <button 
              disabled={changingPassword}
              className="mt-4 bg-background border border-primary text-primary px-6 py-2 rounded-xl font-bold hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
            >
              {changingPassword ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>

        <hr className="border-border" />

        {/* Section 3: Danger Zone */}
        <div className="max-w-xl">
          <h3 className="text-xl font-bold mb-4 text-error">Danger Zone</h3>
          <p className="text-sm text-muted mb-4">
            Sign out of all sessions across all your devices. This action will require you to log in again everywhere.
          </p>
          <button 
            onClick={handleSignOutAll}
            className="bg-error-bg text-error border border-error/50 px-6 py-2 rounded-xl font-bold hover:bg-error hover:text-white transition-colors"
          >
            Sign Out From All Devices
          </button>
        </div>

      </div>
    </div>
  );
}
