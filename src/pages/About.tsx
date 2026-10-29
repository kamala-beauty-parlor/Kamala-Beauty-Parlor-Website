import React from 'react';
import { 
  Heart, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  MapPin, 
  Phone,
  Mail,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { DynamicSections } from '../components/DynamicSections';

interface AboutProps {
  setCurrentTab: (tab: string) => void;
}

export const About: React.FC<AboutProps> = ({ setCurrentTab }) => {
  const { settings } = useSite();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 bg-white">
      {/* Top Hero Story */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-700 border border-pink-200 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-current" />
            Our Story & Commitment
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-pink-950 leading-tight">
            Personalized Beauty Rituals, Gentle Care & Real Nepali Artistry
          </h1>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Welcome to <strong>Kamala Beauty Parlor</strong>, located in the peaceful neighborhood of Swayambhu, Panchdhara, Kathmandu.
          </p>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Founded by veteran beautician and makeup artist <strong>Kamala</strong>, our parlor is dedicated purely to the beauty, wellness, and self-confidence of women in Kathmandu. Whether you visit for relaxing hair therapies, precision eyebrow threading, rejuvenating facials, or your once-in-a-lifetime bridal makeover, you will experience personalized pampering in a sterile, welcoming environment.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100">
              <p className="font-serif text-2xl font-bold text-pink-600">10+ Years</p>
              <p className="text-xs text-stone-500 mt-1 font-medium">Salon Experience</p>
            </div>
            <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100">
              <p className="font-serif text-2xl font-bold text-pink-600">100%</p>
              <p className="text-xs text-stone-500 mt-1 font-medium">Genuine Cosmetics</p>
            </div>
          </div>
        </div>

        {/* Right Owner / Emblem showcase */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm rounded-3xl overflow-hidden border-2 border-pink-200 shadow-xl bg-gradient-to-b from-pink-50 via-white to-pink-100/50 p-5 text-center">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-pink-100 flex items-center justify-center p-2 mb-4">
              <img
                src="/assets/aistudio/Kamala_Beauty_Parlor_Gold_Emblem_f4a21eee.png"
                alt="Kamala Beauty Parlor Emblem"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            <h3 className="font-serif text-2xl font-bold text-pink-950">
              Kamala
            </h3>
            <p className="text-xs font-bold uppercase tracking-widest text-pink-600 mt-0.5">
              Founder & Beauty Specialist
            </p>
            <p className="text-xs text-stone-600 mt-2 px-2 italic">
              "Beauty is about feeling relaxed, confident, and true to yourself. We treat every client like family."
            </p>
          </div>
        </div>
      </div>

      {/* Our Mission & Values */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-pink-200 shadow-xs space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-pink-600 uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
            Our Standards
          </span>
          <h2 className="font-serif text-3xl font-bold text-pink-950 mt-2">
            What You Can Count On
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 p-4 rounded-2xl bg-pink-50/30 border border-pink-100">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-pink-600" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Hospital-Grade Sanitization
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Sterilized scissors, sanitized brushes, and single-use disposable bedsheets and towels for every client.
            </p>
          </div>

          <div className="space-y-3 p-4 rounded-2xl bg-pink-50/30 border border-pink-100">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-pink-600" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Zero Counterfeit Policy
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Only original, certified cosmetics from authorized brands. We never use cheap duplicates or harsh bleaching agents.
            </p>
          </div>

          <div className="space-y-3 p-4 rounded-2xl bg-pink-50/30 border border-pink-100">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Affordable Luxury
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Transparent Kathmandu pricing in NPR with zero hidden fees. High-end salon experience accessible to all women.
            </p>
          </div>
        </div>
      </div>

      {/* CONTACT & VISIT INFORMATION SECTION */}
      <section id="contact-info" className="space-y-8 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-pink-600 uppercase tracking-widest bg-pink-50 border border-pink-200 px-4 py-1.5 rounded-full">
            Contact & Visit Us
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-pink-950">
            Direct Contact & Parlor Location
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Reach out directly by phone, WhatsApp, or email, or visit our salon in Swayambhu, Panchdhara.
          </p>
        </div>

        {/* 4 Direct Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Phone Card */}
          <div className="bg-white rounded-2xl p-5 border-2 border-pink-200 shadow-xs hover:border-pink-300 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-200">
                <Phone className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Phone Call</p>
                <p className="text-base font-extrabold text-pink-950 mt-0.5">{settings.phone}</p>
                <p className="text-[11px] text-stone-500 mt-1">Direct calls for appointments & inquiries</p>
              </div>
            </div>
            <a
              href={`tel:${settings.phone}`}
              className="mt-4 w-full py-2 px-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold text-center block transition active:scale-95 shadow-xs"
            >
              Call {settings.phone}
            </a>
          </div>

          {/* Email Card */}
          <div className="bg-white rounded-2xl p-5 border-2 border-pink-200 shadow-xs hover:border-pink-300 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-200">
                <Mail className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Email Address</p>
                <p className="text-base font-extrabold text-pink-950 mt-0.5 truncate" title={settings.email}>
                  {settings.email}
                </p>
                <p className="text-[11px] text-stone-500 mt-1">For packages & course information</p>
              </div>
            </div>
            <a
              href={`mailto:${settings.email}`}
              className="mt-4 w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold text-center block transition active:scale-95 shadow-xs"
            >
              Send an Email
            </a>
          </div>

          {/* WhatsApp Card */}
          <div className="bg-white rounded-2xl p-5 border-2 border-pink-200 shadow-xs hover:border-pink-300 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <MessageCircle className="w-5 h-5 text-[#25D366] fill-[#25D366]" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400">WhatsApp</p>
                <p className="text-base font-extrabold text-pink-950 mt-0.5">{settings.whatsapp}</p>
                <p className="text-[11px] text-stone-500 mt-1">Instant photo sharing & chat</p>
              </div>
            </div>
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full py-2 px-3 bg-[#25D366] hover:bg-[#20be5a] text-white rounded-xl text-xs font-bold text-center block transition active:scale-95 shadow-xs"
            >
              Chat on WhatsApp
            </a>
          </div>

          {/* Address Card */}
          <div className="bg-white rounded-2xl p-5 border-2 border-pink-200 shadow-xs hover:border-pink-300 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-200">
                <MapPin className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Parlor Address</p>
                <p className="text-sm font-extrabold text-pink-950 mt-0.5 leading-snug">{settings.address}</p>
                <p className="text-[11px] text-stone-500 mt-1">Near Swayambhu Stupa, Kathmandu</p>
              </div>
            </div>
            <a
              href={settings.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full py-2 px-3 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-300 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Detailed Hours & Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Hours & Sanctuary info */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {/* Opening Hours Box */}
            <div className="bg-gradient-to-r from-pink-50/70 via-white to-pink-50/70 rounded-3xl p-6 sm:p-7 border border-pink-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-pink-950 leading-tight">
                    Opening Hours & Walk-In Policy
                  </h3>
                  <p className="text-xs text-stone-500">Appointments prioritized, walk-ins welcome</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white p-3.5 rounded-2xl border border-pink-100 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                    Sunday – Friday
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-pink-700 mt-0.5 block">
                    8:00 AM – 7:00 PM
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-pink-100 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                    Saturday
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-pink-700 mt-0.5 block">
                    9:00 AM – 5:00 PM
                  </span>
                </div>
              </div>
            </div>

            {/* Visit Details Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-pink-200 shadow-xs space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-pink-600 uppercase tracking-widest bg-pink-50 px-2.5 py-0.5 rounded-full">
                  Location Sanctuary
                </span>
                <h4 className="font-serif text-lg font-bold text-stone-900 mt-2">
                  Easy Access & Comfortable Parlor
                </h4>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mt-1">
                  Located right at Panchdhara, Swayambhu with accessible road access and parking. Our parlor features a clean, air-conditioned interior where you can unwind while receiving personalized beauty care.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <a
                  href={`tel:${settings.phone}`}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Us</span>
                </a>
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#25D366] hover:bg-[#20be5a] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Google Map Embed */}
          <div className="lg:col-span-7 bg-white rounded-3xl overflow-hidden border-2 border-pink-200 shadow-xs flex flex-col">
            <div className="px-5 py-3.5 bg-pink-50 border-b border-pink-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-pink-950">
                <MapPin className="w-4 h-4 text-pink-600" />
                <span>Swayambhu, Panchdhara on Google Maps</span>
              </div>
              <a
                href={settings.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-pink-600 hover:text-pink-700 inline-flex items-center gap-1"
              >
                <span>Get Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="flex-1 w-full bg-stone-100 min-h-[300px]">
              <iframe
                title="Kamala Beauty Parlor Location Map"
                src={settings.mapsEmbedUrl || "https://maps.google.com/maps?q=Swayambhu%20Panchdhara%20Kathmandu&t=&z=15&ie=UTF8&iwloc=&output=embed"}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-[300px]"
              />
            </div>
          </div>
        </div>

        {/* Appointment Booking CTA Banner */}
        <div className="bg-gradient-to-r from-[#8A2E44] via-rose-700 to-[#8A2E44] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Ready for Your Beauty Appointment?
            </h3>
            <p className="text-xs sm:text-sm text-pink-100 max-w-lg">
              Reserve your slot online in under 60 seconds. Choose your services and preferred date with zero prepayment.
            </p>
          </div>

          <button
            onClick={() => {
              setCurrentTab('booking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-3 bg-white text-[#8A2E44] hover:bg-pink-50 rounded-full font-black text-xs sm:text-sm shadow-lg transition active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-[#8A2E44]" />
            <span>Book Appointment Online</span>
          </button>
        </div>
      </section>

      <DynamicSections page="about" setCurrentTab={setCurrentTab} />
    </div>
  );
};

export default About;
