import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  ExternalLink, 
  Calendar, 
  Eye, 
  ZoomIn 
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { GalleryItem } from '../types';

interface GalleryProps {
  setCurrentTab: (tab: string) => void;
  onSelectServiceToBook?: (serviceTitle: string) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ setCurrentTab, onSelectServiceToBook }) => {
  const { gallery, settings } = useSite();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

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

  const handleBookFromGallery = (category: string) => {
    if (onSelectServiceToBook) {
      if (category.toLowerCase().includes('bridal')) onSelectServiceToBook('Bridal makeup');
      else if (category.toLowerCase().includes('party')) onSelectServiceToBook('Party makeup');
      else if (category.toLowerCase().includes('hair')) onSelectServiceToBook('Hair spa');
      else if (category.toLowerCase().includes('nail')) onSelectServiceToBook('Gel nail polish');
      else if (category.toLowerCase().includes('mehendi')) onSelectServiceToBook('Bridal mehendi');
    }
    setActivePhoto(null);
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 bg-white">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-700 border border-pink-200 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
          <Sparkles className="w-4 h-4 text-pink-500" />
          Parlor Visual Portfolio
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-pink-950">
          Client Transformations Gallery
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Glimpse real bridal makeovers, party styles, hair smoothening, and detailed mehendi created at Kamala Beauty Parlor in Swayambhu.
        </p>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
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

      {/* Gallery Grid */}
      {filteredGallery.length === 0 ? (
        <div className="text-center py-20 bg-pink-50/30 rounded-3xl border border-dashed border-pink-200">
          <Eye className="w-10 h-10 text-pink-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-stone-700">No photos in this category yet</h3>
          <p className="text-sm text-stone-500 mt-1">
            Check back soon or explore other parlor categories.
          </p>
          <button
            onClick={() => setSelectedCategory('All')}
            className="mt-4 text-xs font-bold text-pink-600 hover:underline"
          >
            Show All Photos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredGallery.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => setActivePhoto(item)}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer bg-pink-50 shadow-xs border border-pink-100 hover:shadow-lg hover:border-pink-300 transition-all"
            >
              <ImageWithFallback
                src={item.imageUrl}
                alt={item.title}
                category={item.category}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-pink-950/80 via-pink-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between text-white">
                <div className="flex justify-end">
                  <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <ZoomIn className="w-4 h-4 text-white" />
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-200 bg-pink-900/60 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  <p className="font-serif text-base font-bold mt-1 text-white truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-pink-100">Tap to expand</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-pink-200">
            {/* Close Button */}
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
              aria-label="Close photo preview"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Photo View */}
            <div className="max-h-[70vh] bg-stone-950 flex items-center justify-center overflow-hidden">
              <ImageWithFallback
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                category={activePhoto.category}
                className="max-h-[70vh] w-auto object-contain mx-auto"
              />
            </div>

            {/* Photo Details & Actions */}
            <div className="p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-pink-700 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
                  {activePhoto.category}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-pink-950 mt-2">
                  {activePhoto.title}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Kamala Beauty Parlor • Swayambhu, Panchdhara
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleBookFromGallery(activePhoto.category)}
                  className="flex-1 sm:flex-initial bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
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
                  className="bg-[#25D366] hover:bg-[#20be5a] text-white p-2.5 rounded-full transition flex items-center justify-center"
                  title="Inquire on WhatsApp"
                >
                  <span className="text-xs font-semibold px-2">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Follow Card */}
      <div className="bg-gradient-to-r from-pink-50 via-white to-pink-50 rounded-3xl p-6 sm:p-10 border border-pink-200 text-center space-y-4 max-w-3xl mx-auto shadow-xs">
        <h3 className="font-serif text-2xl font-bold text-pink-950">
          See More Daily Client Reels & Stories
        </h3>
        <p className="text-stone-600 text-sm">
          Follow Kamala’s daily hair styling, glowing facials, and client transformations on Instagram and TikTok.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs hover:scale-105 transition-transform"
          >
            <span>Follow @makeupkamala on Instagram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href={settings.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-stone-900 text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs hover:scale-105 transition-transform"
          >
            <span>Follow @makeup.kamala on TikTok</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
