import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSite } from '../context/SiteContext';

interface FloatingWhatsAppProps {
  currentTab?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ currentTab }) => {
  const { settings } = useSite();

  // When the admin page is opened, the customer-facing "Need quick booking?" widget is not required
  if (currentTab === 'admin' || (typeof window !== 'undefined' && window.location.hash === '#admin')) {
    return null;
  }

  const phoneClean = settings.whatsapp.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(
    'Namaste Kamala Beauty Parlor! I would like to enquire about your services and book an appointment.'
  )}`;

  return (
    <div className="fixed bottom-20 sm:bottom-22 right-5 z-40 flex flex-col items-end pointer-events-auto">
      {/* Floating Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group relative flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6 fill-current" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        </div>
        <span className="font-medium text-sm hidden sm:inline-block pr-1 font-sans tracking-wide">
          WhatsApp Us
        </span>
      </a>
    </div>
  );
};
