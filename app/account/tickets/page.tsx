import { QrCode, Calendar, MapPin, Download, Share } from "lucide-react";

export default function MyTickets() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-serif font-bold text-primary">My Tickets</h1>
        <div className="flex bg-surface border border-border rounded-lg p-1">
          <button className="px-4 py-1.5 rounded-md text-sm font-bold bg-background text-primary shadow-sm border border-border">Upcoming</button>
          <button className="px-4 py-1.5 rounded-md text-sm font-bold text-muted hover:text-primary">Past</button>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Ticket Card */}
        <div className="bg-surface border border-border rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 md:p-8 flex-1 border-b md:border-b-0 md:border-r border-dashed border-border relative">
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-background rounded-full hidden md:block"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-background rounded-full hidden md:block"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-accent/10 text-accent font-bold text-xs px-3 py-1.5 rounded-md">VIP PASS</span>
              <span className="text-muted text-sm font-bold">1x Ticket</span>
            </div>
            
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary leading-tight mb-4">Accra Tech Summit 2026</h2>
            
            <div className="space-y-3 mb-8">
              <p className="flex items-center gap-2 text-muted text-sm font-medium">
                <Calendar size={16} className="text-accent" /> Saturday, Oct 12, 2026 • 09:00 AM
              </p>
              <p className="flex items-center gap-2 text-muted text-sm font-medium">
                <MapPin size={16} className="text-primary" /> Accra International Conference Centre
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border">
              <div>
                <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Attendee</p>
                <p className="font-bold">Ama Serwaa</p>
              </div>
              <div>
                <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Order Ref</p>
                <p className="font-bold">#ORD-9128</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-8 bg-surface w-full md:w-64 flex flex-col items-center justify-center shrink-0">
            <div className="w-32 h-32 bg-background border-2 border-primary rounded-xl mb-6 flex items-center justify-center">
              <QrCode size={80} className="text-primary" />
            </div>
            
            <p className="text-xs text-muted text-center mb-6 max-w-[150px]">Have this QR code ready for scanning at the gate.</p>
            
            <div className="flex w-full gap-2">
              <button className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-background border border-border rounded-xl text-sm font-bold hover:bg-border transition-colors">
                <Download size={16} /> PDF
              </button>
              <button className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-background border border-border rounded-xl text-sm font-bold hover:bg-border transition-colors">
                <Share size={16} /> Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
