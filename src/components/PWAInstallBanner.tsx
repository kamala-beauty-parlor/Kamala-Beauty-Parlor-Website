import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const PWAInstallBanner: React.FC = () => {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if already installed / standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // 2. Check if user already dismissed
    if (localStorage.getItem('kamala_pwa_dismissed') === 'true') {
      return;
    }

    // 3. Track visit count: show after 2 visits
    const visits = Number(localStorage.getItem('kamala_visit_count') || '0') + 1;
    localStorage.setItem('kamala_visit_count', String(visits));

    // Listen for chromium install event
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (visits >= 2) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If iOS Safari and visits >= 2
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    if (isIOS && visits >= 2) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem('kamala_pwa_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Show iOS modal guide
      setShowIOSGuide(true);
    }
  };

  if (!showBanner) return null;

  return (
    <>
      <aside
        aria-label="App Installation Offer"
        className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-pink-300 shadow-2xl p-3.5 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-pink-200 bg-pink-50 flex-shrink-0">
            <img
              src="/assets/aistudio/Kamala_Beauty_Parlor_Gold_Emblem_f4a21eee.png"
              alt="Kamala Beauty Parlor"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-0.5">
            <p className="font-serif font-bold text-xs text-pink-950">
              Kamala Beauty App
            </p>
            <p className="text-[11px] text-stone-500 leading-tight">
              Fast 1-tap bookings & offline menu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleInstallClick}
            className="bg-[#8A2E44] hover:bg-[#722335] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
            aria-label="Dismiss app prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* iOS Instructions Guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 border border-pink-200 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-pink-100 text-[#8A2E44] flex items-center justify-center mx-auto">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-pink-950">
              Install on iPhone / iPad
            </h3>
            <div className="text-left text-xs text-stone-600 space-y-2.5 bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">1</span>
                <span>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-pink-700" /> at bottom of Safari.</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">2</span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-pink-700" />.</span>
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="w-full py-2.5 bg-[#8A2E44] text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
