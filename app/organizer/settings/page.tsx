"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Coins, Smartphone } from "lucide-react";
import { toast } from "sonner";

const regions = [
  "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", 
  "Greater Accra", "North East", "Northern", "Oti", "Savannah", 
  "Upper East", "Upper West", "Volta", "Western", "Western North"
];

const organizerTypes = [
  "Individual", "Event Company", "Entertainment Brand", "School", 
  "Church", "Corporate", "Nonprofit", "Venue", "Promoter", "Other"
];

export default function OrganizerSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  
  // Tab 1: Profile
  const [businessName, setBusinessName] = useState("");
  const [organizerType, setOrganizerType] = useState("Individual");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Tab 2: Location
  const [country, setCountry] = useState("Ghana");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  // Tab 3: Payout (DoronX)
  const [payoutMethod, setPayoutMethod] = useState("Mobile Money");
  const [momoNetwork, setMomoNetwork] = useState("MTN");
  const [momoNumber, setMomoNumber] = useState("");
  const [momoName, setMomoName] = useState("");

  // Crypto options
  const [cryptoCurrency, setCryptoCurrency] = useState("USDT");
  const [cryptoNetwork, setCryptoNetwork] = useState("TRC-20");
  const [cryptoWallet, setCryptoWallet] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organizerId, setOrganizerId] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchOrganizer = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push("/login");

        const { data } = await supabase
          .from("organizers")
          .select("*")
          .eq("owner_id", user.id)
          .maybeSingle();

        if (data) {
          setOrganizerId(data.id);
          setBusinessName(data.business_name || "");
          setOrganizerType(data.organizer_type || "Individual");
          setContactEmail(data.contact_email || user.email || "");
          setPhone(data.contact_phone || "");
          setDescription(data.description || "");
          setWebsiteUrl(data.website_url || "");

          setCountry(data.country || "Ghana");
          setRegion(data.region || "");
          setCity(data.city || "");
          setStreetAddress(data.street_address || "");

          setPayoutMethod(data.payout_method || "Mobile Money");
          setMomoNetwork(data.momo_network || "MTN");
          setMomoNumber(data.momo_number || "");
          setMomoName(data.momo_name || "");

          setCryptoCurrency(data.crypto_currency || "USDT");
          setCryptoNetwork(data.crypto_network || "TRC-20");
          setCryptoWallet(data.crypto_wallet || "");
        } else {
          setContactEmail(user.email || "");
          setBusinessName(user.user_metadata?.business_name || user.user_metadata?.full_name || "");
        }
      } catch (err) {
        console.error("Error fetching organizer settings:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrganizer();
  }, [supabase, router]);

  const saveSettingsToDb = async (partialPayload: Record<string, any>, successMessage: string) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fullPayload = {
        owner_id: user.id,
        business_name: businessName,
        organizer_type: organizerType,
        contact_email: contactEmail,
        contact_phone: phone,
        website_url: websiteUrl,
        description,
        country,
        region,
        city,
        street_address: streetAddress,
        payout_method: payoutMethod,
        momo_network: momoNetwork,
        momo_number: momoNumber,
        momo_name: momoName,
        crypto_currency: cryptoCurrency,
        crypto_network: cryptoNetwork,
        crypto_wallet: cryptoWallet,
        ...partialPayload,
      };

      if (organizerId) {
        const { error } = await supabase
          .from("organizers")
          .update(fullPayload)
          .eq("id", organizerId);
        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase
          .from("organizers")
          .insert(fullPayload)
          .select("id")
          .single();
        if (error) throw error;
        if (inserted) setOrganizerId(inserted.id);
      }

      toast.success(successMessage);
    } catch (err: any) {
      console.error("Error saving organizer settings:", err);
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettingsToDb(
      {
        business_name: businessName,
        organizer_type: organizerType,
        contact_email: contactEmail,
        contact_phone: phone,
        website_url: websiteUrl,
        description,
      },
      "Profile saved successfully"
    );
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettingsToDb(
      {
        country,
        region,
        city,
        street_address: streetAddress,
      },
      "Location settings saved successfully"
    );
  };

  const handleSavePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettingsToDb(
      {
        payout_method: payoutMethod,
        momo_network: momoNetwork,
        momo_number: momoNumber,
        momo_name: momoName,
        crypto_currency: cryptoCurrency,
        crypto_network: cryptoNetwork,
        crypto_wallet: cryptoWallet,
      },
      "Payout settings saved successfully"
    );
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
        <p className="text-muted mt-1">Manage your organizer profile, location, and DoronX payout preferences.</p>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-4 font-bold text-sm whitespace-nowrap ${activeTab === 'profile' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-primary'}`}
          >
            Profile
          </button>
          <button 
            onClick={() => setActiveTab('location')}
            className={`px-6 py-4 font-bold text-sm whitespace-nowrap ${activeTab === 'location' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-primary'}`}
          >
            Location
          </button>
          <button 
            onClick={() => setActiveTab('payout')}
            className={`px-6 py-4 font-bold text-sm whitespace-nowrap ${activeTab === 'payout' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-primary'}`}
          >
            Payout (DoronX)
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="max-w-2xl space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold block text-primary">Organizer/Business Name *</label>
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
                  <label className="text-sm font-bold block text-primary">Organizer Type</label>
                  <select 
                    value={organizerType}
                    onChange={(e) => setOrganizerType(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary appearance-none"
                  >
                    {organizerTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold block text-primary">Contact Email</label>
                  <input 
                    type="email" 
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@example.com" 
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold block text-primary">Contact Phone</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+233 24 000 0000" 
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold block text-primary">Website URL</label>
                <input 
                  type="url" 
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com" 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold block text-primary">About Organizer</label>
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
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'location' && (
            <form onSubmit={handleSaveLocation} className="max-w-2xl space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold block text-primary">Country</label>
                  <input 
                    type="text" 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold block text-primary">Region</label>
                  <select 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary appearance-none"
                  >
                    <option value="">Select a region</option>
                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold block text-primary">City/Town</label>
                <input 
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Accra"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold block text-primary">Street Address</label>
                <input 
                  type="text" 
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. 123 Oxford Street, Osu"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary" 
                />
              </div>

              <div className="pt-6 border-t border-border">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "Saving..." : "Save Location"}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'payout' && (
            <form onSubmit={handleSavePayout} className="max-w-2xl space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <label className="text-sm font-bold block text-primary">Preferred DoronX Payout Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod("Mobile Money")}
                    className={`p-4 rounded-xl border flex items-center gap-3 font-bold transition-all ${
                      payoutMethod === "Mobile Money"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                        : "border-border bg-background text-muted hover:border-primary/40"
                    }`}
                  >
                    <Smartphone size={20} /> Mobile Money
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutMethod("Crypto")}
                    className={`p-4 rounded-xl border flex items-center gap-3 font-bold transition-all ${
                      payoutMethod === "Crypto"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                        : "border-border bg-background text-muted hover:border-primary/40"
                    }`}
                  >
                    <Coins size={20} /> Crypto (USDT / USDC)
                  </button>
                </div>
              </div>
              
              {payoutMethod === 'Mobile Money' && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold block text-primary">Mobile Money Network</label>
                    <select 
                      value={momoNetwork}
                      onChange={(e) => setMomoNetwork(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary appearance-none"
                    >
                      <option value="MTN">MTN Mobile Money</option>
                      <option value="Telecel">Telecel Cash</option>
                      <option value="AirtelTigo">AirtelTigo Money</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold block text-primary">Mobile Money Number</label>
                    <input 
                      type="tel" 
                      required={payoutMethod === 'Mobile Money'}
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      placeholder="e.g. 024 000 0000"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold block text-primary">Account Name</label>
                    <input 
                      type="text" 
                      required={payoutMethod === 'Mobile Money'}
                      value={momoName}
                      onChange={(e) => setMomoName(e.target.value)}
                      placeholder="Name registered on the network"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary" 
                    />
                  </div>
                </div>
              )}

              {payoutMethod === 'Crypto' && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold block text-primary">Cryptocurrency</label>
                      <select 
                        value={cryptoCurrency}
                        onChange={(e) => setCryptoCurrency(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary appearance-none"
                      >
                        <option value="USDT">USDT (Tether)</option>
                        <option value="USDC">USDC (USD Coin)</option>
                        <option value="BTC">Bitcoin (BTC)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold block text-primary">Network / Blockchain</label>
                      <select 
                        value={cryptoNetwork}
                        onChange={(e) => setCryptoNetwork(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary appearance-none"
                      >
                        <option value="TRC-20">TRON (TRC-20)</option>
                        <option value="ERC-20">Ethereum (ERC-20)</option>
                        <option value="Solana">Solana (SOL)</option>
                        <option value="Polygon">Polygon (MATIC)</option>
                        <option value="BEP-20">BNB Chain (BEP-20)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold block text-primary">Crypto Wallet Address *</label>
                    <input 
                      type="text" 
                      required={payoutMethod === 'Crypto'}
                      value={cryptoWallet}
                      onChange={(e) => setCryptoWallet(e.target.value)}
                      placeholder="e.g. T..." 
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-primary font-mono text-sm" 
                    />
                    <p className="text-xs text-muted">
                      DoronX will process payout settlements directly to this wallet address. Ensure the network matches your wallet address.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-border">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "Saving..." : "Save Payout Settings"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
