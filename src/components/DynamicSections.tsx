import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { PageSection } from '../types';

interface DynamicSectionsProps {
  page: 'home' | 'about' | 'services' | 'training' | 'contact' | string;
  setCurrentTab: (tab: string) => void;
}

export const DynamicSections: React.FC<DynamicSectionsProps> = ({ page, setCurrentTab }) => {
  const { sections } = useSite();

  const pageSections = sections
    .filter((s) => (s.page || 'home').toLowerCase() === page.toLowerCase() && s.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (pageSections.length === 0) return null;

  return (
    <div className="space-y-16">
      {pageSections.map((sec) => {
        const bodyText = sec.body || sec.content;

        // Render based on section type
        if (sec.type === 'hero') {
          return (
            <div
              key={sec.id || sec.order}
              className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white rounded-3xl p-8 sm:p-12 shadow-xl border-2 border-pink-300 space-y-4"
            >
              {sec.subtitle && (
                <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3.5 py-1 rounded-full">
                  {sec.subtitle}
                </span>
              )}
              <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
                {sec.title}
              </h2>
              {bodyText && <p className="text-pink-100 text-sm sm:text-base max-w-2xl leading-relaxed">{bodyText}</p>}
              {sec.buttonText && (
                <button
                  onClick={() => {
                    if (sec.buttonLink?.startsWith('http')) {
                      window.open(sec.buttonLink, '_blank');
                    } else if (sec.buttonLink) {
                      setCurrentTab(sec.buttonLink.replace('/', '') || 'booking');
                    } else {
                      setCurrentTab('booking');
                    }
                  }}
                  className="bg-white text-pink-700 hover:bg-pink-50 font-bold px-6 py-3 rounded-full text-sm shadow-md transition cursor-pointer"
                >
                  {sec.buttonText}
                </button>
              )}
            </div>
          );
        }

        if (sec.type === 'imageText' || sec.type === 'image_text') {
          return (
            <div
              key={sec.id || sec.order}
              className="bg-white rounded-3xl p-6 sm:p-10 border border-pink-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              <div className="md:col-span-7 space-y-4">
                {sec.subtitle && (
                  <span className="text-xs font-bold text-pink-600 uppercase tracking-wider bg-pink-50 border border-pink-200 px-3 py-1 rounded-full">
                    {sec.subtitle}
                  </span>
                )}
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-pink-950">
                  {sec.title}
                </h3>
                {bodyText && (
                  <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                    {bodyText}
                  </p>
                )}
                {sec.buttonText && (
                  <button
                    onClick={() => {
                      if (sec.buttonLink?.startsWith('http')) {
                        window.open(sec.buttonLink, '_blank');
                      } else if (sec.buttonLink) {
                        setCurrentTab(sec.buttonLink.replace('/', '') || 'booking');
                      } else {
                        setCurrentTab('booking');
                      }
                    }}
                    className="bg-[#8A2E44] text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 hover:opacity-90 shadow transition cursor-pointer"
                  >
                    <span>{sec.buttonText}</span>
                    <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                  </button>
                )}
              </div>

              {sec.imageUrl && (
                <div className="md:col-span-5 aspect-4/3 rounded-2xl overflow-hidden shadow-md border border-pink-100">
                  <img
                    src={sec.imageUrl}
                    alt={sec.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>
              )}
            </div>
          );
        }

        if (sec.type === 'banner' || sec.type === 'cta') {
          return (
            <div
              key={sec.id || sec.order}
              className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-3xl p-8 sm:p-10 border border-pink-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs"
            >
              <div className="space-y-2 text-center md:text-left">
                {sec.subtitle && (
                  <span className="text-[11px] font-bold text-pink-700 uppercase tracking-widest bg-pink-100 px-3 py-0.5 rounded-full">
                    {sec.subtitle}
                  </span>
                )}
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-pink-950">
                  {sec.title}
                </h3>
                {bodyText && <p className="text-stone-600 text-sm max-w-xl">{bodyText}</p>}
              </div>

              {sec.buttonText && (
                <button
                  onClick={() => {
                    if (sec.buttonLink?.startsWith('http')) {
                      window.open(sec.buttonLink, '_blank');
                    } else if (sec.buttonLink) {
                      setCurrentTab(sec.buttonLink.replace('/', '') || 'booking');
                    } else {
                      setCurrentTab('booking');
                    }
                  }}
                  className="bg-[#8A2E44] hover:bg-[#722335] text-white px-6 py-3 rounded-full text-xs sm:text-sm font-bold shadow transition cursor-pointer flex items-center gap-2 whitespace-nowrap"
                >
                  <span>{sec.buttonText}</span>
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                </button>
              )}
            </div>
          );
        }

        // Default text / card block
        return (
          <div
            key={sec.id || sec.order}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-200 shadow-xs space-y-3"
          >
            {sec.subtitle && (
              <span className="text-xs font-bold text-pink-600 uppercase tracking-wider bg-pink-50 border border-pink-200 px-3 py-1 rounded-full">
                {sec.subtitle}
              </span>
            )}
            <h3 className="font-serif text-2xl font-bold text-pink-950">
              {sec.title}
            </h3>
            {bodyText && (
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                {bodyText}
              </p>
            )}
            {sec.buttonText && (
              <button
                onClick={() => {
                  if (sec.buttonLink?.startsWith('http')) {
                    window.open(sec.buttonLink, '_blank');
                  } else if (sec.buttonLink) {
                    setCurrentTab(sec.buttonLink.replace('/', '') || 'booking');
                  } else {
                    setCurrentTab('booking');
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8A2E44] hover:underline pt-2 cursor-pointer"
              >
                <span>{sec.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
