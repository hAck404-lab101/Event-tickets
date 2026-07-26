"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Save, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function EventCreateWizard() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

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
          <div key={s} className={\`h-2 flex-1 rounded-full \${s <= step ? 'bg-accent' : 'bg-border'}\`} />
        ))}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-serif border-b border-border pb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Event Title</label>
                <input type="text" placeholder="e.g. Accra Tech Summit 2026" className="w-full border border-border rounded-lg p-3 outline-none focus:border-primary" />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">Category</label>
                <select className="w-full border border-border rounded-lg p-3 outline-none focus:border-primary bg-transparent">
                  <option>Select a category...</option>
                  <option>Technology</option>
                  <option>Music</option>
                  <option>Business</option>
                  <option>Food & Drink</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Event Banner</label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center text-center cursor-pointer hover:bg-background transition-colors">
                  <ImageIcon size={32} className="text-muted mb-3" />
                  <p className="font-bold text-sm">Click to upload banner image</p>
                  <p className="text-xs text-muted mt-1">1920x1080px recommended, max 5MB</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-serif border-b border-border pb-4">Date & Location</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Starts At</label>
                <input type="datetime-local" className="w-full border border-border rounded-lg p-3 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Ends At</label>
                <input type="datetime-local" className="w-full border border-border rounded-lg p-3 outline-none focus:border-primary" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Venue Name</label>
                <input type="text" placeholder="e.g. Accra International Conference Centre" className="w-full border border-border rounded-lg p-3 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">City</label>
                <input type="text" placeholder="e.g. Accra" className="w-full border border-border rounded-lg p-3 outline-none focus:border-primary" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-serif border-b border-border pb-4">Tickets & Pricing</h2>
            
            <div className="border border-border rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Ticket Tier 1</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-muted">Ticket Name</label>
                  <input type="text" defaultValue="Regular" className="w-full border border-border rounded-lg p-2 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-muted">Price (₵)</label>
                  <input type="number" defaultValue="150" className="w-full border border-border rounded-lg p-2 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-muted">Available Quantity</label>
                  <input type="number" defaultValue="500" className="w-full border border-border rounded-lg p-2 outline-none focus:border-primary" />
                </div>
              </div>
            </div>
            
            <button className="w-full py-3 border-2 border-dashed border-border rounded-xl font-bold text-sm text-primary hover:bg-background transition-colors">
              + Add another ticket tier
            </button>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between pt-6 border-t border-border">
          <button 
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-2 border border-border rounded-lg font-bold text-sm hover:bg-background disabled:opacity-50"
          >
            Back
          </button>
          
          <div className="flex gap-3">
            <button className="px-6 py-2 border border-border rounded-lg font-bold text-sm hover:bg-background flex items-center gap-2 text-muted hover:text-primary">
              <Save size={16} /> Save Draft
            </button>
            {step < totalSteps ? (
              <button 
                onClick={() => setStep(Math.min(totalSteps, step + 1))}
                className="px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-opacity-90 flex items-center gap-2"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button className="px-6 py-2 bg-accent text-white rounded-lg font-bold text-sm hover:bg-opacity-90">
                Publish Event
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
