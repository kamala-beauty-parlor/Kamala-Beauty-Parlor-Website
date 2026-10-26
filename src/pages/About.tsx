import React from 'react';
import { 
  Heart, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  ArrowRight 
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
      {/* Top Hero Story in Pink & White */}
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

      {/* Location Connection in Pink & White */}
      <div className="bg-gradient-to-r from-pink-50 via-white to-pink-50 rounded-3xl p-8 sm:p-12 border border-pink-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-pink-600 uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-pink-500" />
            <span>Swayambhu, Panchdhara • Kathmandu Valley</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-pink-950">
            A Peaceful Sanctuary Away From City Rush
          </h3>

          <p className="text-stone-600 text-sm leading-relaxed">
            Conveniently situated right at Panchdhara near the iconic Swayambhu Stupa, our parlor provides a calm, air-conditioned haven where you can unwind while our stylists cater to your beauty needs.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => {
                setCurrentTab('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition shadow-xs"
            >
              View Location Map & Contact
            </button>

            <button
              onClick={() => {
                setCurrentTab('booking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="border-2 border-pink-500 text-pink-700 hover:bg-pink-50 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition"
            >
              Book Your Visit
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-pink-200 shadow-sm text-center">
          <Clock className="w-8 h-8 text-pink-500 mx-auto mb-2" />
          <h4 className="font-serif font-bold text-pink-950 text-lg">Parlor Hours</h4>
          <p className="text-xs text-stone-500 mt-1 font-medium">Sunday – Friday</p>
          <p className="text-sm font-bold text-pink-600">8:00 AM – 7:00 PM</p>
          <p className="text-xs text-stone-500 mt-2 font-medium">Saturday</p>
          <p className="text-sm font-bold text-pink-600">9:00 AM – 5:00 PM</p>
          <p className="text-[11px] text-stone-400 mt-2 italic">Walk-ins welcome, bookings prioritized</p>
        </div>
      </div>

      <DynamicSections page="about" setCurrentTab={setCurrentTab} />
    </div>
  );
};
