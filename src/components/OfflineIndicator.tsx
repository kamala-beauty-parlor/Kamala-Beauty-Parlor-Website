import React, { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const OfflineIndicator: React.FC = () => {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setDismissed(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline || dismissed) return null;

  return (
    <div
      role="status"
      className="fixed top-14 sm:top-16 left-3 right-3 sm:left-auto sm:right-4 z-50 max-w-md bg-stone-900/95 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 border border-stone-700 animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex items-center gap-2.5 text-xs font-medium">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
        <WifiOff className="w-4 h-4 text-amber-300 flex-shrink-0" />
        <span>{t('offline.banner')}</span>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
        aria-label="Dismiss offline notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
