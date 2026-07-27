"use client";

import { useState } from "react";
import { ScanFace, CheckCircle2, XCircle, Search, Clock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function TicketScanner() {
  const [scanResult, setScanResult] = useState<'idle' | 'valid' | 'invalid' | 'used'>('idle');
  const [ticketId, setTicketId] = useState("");
  const [ticketData, setTicketData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleLookup = async () => {
    if (!ticketId.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_types(name),
          order:orders(customer_name, reference)
        `)
        .eq('ticket_code', ticketId)
        .single();

      if (error || !data) {
        setScanResult('invalid');
      } else {
        setTicketData(data);
        if (data.status === 'valid') {
          setScanResult('valid');
          const { error: updateError } = await supabase.from('tickets').update({ status: 'checked_in' }).eq('id', data.id);
          if (updateError) {
            await supabase.from('tickets').update({ status: 'used' }).eq('id', data.id);
          }
        } else if (data.status === 'used' || data.status === 'checked_in') {
          setScanResult('used');
        } else {
          setScanResult('invalid');
        }
      }
    } catch (e) {
      setScanResult('invalid');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setScanResult('idle');
        setTicketData(null);
        setTicketId("");
      }, 5000);
    }
  };


  return (
    <div className="max-w-2xl mx-auto space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Ticket Scanner</h1>
          <p className="text-sm text-muted">Scan QR codes or look up tickets manually.</p>
        </div>
      </div>

      <div className="flex-1 bg-surface border border-border rounded-2xl p-4 sm:p-8 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
        {scanResult === 'idle' && (
          <div className="text-center flex flex-col items-center max-w-sm mx-auto w-full">
            <div className="w-48 h-48 border-4 border-dashed border-border rounded-3xl mb-6 relative flex items-center justify-center">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-3xl -m-1"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-3xl -m-1"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-3xl -m-1"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-3xl -m-1"></div>
              
              <ScanFace size={48} className="text-muted animate-pulse" />
            </div>
            <h2 className="text-xl font-bold mb-2">Ready to Scan</h2>
            <p className="text-muted text-sm mb-8">Position the QR code within the frame to scan automatically.</p>
            
            <div className="w-full relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-muted" />
              </div>
              <input 
                type="text" 
                placeholder="Enter ticket code (TCK-...)" 
                className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-24 outline-none focus:border-primary text-sm font-mono"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              />
              <button 
                onClick={handleLookup}
                disabled={isLoading || !ticketId}
                className="absolute inset-y-1 right-1 bg-primary text-white text-xs font-bold px-4 rounded-md disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : "Lookup"}
              </button>
            </div>
          </div>
        )}

        {scanResult === 'valid' && ticketData && (
          <div className="text-center flex flex-col items-center max-w-sm mx-auto w-full animate-in zoom-in duration-300">
            <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={64} className="text-green-600" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-green-700 mb-2">Valid Ticket</h2>
            
            <div className="w-full bg-background border border-border rounded-xl p-4 mt-6 text-left space-y-3">
              <div>
                <p className="text-xs text-muted font-bold uppercase tracking-wider">Attendee</p>
                <p className="font-bold text-lg">{ticketData.order?.customer_name}</p>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <div>
                  <p className="text-xs text-muted font-bold uppercase tracking-wider">Ticket Type</p>
                  <p className="font-bold">{ticketData.ticket_types?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted font-bold uppercase tracking-wider">Order</p>
                  <p className="font-bold">#{ticketData.order?.reference}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {scanResult === 'used' && ticketData && (
          <div className="text-center flex flex-col items-center max-w-sm mx-auto w-full animate-in zoom-in duration-300">
            <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <Clock size={64} className="text-yellow-600" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-yellow-700 mb-2">Already Scanned</h2>
            <p className="text-yellow-800 text-sm font-medium">This ticket has already been used.</p>
            
            <div className="w-full bg-background border border-border rounded-xl p-4 mt-6 text-left space-y-3 opacity-75">
              <div>
                <p className="text-xs text-muted font-bold uppercase tracking-wider">Attendee</p>
                <p className="font-bold text-lg">{ticketData.order?.customer_name}</p>
              </div>
            </div>
          </div>
        )}

        {scanResult === 'invalid' && (
          <div className="text-center flex flex-col items-center max-w-sm mx-auto w-full animate-in zoom-in duration-300">
            <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle size={64} className="text-red-600" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-red-700 mb-2">Invalid Ticket</h2>
            <p className="text-red-800 text-sm font-medium">This ticket does not exist or was cancelled.</p>
          </div>
        )}
      </div>
    </div>
  );
}
