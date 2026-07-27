"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, Save, Image as ImageIcon, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EventCreateWizard() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const router = useRouter();

  // Step 1 State
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [organizerId, setOrganizerId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Check organizer profile
      const { data: orgData } = await supabase
        .from("organizers")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (!orgData) {
        alert("Please complete your organizer profile first.");
        router.push("/organizer/settings");
        return;
      }
      setOrganizerId(orgData.id);

      // Fetch categories
      const { data: cats } = await supabase.from("categories").select("id, name");
      if (cats) setCategoriesList(cats);

      setCheckingProfile(false);
    };
    init();
  }, [router]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2 State
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [venueName, setVenueName] = useState("");
  const [city, setCity] = useState("");

  // Step 3 State
  const [tickets, setTickets] = useState([{ id: Date.now(), name: "Regular", price: "150", quantity: "500" }]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTicketTier = () => {
    setTickets([...tickets, { id: Date.now(), name: "", price: "", quantity: "" }]);
  };

  const removeTicketTier = (id: number) => {
    if (tickets.length > 1) {
      setTickets(tickets.filter((t) => t.id !== id));
    }
  };

  const updateTicketTier = (id: number, field: string, value: string) => {
    setTickets(tickets.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!title || !description || !category || !imageBase64) {
        setError("Please fill out all fields and upload a banner image.");
        return false;
      }
    } else if (currentStep === 2) {
      if (!startsAt || !endsAt || !venueName || !city) {
        setError("Please fill out all date and location fields.");
        return false;
      }
    } else if (currentStep === 3) {
      for (const t of tickets) {
        if (!t.name || !t.price || !t.quantity) {
          setError("Please complete all ticket tier fields.");
          return false;
        }
      }
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(Math.min(totalSteps, step + 1));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const payload = {
        organizer_id: organizerId,
        title,
        description,
        category, // ID or string
        image_url: imageBase64,
        date: startsAt,
        end_date: endsAt,
        location: `${venueName}, ${city}`,
        tickets: tickets.map(t => ({
          name: t.name,
          price: parseFloat(t.price),
          quantity: parseInt(t.quantity, 10)
        }))
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event.");

      router.push("/organizer/events");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/organizer/dashboard" className="p-2 bg-surface border border-border rounded-full hover:bg-background transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Create New Event</h1>
          <p className="text-sm text-muted">Step {step} of {totalSteps}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-border'}`} />
        ))}
      </div>

      {error && (
        <div className="bg-error-bg text-error p-4 rounded-xl text-sm font-bold animate-shake">
          {error}
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-bold font-serif border-b border-border pb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Event Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Accra Tech Summit 2026" 
                  className="w-full border border-border rounded-lg p-3 outline-none focus:border-primary bg-background text-primary" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell people what your event is about..." 
                  className="w-full border border-border rounded-lg p-3 outline-none focus:border-primary bg-background text-primary min-h-[120px]" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-border rounded-lg p-3 outline-none focus:border-primary bg-background text-primary"
                >
                  <option value="">Select a category...</option>
                  {categoriesList.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Event Banner</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                />
                
                {imageBase64 ? (
                  <div className="relative rounded-xl overflow-hidden border border-border group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <img src={imageBase64} alt="Banner Preview" className="w-full h-64 object-cover" />
                    <div className="absolute inset-0 bg-overlay flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-foreground">
                      <ImageIcon size={32} className="mb-2" />
                      <p className="font-bold">Change Image</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center text-center cursor-pointer hover:bg-background hover:border-primary transition-colors group"
                  >
                    <ImageIcon size={32} className="text-muted group-hover:text-primary mb-3 transition-colors" />
                    <p className="font-bold text-sm text-primary">Click to upload banner image</p>
                    <p className="text-xs text-muted mt-1">1920x1080px recommended, max 5MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-bold font-serif border-b border-border pb-4">Date & Location</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Starts At</label>
                <input 
                  type="datetime-local" 
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full border border-border rounded-lg p-3 outline-none focus:border-primary bg-background text-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Ends At</label>
                <input 
                  type="datetime-local" 
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full border border-border rounded-lg p-3 outline-none focus:border-primary bg-background text-primary" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Venue Name</label>
                <input 
                  type="text" 
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. Accra International Conference Centre" 
                  className="w-full border border-border rounded-lg p-3 outline-none focus:border-primary bg-background text-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">City</label>
                <input 
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Accra" 
                  className="w-full border border-border rounded-lg p-3 outline-none focus:border-primary bg-background text-primary" 
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-bold font-serif border-b border-border pb-4">Tickets & Pricing</h2>
            
            <div className="space-y-4">
              {tickets.map((ticket, index) => (
                <div key={ticket.id} className="border border-border rounded-xl p-4 space-y-4 bg-background/50 relative group">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-primary">Ticket Tier {index + 1}</h3>
                    {tickets.length > 1 && (
                      <button 
                        onClick={() => removeTicketTier(ticket.id)}
                        className="text-error opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-error-bg rounded-md"
                        title="Remove Tier"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-muted">Ticket Name</label>
                      <input 
                        type="text" 
                        value={ticket.name}
                        onChange={(e) => updateTicketTier(ticket.id, 'name', e.target.value)}
                        placeholder="e.g. VIP" 
                        className="w-full border border-border rounded-lg p-2 outline-none focus:border-primary bg-background text-primary" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-muted">Price (₵)</label>
                      <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={ticket.price}
                        onChange={(e) => updateTicketTier(ticket.id, 'price', e.target.value)}
                        placeholder="0.00" 
                        className="w-full border border-border rounded-lg p-2 outline-none focus:border-primary bg-background text-primary" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-muted">Quantity</label>
                      <input 
                        type="number" 
                        min="1"
                        value={ticket.quantity}
                        onChange={(e) => updateTicketTier(ticket.id, 'quantity', e.target.value)}
                        placeholder="100" 
                        className="w-full border border-border rounded-lg p-2 outline-none focus:border-primary bg-background text-primary" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={addTicketTier}
              className="w-full py-3 border-2 border-dashed border-border rounded-xl font-bold text-sm text-primary hover:bg-background hover:border-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add another ticket tier
            </button>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between pt-6 border-t border-border">
          <button 
            onClick={() => {
              setError(null);
              setStep(Math.max(1, step - 1));
            }}
            disabled={step === 1 || loading}
            className="px-6 py-2 border border-border rounded-lg font-bold text-sm hover:bg-background disabled:opacity-50 text-primary transition-colors"
          >
            Back
          </button>
          
          <div className="flex gap-3">
            {step < totalSteps ? (
              <button 
                onClick={handleNext}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:bg-primary/90 flex items-center gap-2 transition-colors"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {loading ? "Publishing..." : "Publish Event"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
