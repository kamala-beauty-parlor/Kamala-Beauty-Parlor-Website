import React, { useState } from 'react';
import { 
  Scissors, 
  Search, 
  Sparkles, 
  Clock, 
  Calendar, 
  MessageCircle, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { DynamicSections } from '../components/DynamicSections';

interface ServicesProps {
  setCurrentTab: (tab: string) => void;
  onSelectServiceToBook?: (serviceTitle: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ setCurrentTab, onSelectServiceToBook }) => {
  const { services, categories: siteCategories, settings } = useSite();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = React.useMemo(() => {
    const fromSite = siteCategories.filter(c => c.visible !== false).map(c => c.name);
    return ['All', ...fromSite.length > 0 ? fromSite : [
      'Hair',
      'Facial & Skin',
      'Makeup',
      'Nails',
      'Threading & Waxing',
      'Mehendi'
    ]];
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 bg-white">
      {/* Header Banner - Pink & White */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-700 border border-pink-200 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          Transparent Pricing • Nepali Rupees (NPR)
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-pink-950">
          Services & Price Menu
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          From rejuvenating facials, hair coloring, and relaxing spas to party glam and bridal transformations. All beauty services use genuine, skin-friendly cosmetics.
        </p>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="space-y-4 bg-white p-4 sm:p-6 rounded-2xl border border-pink-200 shadow-xs">
        {/* Search Input */}
        <div className="relative max-w-md mx-auto sm:mx-0">
          <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search haircut, facial, bridal, keratin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-pink-500 hover:text-pink-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-4 h-4 text-pink-400 flex-shrink-0" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'bg-pink-50 text-stone-700 hover:bg-pink-100/80 border border-pink-100'
                }`}
              >
                {cat}
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
          <p className="text-sm text-stone-500 mt-1">
            Try adjusting your search query or select another category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-4 text-xs font-bold text-pink-600 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id || service.title}
              className="bg-white rounded-2xl p-6 border border-pink-100 shadow-xs hover:shadow-md transition-all hover:border-pink-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
                    {service.category}
                  </span>
                  <div className="text-right">
                    <span className="font-serif text-2xl font-bold text-pink-600">
                      Rs. {service.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <h3 className="font-serif text-xl font-bold text-stone-900 mt-2">
                  {service.title}
                </h3>

                <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  {service.description ||
                    'Pampering salon treatment executed with professional precision and genuine cosmetics.'}
                </p>

                {service.duration && (
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-3 font-medium">
                    <Clock className="w-3.5 h-3.5 text-pink-400" />
                    <span>Estimated time: {service.duration}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons in Pink & White */}
              <div className="pt-5 mt-4 border-t border-pink-50 flex items-center gap-2">
                <button
                  onClick={() => handleBookService(service.title)}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
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
                  className="bg-[#25D366] hover:bg-[#20be5a] text-white py-2.5 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 shadow-xs active:scale-95"
                  title="Direct booking on WhatsApp (No sign-in required)"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Packages / Wedding Bridal Notice in Pink & White */}
      <div className="bg-gradient-to-r from-pink-50 via-pink-100/40 to-white rounded-3xl p-6 sm:p-8 border border-pink-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="font-serif text-2xl font-bold text-pink-950">
            Need a Customized Bridal or Festival Package?
          </h3>
          <p className="text-stone-600 text-sm max-w-xl">
            We provide bridal makeover packages including HD Airbrush makeup, luxury hair updos, saree draping, and pre-wedding skin therapies at discounted combo rates.
          </p>
        </div>

        <a
          href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
            'Hello Kamala Ma’am, I would like to inquire about customized bridal / festival beauty packages.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-full text-sm font-bold shadow-xs transition flex items-center gap-2 whitespace-nowrap"
        >
          <span>Inquire Bridal Combos</span>
          <ArrowRight className="w-4 h-4 text-pink-200" />
        </a>
      </div>

      <DynamicSections page="services" setCurrentTab={setCurrentTab} />
    </div>
  );
};
