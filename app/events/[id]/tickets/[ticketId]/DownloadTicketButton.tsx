'use client';

import { Download, CalendarPlus } from "lucide-react";

export default function DownloadTicketButton({ 
  eventTitle, 
  eventDate, 
  eventTime, 
  eventLocation 
}: { 
  eventTitle: string, 
  eventDate: string, 
  eventTime: string, 
  eventLocation: string 
}) {
  const handleDownloadCalendar = () => {
    // Generate a simple ICS file
    const startDate = new Date(`${eventDate} ${eventTime}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // add 2 hours

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Tixly//Event Calendar//EN
BEGIN:VEVENT
UID:${new Date().getTime()}@tixly.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${eventTitle}
LOCATION:${eventLocation}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${eventTitle.replace(/\\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <button 
        onClick={handleDownloadCalendar}
        className="flex items-center gap-2 bg-surface-elevated text-primary border border-border px-4 py-2 rounded-xl font-bold hover:bg-border transition-colors text-sm"
      >
        <CalendarPlus size={16} />
        Add to Calendar
      </button>
      <button 
        onClick={() => window.print()}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold hover:bg-opacity-90 transition-colors text-sm"
      >
        <Download size={16} />
        Download Ticket
      </button>
    </>
  );
}
