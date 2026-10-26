import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { useSite } from '../context/SiteContext';

interface FloatingWhatsAppProps {
  currentTab?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ currentTab }) => {
  const { settings } = useSite();

  // Hide on admin page to avoid distraction
  if (currentTab === 'admin' || (typeof window !== 'undefined' && window.location.hash === '#admin')) {
    return null;
  }

  const phoneClean = settings.whatsapp.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(
    'Namaste Kamala Beauty Parlor! I would like to enquire about your beauty services and book an appointment.'
  )}`;

  return (
    <div
      aria-label="Direct Contact Actions"
      className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-30 flex flex-col items-end gap-2.5 pointer-events-auto"
    >
      {/* 1. Quick Call Button */}
      <a
        href={`tel:${settings.phone}`}
        aria-label={`Call Kamala Beauty Parlor at ${settings.phone}`}
        className="w-11 h-11 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2.5 rounded-full bg-white text-[#8A2E44] border-2 border-pink-300 shadow-lg flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 hover:bg-pink-50"
      >
        <Phone className="w-5 h-5 text-[#8A2E44]" />
        <span className="hidden sm:inline font-bold text-xs">
          Call {settings.phone}
        </span>
      </a>

      {/* 2. WhatsApp Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp with Kamala Beauty Parlor"
        className="w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
      >
        <div className="relative flex items-center justify-center">
          <MessageCircle className="w-6 h-6 fill-current" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        </div>
        <span className="hidden sm:inline font-bold text-xs tracking-wide">
          WhatsApp Us
        </span>
      </a>
    </div>
  );
};
