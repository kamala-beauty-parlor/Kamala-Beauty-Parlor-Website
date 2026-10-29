import React, { useState } from 'react';
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
  ExternalLink,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { DynamicSections } from '../components/DynamicSections';

interface AboutProps {
  setCurrentTab: (tab: string) => void;
}

export const About: React.FC<AboutProps> = ({ setCurrentTab }) => {
  const { settings, sendCustomerMessage } = useSite();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setErrorMessage('Please provide your name and a brief message.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await sendCustomerMessage({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
        read: false,
        createdAt: new Date().toISOString()
      });
      setSuccessMessage(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err) {
      console.error('Contact inquiry error:', err);
      setErrorMessage('Unable to send message right now. Please call or WhatsApp us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Get in Touch with Kamala Beauty Parlor
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Reach out directly by phone, email, or WhatsApp, or visit us in Swayambhu, Panchdhara.
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
                <p className="text-[11px] text-stone-500 mt-1">Direct calls for bookings & questions</p>
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
                <p className="text-[11px] text-stone-500 mt-1">For package quotes & inquiries</p>
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

        {/* Detailed Info Grid: Hours & Map on Left, Quick Message Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Hours & Interactive Map */}
          <div className="lg:col-span-6 space-y-6">
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

            {/* Google Map Embed */}
            <div className="bg-white rounded-3xl overflow-hidden border-2 border-pink-200 shadow-xs">
              <div className="px-5 py-3 bg-pink-50 border-b border-pink-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-pink-950">
                  <MapPin className="w-4 h-4 text-pink-600" />
                  <span>Swayambhu, Panchdhara on Map</span>
                </div>
                <a
                  href={settings.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 inline-flex items-center gap-1"
                >
                  <span>Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="aspect-[16/9] w-full bg-stone-100">
                <iframe
                  title="Kamala Beauty Parlor Location Map"
                  src={settings.mapsEmbedUrl || "https://maps.google.com/maps?q=Swayambhu%20Panchdhara%20Kathmandu&t=&z=15&ie=UTF8&iwloc=&output=embed"}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full min-h-[240px]"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Quick Message Form */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border-2 border-pink-200 shadow-sm space-y-5">
            <div>
              <span className="text-xs font-bold text-pink-600 uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
                Send an Inquiry
              </span>
              <h3 className="font-serif text-2xl font-bold text-pink-950 mt-2">
                Drop a Message to Kamala
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Have a question about bridal makeup, training courses, or hair styling? Send us a note and we will reply promptly.
              </p>
            </div>

            {successMessage ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-in fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-serif text-lg font-bold text-emerald-950">
                  Dhanyabad! Message Received
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
                  Kamala didi has received your inquiry. We will call or WhatsApp you soon.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(false)}
                  className="mt-2 text-xs font-bold text-emerald-700 underline cursor-pointer hover:text-emerald-900"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sita Shrestha"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Phone Number (Nepal)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98XXXXXXXX"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sita@gmail.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Your Message or Inquiry *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about bridal package pricing, training course admission, or skin treatments..."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm outline-none transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-pink-600 via-rose-600 to-[#8A2E44] hover:opacity-95 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>{isSubmitting ? 'Sending Message...' : 'Send Inquiry to Kamala'}</span>
                </button>
              </form>
            )}
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
