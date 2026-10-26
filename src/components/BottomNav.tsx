import React from 'react';
import { Home, Scissors, Calendar, Image as ImageIcon, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser, isAdmin } = useAuth();
  const { t } = useLanguage();

  const handleTabSelect = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    {
      id: 'home',
      label: t('nav.home'),
      icon: Home,
    },
    {
      id: 'services',
      label: t('nav.services').split('&')[0].trim(),
      icon: Scissors,
    },
    {
      id: 'booking',
      label: t('nav.book'),
      icon: Calendar,
      isPrimary: true,
    },
    {
      id: 'gallery',
      label: t('nav.gallery'),
      icon: ImageIcon,
    },
    {
      id: currentUser ? (isAdmin ? 'admin' : 'my-bookings') : 'login',
      label: currentUser ? (isAdmin ? 'Admin' : t('nav.account')) : t('nav.sign_in').split('/')[0].trim(),
      icon: User,
      hasDot: !!currentUser,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-pink-100 shadow-[0_-4px_20px_rgba(138,46,68,0.08)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 h-16 items-center max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentTab === item.id ||
            (item.id === 'my-bookings' && currentTab === 'account') ||
            (item.id === 'login' && currentTab === 'login');

          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                onClick={() => handleTabSelect(item.id)}
                className="flex flex-col items-center justify-center -mt-5 group active:scale-90 transition-transform cursor-pointer"
                aria-label={item.label}
              >
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#8A2E44] via-rose-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-900/25 border-4 border-white ring-2 ring-pink-200">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[10px] font-bold text-[#8A2E44] tracking-tight mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleTabSelect(item.id)}
              className={`flex flex-col items-center justify-center h-full py-1 active:scale-95 transition-transform cursor-pointer relative ${
                isActive ? 'text-[#8A2E44]' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.hasDot && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 truncate max-w-[62px] ${
                isActive ? 'font-black text-[#8A2E44]' : 'font-medium'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
