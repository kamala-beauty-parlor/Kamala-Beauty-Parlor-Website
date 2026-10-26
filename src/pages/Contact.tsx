import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useSite } from '../context/SiteContext';
import { DynamicSections } from '../components/DynamicSections';

interface ContactProps {
  setCurrentTab?: (tab: string) => void;
}

export const Contact: React.FC<ContactProps> = ({ setCurrentTab }) => {
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
      setErrorMessage('Please fill in your name and message.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await sendCustomerMessage({
        name: name.trim(),
        email: email.trim() || '',
        phone: phone.trim() || '',
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
      console.error('Contact submit error:', err);
      setErrorMessage('Unable to send message right now. Please message us on WhatsApp or call 9851259277 directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 bg-white">
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-pink-600 uppercase tracking-widest bg-pink-50 border border-pink-200 px-4 py-1.5 rounded-full">
          Get in Touch
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-pink-950">
          Contact & Location
        </h1>
        <p className="text-stone-600 text-sm sm:text-base">
          Have questions about bridal packages, haircuts, or want directions? Call, WhatsApp, or drop a message below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Info & Socials */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-200 shadow-xs space-y-6">
            <h2 className="font-serif text-2xl font-bold text-pink-950">
              Parlor Information
            </h2>

            <div className="space-y-4 text-sm text-stone-700">
              {/* Location */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-pink-200">
                  <MapPin className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="font-bold text-pink-950">Location Address</p>
                  <p className="text-stone-600 mt-0.5">{settings.address}</p>
                  <a
                    href={settings.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-pink-600 hover:underline mt-1"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-pink-200">
                  <Phone className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="font-bold text-pink-950">Phone & WhatsApp</p>
                  <p className="text-stone-600 mt-0.5 font-medium">
                    <a href={`tel:${settings.phone}`} className="hover:text-pink-600">
                      {settings.phone}
                    </a>
                  </p>
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#25D366] hover:underline mt-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-pink-200">
                  <Mail className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="font-bold text-pink-950">Email Address</p>
                  <p className="text-stone-600 mt-0.5 font-medium">
                    <a href={`mailto:${settings.email}`} className="hover:text-pink-600">
                      {settings.email}
                    </a>
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-pink-200">
                  <Clock className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="font-bold text-pink-950">Opening Hours</p>
                  <p className="text-stone-600 mt-0.5">
                    {typeof settings.openingHours === 'string'
                      ? settings.openingHours
                      : Array.isArray(settings.openingHours)
                      ? settings.openingHours.map(o => `${o.day}: ${o.closed ? 'Closed' : `${o.open} - ${o.close}`}`).join(' | ')
                      : 'Sun–Fri: 8:00 AM – 7:00 PM'}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-4 border-t border-pink-100">
              <p className="text-xs font-bold uppercase tracking-wider text-pink-900 mb-3">
                Connect on Social Media
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-xs hover:scale-105 transition"
                >
                  <span>Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 text-white text-xs font-bold shadow-xs hover:scale-105 transition"
                >
                  <span>TikTok</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Message Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-200 shadow-xs">
            <h2 className="font-serif text-2xl font-bold text-pink-950">
              Send Us a Message
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 mb-6">
              Fill out this quick form and we’ll get back to you promptly.
            </p>

            {successMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Message Sent Successfully!</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Thank you for reaching out. Kamala Ma’am will reply as soon as possible.
                  </p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarita Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9841XXXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sarita@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Your Message or Question *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry, event date, or beauty service questions..."
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50 active:scale-95"
              >
                <Send className="w-4 h-4 text-white" />
                <span>{isSubmitting ? 'Sending Message...' : 'Submit Message'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Embedded Google Map Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-pink-950">
              Interactive Location Map
            </h3>
            <p className="text-xs sm:text-sm text-stone-500">
              Swayambhu, Panchdhara, Kathmandu, Nepal
            </p>
          </div>

          <a
            href={settings.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-5 py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition"
          >
            <MapPin className="w-4 h-4 text-white" />
            <span>Get Directions (Google Maps)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Embedded iframe */}
        <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-pink-100 shadow-inner bg-pink-50/20">
          <iframe
            title="Kamala Beauty Parlor Location Map"
            src={settings.mapsEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <DynamicSections page="contact" setCurrentTab={setCurrentTab || (() => {})} />
    </div>
  );
};
