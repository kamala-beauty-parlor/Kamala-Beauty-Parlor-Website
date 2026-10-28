import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Heart, 
  PhoneCall, 
  Award, 
  ShieldCheck, 
  Clock,
  Scissors,
  Eye,
  Smile,
  Navigation,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { useLanguage } from '../context/LanguageContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { ReviewModal } from '../components/ReviewModal';
import { DynamicSections } from '../components/DynamicSections';

interface HomeProps {
  setCurrentTab: (tab: string) => void;
  onSelectServiceToBook?: (serviceTitle: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setCurrentTab, onSelectServiceToBook }) => {
  const { settings, services, testimonials, gallery } = useSite();
  const { t } = useLanguage();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const featuredServices = services.filter((s) => s.isFeatured).slice(0, 8);
  const previewGallery = gallery.slice(0, 6);

  const handleBook = (serviceName?: string) => {
    if (serviceName && onSelectServiceToBook) {
      onSelectServiceToBook(serviceName);
    }
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-12 sm:space-y-20 bg-white pb-28 sm:pb-16 overflow-x-hidden">
      {/* 1. HERO SECTION - Mobile-first & thumb-friendly */}
      <section className="relative overflow-hidden bg-gradient-to-b from-pink-50/80 via-white to-white pt-6 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-pink-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white border border-pink-200 px-3.5 py-1.5 rounded-full shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-pink-600" />
              <span className="text-[11px] font-bold text-pink-800 uppercase tracking-wider">
                Swayambhu, Kathmandu • Nepal
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-pink-950 leading-[1.18]">
              {settings.heroTitle}
            </h1>

            <p className="text-stone-600 text-sm sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans font-normal">
              {settings.heroSubtitle}
            </p>

            {/* Quick Action Contact Pills (Instant 1-Tap on Mobile) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <a
                href={`tel:${settings.phone}`}
                className="min-h-[44px] bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-900 px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5 text-pink-600" />
                <span>Call {settings.phone}</span>
              </a>

              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  'Namaste Kamala Beauty Parlor, I would like to inquire about appointments.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#128C7E] px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
                <span>WhatsApp</span>
              </a>

              <a
                href={settings.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5 text-pink-600" />
                <span>Directions</span>
              </a>

              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-900 px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1 transition active:scale-95"
              >
                <span>Instagram</span>
              </a>

              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-900 px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1 transition active:scale-95"
              >
                <span>TikTok</span>
              </a>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => handleBook()}
                className="w-full sm:w-auto min-h-[48px] bg-gradient-to-r from-pink-500 via-pink-600 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-95 cursor-pointer"
              >
                <Calendar className="w-5 h-5 text-white" />
                <span>{settings.heroCtaText || t('nav.book_now', 'Book Appointment')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setCurrentTab('services')}
                className="w-full sm:w-auto min-h-[48px] bg-white border-2 border-pink-300 hover:bg-pink-50 text-pink-900 px-6 py-3 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>{t('action.view_menu', 'View Services & Prices')}</span>
              </button>
            </div>

            {/* Highlights row */}
            <div className="pt-4 border-t border-pink-100 grid grid-cols-3 gap-2 text-center sm:text-left">
              <div>
                <p className="font-serif text-xl sm:text-3xl font-bold text-pink-600">10+ Yrs</p>
                <p className="text-[11px] sm:text-xs text-stone-500 font-medium">Kathmandu Exp.</p>
              </div>
              <div>
                <p className="font-serif text-xl sm:text-3xl font-bold text-pink-600">100%</p>
                <p className="text-[11px] sm:text-xs text-stone-500 font-medium">Sterile & Safe</p>
              </div>
              <div>
                <p className="font-serif text-xl sm:text-3xl font-bold text-pink-600">5,000+</p>
                <p className="text-[11px] sm:text-xs text-stone-500 font-medium">Happy Clients</p>
              </div>
            </div>
          </div>

          {/* Right Hero Visual / Logo */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[400px] aspect-square rounded-3xl p-3 bg-gradient-to-tr from-pink-200 via-pink-100 to-rose-200 shadow-xl border-4 border-white">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-white shadow-inner flex items-center justify-center relative group">
                <img
                  src="/assets/aistudio/Kamala_Beauty_Parlor_Gold_Emblem_f4a21eee.png"
                  alt="Kamala Beauty Parlor Emblem"
                  loading="eager"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />

                {/* Floating Badge */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-pink-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-pink-600 text-white flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-pink-950">Bridal & Party Makeover</p>
                    <p className="text-[11px] text-pink-700">Natural glow, HD waterproof finish</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SIGNATURE BEAUTY PARLOR SERVICES (Swipeable on mobile, Grid on desktop) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 uppercase tracking-widest mb-1">
              <Scissors className="w-3.5 h-3.5 text-pink-500" />
              <span>Parlor Treatments</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-pink-950">
              Popular Beauty Services
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
              Transparent rates in Nepali Rupees (NPR). Swipe cards or tap to book.
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('services')}
            className="text-xs sm:text-sm font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 self-start sm:self-auto group cursor-pointer"
          >
            <span>{t('action.view_menu', 'View All Services & Prices')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Mobile Swipeable Scroller / Desktop Grid */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {featuredServices.map((service) => (
            <div
              key={service.id || service.title}
              className="min-w-[280px] sm:min-w-0 snap-center bg-white rounded-2xl p-5 border border-pink-100 shadow-xs hover:shadow-md transition-all hover:border-pink-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
                    {service.category}
                  </span>
                  <span className="font-serif text-lg sm:text-xl font-bold text-pink-700">
                    Rs. {service.price.toLocaleString()}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-pink-600 transition-colors">
                  {service.title}
                </h3>

                <p className="text-stone-500 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-relaxed">
                  {service.description || 'Professional beauty salon treatment by certified experts.'}
                </p>

                {service.duration && (
                  <div className="flex items-center gap-1 text-xs text-stone-400 mt-2.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-pink-400" />
                    <span>Duration: {service.duration}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-3 border-t border-pink-50 flex items-center gap-2">
                <button
                  onClick={() => handleBook(service.title)}
                  className="flex-1 min-h-[42px] bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-white" />
                  <span>Book Now</span>
                </button>

                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Namaste Kamala Beauty Parlor, I want to book: ${service.title} (Rs. ${service.price}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[42px] bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-2 rounded-xl transition flex items-center justify-center text-xs font-semibold active:scale-95"
                  title="Book on WhatsApp without login"
                >
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. WHY CHOOSE KAMALA BEAUTY PARLOR */}
      <section className="bg-gradient-to-b from-pink-50/50 via-pink-50/20 to-white py-12 px-4 sm:px-6 lg:px-8 border-y border-pink-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="text-xs font-bold text-pink-600 uppercase tracking-widest bg-pink-100/60 px-3 py-1 rounded-full">
              The Kamala Touch
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-pink-950 mt-2">
              Why Kathmandu Women Love Our Parlor
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-1">
              Cleanliness, genuine cosmetics, and gentle pampering tailored for Nepali skin and hair.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-pink-100 text-center hover:border-pink-300 transition">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center mx-auto mb-3 border border-pink-200">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
              </div>
              <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 mb-1">
                100% Sterile & Hygienic
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed">
                UV-sterilized tools, disposable towels, and freshly sanitized stations for every client.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-pink-100 text-center hover:border-pink-300 transition">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center mx-auto mb-3 border border-pink-200">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
              </div>
              <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 mb-1">
                Genuine Brands
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed">
                Authentic MAC, Kryolan, L’Oréal, and skin-safe treatments without duplicates.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-pink-100 text-center hover:border-pink-300 transition">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center mx-auto mb-3 border border-pink-200">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
              </div>
              <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 mb-1">
                Nepali Skin Mastery
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed">
                Expert foundation shade-matching that avoids ashy or cakey finishes completely.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-pink-100 text-center hover:border-pink-300 transition">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center mx-auto mb-3 border border-pink-200">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 fill-pink-500" />
              </div>
              <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 mb-1">
                Warm Personal Care
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed">
                Relaxing, friendly atmosphere where your comfort and happiness come first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BRIDAL & PARTY GLAM SPECIAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 rounded-3xl p-6 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3.5">
            <span className="text-[11px] font-bold text-pink-900 uppercase tracking-widest bg-white/90 px-3 py-1 rounded-full">
              Bridal & Special Occasions
            </span>

            <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Planning Your Wedding or Big Event?
            </h2>

            <p className="text-pink-100 text-xs sm:text-base leading-relaxed">
              Let Kamala Beauty Parlor make your special day unforgettable. We offer customized packages including HD bridal makeup, luxury hair updos, saree draping, and pre-wedding skin facials.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleBook()}
                className="min-h-[46px] bg-white text-pink-700 hover:bg-pink-50 font-bold px-6 py-3 rounded-full text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Book Bridal Consultation</span>
                <ArrowRight className="w-4 h-4 text-pink-600" />
              </button>

              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  'Namaste Kamala Ma’am! I would like to inquire about bridal / party packages at your parlor.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[46px] bg-pink-700/80 hover:bg-pink-700 text-white font-semibold px-6 py-3 rounded-full text-xs sm:text-sm backdrop-blur transition-all flex items-center justify-center gap-2 border border-pink-400/50 active:scale-95"
              >
                <span>WhatsApp Enquiry</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GALLERY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">
              Real Client Transformations
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-pink-950 mt-1">
              Our Visual Portfolio
            </h2>
          </div>

          <button
            onClick={() => setCurrentTab('gallery')}
            className="text-xs sm:text-sm font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 group self-start sm:self-auto cursor-pointer"
          >
            <span>View Full Gallery ({gallery.length}+ Photos)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          {previewGallery.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => setCurrentTab('gallery')}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer bg-pink-50 shadow-xs border border-pink-100"
            >
              <ImageWithFallback
                src={item.imageUrl}
                alt={item.title}
                category={item.category}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pink-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider text-pink-300">
                  {item.category}
                </span>
                <p className="font-serif text-xs sm:text-sm font-bold truncate">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="bg-pink-50/40 py-10 px-4 sm:px-6 lg:px-8 border-y border-pink-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold text-pink-600 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-pink-200">
                Happy Clients
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-pink-950 mt-1">
                Loved by Women Across Kathmandu
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="min-h-[42px] bg-white hover:bg-pink-50 text-pink-700 border border-pink-300 hover:border-pink-500 font-bold px-5 py-2 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Star className="w-4 h-4 fill-pink-500 text-pink-500" />
              <span>Leave a Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.slice(0, 3).map((t, idx) => (
              <div
                key={t.id || idx}
                className="bg-white rounded-2xl p-5 border border-pink-100 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-pink-500 mb-2.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < t.rating ? 'fill-pink-500 text-pink-500' : 'text-stone-200'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-stone-700 text-xs sm:text-sm leading-relaxed italic">
                    "{t.reviewText}"
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-pink-50 flex items-center justify-between">
                  <div>
                    <p className="font-serif font-bold text-stone-900 text-xs sm:text-sm">
                      {t.clientName}
                    </p>
                    <p className="text-[11px] text-pink-600 font-semibold">
                      {t.serviceName}
                    </p>
                  </div>
                  <span className="text-[10px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full font-bold border border-pink-200">
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>

          <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
          />
        </div>
      </section>

      {/* DYNAMIC SECTIONS (PAGE BUILDER) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DynamicSections page="home" setCurrentTab={setCurrentTab} />
      </section>

      {/* 7. CONTACT & LOCATION STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-gradient-to-r from-pink-50 to-white rounded-3xl p-5 sm:p-8 border border-pink-200 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 text-center lg:text-left">
            <span className="text-[11px] font-bold text-pink-600 uppercase tracking-wider bg-pink-100/60 px-3 py-0.5 rounded-full">
              Swayambhu, Panchdhara
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-pink-950">
              Visit Kamala Beauty Parlor
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm max-w-xl">
              Convenient location at Panchdhara near Swayambhunath. Dedicated personal care and easy parking.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a
              href={`tel:${settings.phone}`}
              className="min-h-[44px] bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-xs transition active:scale-95"
            >
              <PhoneCall className="w-4 h-4 text-white" />
              <span>Call {settings.phone}</span>
            </a>

            <a
              href={settings.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] bg-white border-2 border-pink-300 text-pink-800 hover:bg-pink-50 px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-xs transition active:scale-95"
            >
              <span>Get Directions</span>
              <ArrowRight className="w-4 h-4 text-pink-600" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
