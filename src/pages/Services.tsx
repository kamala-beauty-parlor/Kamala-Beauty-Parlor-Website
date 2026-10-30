import React, { useState } from 'react';
import { 
  Scissors, 
  Search, 
  Sparkles, 
  Clock, 
  Calendar, 
  MessageCircle, 
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { useLanguage } from '../context/LanguageContext';
import { DynamicSections } from '../components/DynamicSections';
import { formatDuration } from '../lib/formatters';

interface ServicesProps {
  setCurrentTab: (tab: string) => void;
  onSelectServiceToBook?: (serviceTitle: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ setCurrentTab, onSelectServiceToBook }) => {
  const { services, categories: siteCategories, settings } = useSite();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = React.useMemo(() => {
    const fromSite = siteCategories.filter(c => c.visible !== false).map(c => c.name);
    return ['All', ...(fromSite.length > 0 ? fromSite : [
      'Hair',
      'Facial & Skin',
      'Makeup',
      'Nails',
      'Threading & Waxing',
      'Mehendi'
    ])];
  }, [siteCategories]);

  const filteredServices = services
    .filter((item) => (item.available ?? item.isAvailable ?? true) !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
      const sName = item.name || item.title || '';
      const sDesc = item.description || '';
      const matchesSearch =
        sName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

  const handleBookService = (serviceTitle: string) => {
    if (onSelectServiceToBook) {
      onSelectServiceToBook(serviceTitle);
    }
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-14 space-y-8 bg-white pb-28 sm:pb-16 overflow-x-hidden">
      {/* Header Banner - Pink & White */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-700 border border-pink-200 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>Transparent Kathmandu Prices • NPR</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-pink-950">
          {t('nav.services', 'Services & Price Menu')}
        </h1>
        <p className="text-stone-600 text-xs sm:text-base leading-relaxed">
          From rejuvenating facials, hair coloring, and relaxing spas to party glam and bridal transformations. All beauty services use genuine, skin-friendly cosmetics.
        </p>
      </div>

      {/* Sticky Search & Category Filter Toolbar */}
      <div className="sticky top-[58px] sm:top-[66px] z-20 space-y-3 bg-white/95 backdrop-blur-md p-3 sm:p-5 rounded-2xl border border-pink-200 shadow-sm">
        {/* Search Input */}
        <div className="relative max-w-md mx-auto sm:mx-0">
          <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search haircut, facial, bridal, keratin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2.5 text-base sm:text-xs rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-pink-600 font-bold hover:text-pink-800 p-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Categories Chips (Horizontal swipe with tap feedback) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          <Filter className="w-3.5 h-3.5 text-pink-400 flex-shrink-0 hidden sm:block" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'bg-pink-50 text-stone-700 hover:bg-pink-100/80 border border-pink-200'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-pink-50/40 rounded-2xl border border-dashed border-pink-300">
          <Scissors className="w-10 h-10 text-pink-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-stone-700">No services found</h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Try adjusting your search query or select another category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-4 min-h-[44px] px-4 py-2 text-xs font-bold text-pink-600 hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id || service.title}
              className="bg-white rounded-2xl p-4 sm:p-6 border border-pink-100 shadow-xs hover:shadow-md transition-all hover:border-pink-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-pink-800 bg-pink-100/70 px-2.5 py-0.5 rounded-full border border-pink-200">
                    {service.category}
                  </span>
                  <div className="text-right">
                    <span className="font-serif text-2xl sm:text-3xl font-black text-[#8A2E44] tracking-tight">
                      Rs. {service.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 mt-1.5">
                  {service.title}
                </h3>

                <p className="text-stone-700 text-xs sm:text-sm mt-1.5 leading-relaxed font-normal">
                  {service.description ||
                    'Pampering salon treatment executed with professional precision and genuine cosmetics.'}
                </p>

                {service.duration && (
                  <div className="flex items-center gap-1.5 text-xs text-stone-700 mt-2.5 font-bold">
                    <Clock className="w-3.5 h-3.5 text-[#8A2E44]" />
                    <span>Estimated time: {formatDuration(service.duration)}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons with 44px+ touch target */}
              <div className="pt-4 mt-3 border-t border-pink-50 flex items-center gap-2">
                <button
                  onClick={() => handleBookService(service.title)}
                  className="flex-1 min-h-[44px] bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-white" />
                  <span>Book Now</span>
                </button>

                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Namaste Kamala Beauty Parlor, I want to book an appointment for: ${service.title} (Price: Rs. ${service.price}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] bg-[#25D366] hover:bg-[#20be5a] text-white py-2.5 px-3.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 shadow-xs active:scale-95"
                  title="Direct booking on WhatsApp (No sign-in required)"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Packages / Wedding Bridal Notice */}
      <div className="bg-gradient-to-r from-pink-50 via-pink-100/40 to-white rounded-3xl p-5 sm:p-8 border border-pink-200 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xs">
        <div className="space-y-1.5 text-center md:text-left">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-pink-950">
            Need a Customized Bridal or Festival Package?
          </h3>
          <p className="text-stone-600 text-xs sm:text-sm max-w-xl">
            We provide bridal makeover packages including HD Airbrush makeup, luxury hair updos, saree draping, and pre-wedding skin therapies at discounted combo rates.
          </p>
        </div>

        <a
          href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
            'Hello Kamala Ma’am, I would like to inquire about customized bridal / festival beauty packages.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[46px] bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-xs transition flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
        >
          <span>Inquire Bridal Combos</span>
          <ArrowRight className="w-4 h-4 text-pink-200" />
        </a>
      </div>

      <DynamicSections page="services" setCurrentTab={setCurrentTab} />
    </div>
  );
};

export default Services;
