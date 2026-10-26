import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  ExternalLink, 
  Calendar, 
  Eye, 
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { useLanguage } from '../context/LanguageContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { GalleryItem } from '../types';

interface GalleryProps {
  setCurrentTab: (tab: string) => void;
  onSelectServiceToBook?: (serviceTitle: string) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ setCurrentTab, onSelectServiceToBook }) => {
  const { gallery, settings } = useSite();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const categories = [
    'All',
    'Bridal',
    'Party',
    'Hair',
    'Nails',
    'Mehendi',
    'Facial'
  ];

  const filteredGallery = gallery
    .filter((item) => item.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((item) => {
      if (selectedCategory === 'All') return true;
      return item.category.toLowerCase() === selectedCategory.toLowerCase();
    });

  const activePhoto = activePhotoIndex !== null ? filteredGallery[activePhotoIndex] : null;

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null && filteredGallery.length > 0) {
      setActivePhotoIndex((activePhotoIndex + 1) % filteredGallery.length);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null && filteredGallery.length > 0) {
      setActivePhotoIndex((activePhotoIndex - 1 + filteredGallery.length) % filteredGallery.length);
    }
  };

  const handleBookFromGallery = (category: string) => {
    if (onSelectServiceToBook) {
      if (category.toLowerCase().includes('bridal')) onSelectServiceToBook('Bridal makeup');
      else if (category.toLowerCase().includes('party')) onSelectServiceToBook('Party makeup');
      else if (category.toLowerCase().includes('hair')) onSelectServiceToBook('Hair spa');
      else if (category.toLowerCase().includes('nail')) onSelectServiceToBook('Gel nail polish');
      else if (category.toLowerCase().includes('mehendi')) onSelectServiceToBook('Bridal mehendi');
    }
    setActivePhotoIndex(null);
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-14 space-y-8 bg-white pb-28 sm:pb-16 overflow-x-hidden">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-700 border border-pink-200 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>Parlor Visual Portfolio</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-pink-950">
          {t('nav.gallery', 'Client Transformations Gallery')}
        </h1>
        <p className="text-stone-600 text-xs sm:text-base leading-relaxed">
          Glimpse real bridal makeovers, party styles, hair smoothening, and detailed mehendi created at Kamala Beauty Parlor in Swayambhu.
        </p>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                isSelected
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-pink-50 border border-pink-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Gallery Grid (2 columns on mobile, 3-4 on desktop) */}
      {filteredGallery.length === 0 ? (
        <div className="text-center py-16 bg-pink-50/30 rounded-3xl border border-dashed border-pink-200 p-6">
          <Eye className="w-10 h-10 text-pink-300 mx-auto mb-3" />
          <h3 className="font-serif text-base font-bold text-stone-700">No photos in this category yet</h3>
          <p className="text-xs text-stone-500 mt-1">
            Check back soon or explore other parlor categories.
          </p>
          <button
            onClick={() => setSelectedCategory('All')}
            className="mt-4 min-h-[44px] px-4 py-2 text-xs font-bold text-pink-600 hover:underline cursor-pointer"
          >
            Show All Photos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredGallery.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => setActivePhotoIndex(idx)}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer bg-pink-50 shadow-xs border border-pink-100 hover:shadow-lg hover:border-pink-300 transition-all active:scale-98"
            >
              <ImageWithFallback
                src={item.imageUrl}
                alt={item.title}
                category={item.category}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Overlay with tap hint */}
              <div className="absolute inset-0 bg-gradient-to-t from-pink-950/80 via-pink-950/20 to-transparent opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity p-2.5 sm:p-4 flex flex-col justify-between text-white">
                <div className="flex justify-end">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </span>
                </div>

                <div>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-pink-200 bg-pink-900/60 px-1.5 py-0.5 rounded">
                    {item.category}
                  </span>
                  <p className="font-serif text-xs sm:text-sm font-bold mt-1 text-white truncate">
                    {item.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Mobile Lightbox with Swipe / Next / Prev */}
      {activePhoto && (
        <div 
          onClick={() => setActivePhotoIndex(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-pink-200 max-h-[92vh] flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={() => setActivePhotoIndex(null)}
              className="absolute top-3 right-3 z-20 min-h-[44px] min-w-[44px] rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
              aria-label="Close photo preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo View with Next & Prev Controls */}
            <div className="relative flex-1 bg-stone-950 flex items-center justify-center min-h-[300px] max-h-[60vh] overflow-hidden select-none">
              <ImageWithFallback
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                category={activePhoto.category}
                className="max-h-[60vh] w-auto max-w-full object-contain mx-auto"
              />

              {/* Prev Button */}
              {filteredGallery.length > 1 && (
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Next Button */}
              {filteredGallery.length > 1 && (
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Photo Details & Actions */}
            <div className="p-4 sm:p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-pink-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
                  {activePhoto.category}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-pink-950 mt-1">
                  {activePhoto.title}
                </h3>
                <p className="text-[11px] text-stone-500">
                  Kamala Beauty Parlor • Swayambhu, Panchdhara
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
                <button
                  onClick={() => handleBookFromGallery(activePhoto.category)}
                  className="flex-1 sm:flex-initial min-h-[44px] bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs active:scale-95 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-white" />
                  <span>Book This Look</span>
                </button>

                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Namaste Kamala Ma’am! I love this look from your parlor gallery: ${activePhoto.title} (${activePhoto.category}). Can I get this done?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] bg-[#25D366] hover:bg-[#20be5a] text-white px-4 py-2.5 rounded-full transition flex items-center justify-center gap-1 text-xs font-semibold active:scale-95"
                  title="Inquire on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Follow Card */}
      <div className="bg-gradient-to-r from-pink-50 via-white to-pink-50 rounded-3xl p-5 sm:p-8 border border-pink-200 text-center space-y-3 max-w-3xl mx-auto shadow-xs">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-pink-950">
          See More Daily Client Reels & Stories
        </h3>
        <p className="text-stone-600 text-xs sm:text-sm">
          Follow Kamala’s daily hair styling, glowing facials, and client transformations on Instagram and TikTok.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-xs active:scale-95 transition-transform"
          >
            <span>Instagram @makeupkamala</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href={settings.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] bg-stone-900 text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-xs active:scale-95 transition-transform"
          >
            <span>TikTok @makeup.kamala</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
