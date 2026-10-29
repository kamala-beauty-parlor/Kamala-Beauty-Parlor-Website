import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { useSite } from '../context/SiteContext';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const { settings } = useSite();

  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-b from-pink-50/80 via-pink-50 to-pink-100/60 text-stone-700 pt-16 pb-12 border-t-2 border-pink-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-300 bg-white p-0.5 shadow-sm">
                <img
                  src="/assets/aistudio/Kamala_Beauty_Parlor_Gold_Emblem_f4a21eee.png"
                  alt="Kamala Beauty Parlor"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold tracking-wide text-pink-900">
                  Kamala
                </h3>
                <p className="text-xs uppercase font-bold tracking-widest text-pink-600">
                  Beauty Parlor
                </p>
              </div>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed">
              Kathmandu’s premier destination for luxury bridal transformations, hair rejuvenation, facials, and beauty rituals in Swayambhu, Panchdhara.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {/* Instagram */}
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @makeupkamala"
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* TikTok */}
              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok @makeup.kamala"
                className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.48 6.28 6.28 0 0 0 1.87-4.48V8.71a8.21 8.21 0 0 0 4.9 1.6V6.85a4.78 4.78 0 0 1-1-.16z"/>
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-bold text-pink-900 tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-stone-600">
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-pink-600 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('services')}
                  className="hover:text-pink-600 transition-colors"
                >
                  Services & Prices (NPR)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('gallery')}
                  className="hover:text-pink-600 transition-colors"
                >
                  Client Transformations Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-pink-600 transition-colors"
                >
                  About Us & Contact Info
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('booking')}
                  className="hover:text-pink-600 transition-colors font-semibold text-pink-700"
                >
                  Book Appointment
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Services */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-bold text-pink-900 tracking-wide">
              Popular Treatments
            </h4>
            <ul className="space-y-2 text-sm text-stone-600">
              <li className="flex items-center justify-between">
                <span>HD Bridal Makeup</span>
                <span className="text-pink-700 font-bold">Rs. 30,000</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Keratin Hair Treatment</span>
                <span className="text-pink-700 font-bold">Rs. 7,000</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Hydra / Glow Facial</span>
                <span className="text-pink-700 font-bold">Rs. 3,000</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Party Glam Makeup</span>
                <span className="text-pink-700 font-bold">Rs. 3,500</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Rebonding & Smoothening</span>
                <span className="text-pink-700 font-bold">Rs. 6,000</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Gel Nail Polish</span>
                <span className="text-pink-700 font-bold">Rs. 1,200</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-bold text-pink-900 tracking-wide">
              Visit or Contact
            </h4>
            <div className="space-y-2.5 text-sm text-stone-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-pink-600 flex-shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-pink-700 font-medium">
                  {settings.phone} / WhatsApp
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-pink-600 flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-pink-700">
                  {settings.email}
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                <span>
                  {typeof settings.openingHours === 'string' 
                    ? settings.openingHours 
                    : Array.isArray(settings.openingHours)
                    ? settings.openingHours.map(o => `${o.day}: ${o.closed ? 'Closed' : `${o.open} - ${o.close}`}`).join(' | ')
                    : 'Sun–Fri: 8:00 AM – 7:00 PM'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={settings.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-700 bg-white hover:bg-pink-100/80 px-3.5 py-2 rounded-full border border-pink-200 transition-colors shadow-xs"
              >
                <span>Get Directions (Google Maps)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-pink-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Kamala Beauty Parlor. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-pink-500 fill-current" /> in Kathmandu
            </span>
            <span>•</span>
            <button
              onClick={() => handleNav('login')}
              className="text-pink-700 font-semibold hover:underline flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
