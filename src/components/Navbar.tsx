import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Phone, 
  Calendar, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Sparkles,
  ChevronDown,
  Globe,
  Scissors,
  GraduationCap,
  Image as ImageIcon,
  Heart,
  MapPin,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { settings } = useSite();
  const { language, toggleLanguage, t } = useLanguage();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Close drawer on escape or resize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setDrawerOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setDrawerOpen(false);
    setCurrentTab('home');
  };

  const mainNavItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'services', label: t('nav.services') },
    { id: 'training', label: t('nav.training') },
    { id: 'gallery', label: t('nav.gallery') },
    { id: 'about', label: t('nav.about') },
    { id: 'contact', label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm bg-white/95 backdrop-blur-md">
      {/* Top Notification Strip */}
      <div className="bg-gradient-to-r from-[#8A2E44] via-rose-700 to-[#8A2E44] text-white text-xs py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-[11px] sm:text-xs">
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-1.5 hover:text-pink-100 transition-colors font-bold min-h-[28px] items-center"
            >
              <Phone className="w-3.5 h-3.5 text-pink-200" />
              <span>{settings.phone}</span>
            </a>
            <span className="hidden sm:inline text-rose-300">|</span>
            <span className="hidden sm:inline text-rose-100 text-[11px]">
              Swayambhu, Panchdhara, Kathmandu
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] sm:text-xs">
            {/* Language Switcher Pill */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full border border-white/30 flex items-center gap-1 font-bold transition cursor-pointer active:scale-95"
              title="Switch language / भाषा परिवर्तन"
              aria-label="Language switch"
            >
              <Globe className="w-3 h-3 text-pink-200" />
              <span>{language === 'en' ? 'नेपाली' : 'English'}</span>
            </button>
            <span className="hidden md:flex bg-white/20 text-rose-100 px-2.5 py-0.5 rounded-full items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Bridal & Makeover Open</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Sticky Top Bar */}
      <nav aria-label="Main Navigation" className="border-b border-pink-100 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand on the Left */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-pink-300 shadow-md group-hover:scale-105 transition-transform bg-pink-50 flex-shrink-0">
              <img
                src="/assets/aistudio/Kamala_Beauty_Parlor_Gold_Emblem_f4a21eee.png"
                alt="Kamala Beauty Parlor Logo"
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
                width={48}
                height={48}
              />
            </div>
            <div>
              <span className="block font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#8A2E44] leading-tight">
                Kamala
              </span>
              <span className="block text-[9px] sm:text-[10px] font-sans font-bold tracking-widest uppercase text-pink-600">
                Beauty Parlor
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {mainNavItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all cursor-pointer ${
                    active
                      ? 'text-[#8A2E44] bg-pink-100/70 font-bold shadow-xs border border-pink-200'
                      : 'text-stone-700 hover:text-[#8A2E44] hover:bg-pink-50/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => handleNavClick('booking')}
              className="bg-gradient-to-r from-pink-600 via-rose-600 to-[#8A2E44] hover:opacity-95 text-white px-5 py-2 rounded-full text-xs font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span>{t('nav.book_now')}</span>
            </button>

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-pink-50/70 border border-pink-200 px-3 py-1.5 rounded-full hover:bg-pink-100 transition shadow-xs text-xs font-semibold cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#8A2E44] text-white flex items-center justify-center font-bold text-[10px] uppercase">
                    {userProfile?.fullName?.[0] || currentUser.email?.[0] || 'U'}
                  </div>
                  <span className="text-pink-950 max-w-[110px] truncate">
                    {userProfile?.fullName || (isAdmin ? 'Admin' : 'Account')}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-pink-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-pink-100 py-2 z-50 animate-in fade-in">
                    <div className="px-4 py-2 border-b border-pink-50">
                      <p className="text-[10px] text-stone-400">Signed in</p>
                      <p className="text-xs font-bold text-pink-950 truncate">
                        {userProfile?.fullName || currentUser.email}
                      </p>
                    </div>

                    {isAdmin ? (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-pink-700 hover:bg-pink-50 flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-pink-600" />
                        Admin Dashboard
                      </button>
                    ) : (
                      <button
                        onClick={() => handleNavClick('my-bookings')}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-stone-700 hover:bg-pink-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-pink-600" />
                        {t('nav.my_bookings')}
                      </button>
                    )}

                    <div className="border-t border-pink-50 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.sign_out')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="border-2 border-pink-400 text-[#8A2E44] hover:bg-pink-50 px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{t('nav.sign_in')}</span>
              </button>
            )}
          </div>

          {/* Mobile Right: Clear Book Button & Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => handleNavClick('booking')}
              className="bg-gradient-to-r from-pink-600 to-[#8A2E44] text-white px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition cursor-pointer min-h-[44px]"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span>{t('nav.book')}</span>
            </button>

            <button
              onClick={() => setDrawerOpen(true)}
              className="w-11 h-11 flex items-center justify-center text-[#8A2E44] hover:bg-pink-50 rounded-xl cursor-pointer active:scale-95 transition"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* FULL-HEIGHT SLIDE-IN DRAWER (MOBILE) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-pink-200 animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div>
              <div className="p-4 border-b border-pink-100 flex items-center justify-between bg-pink-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-pink-300">
                    <img
                      src="/assets/aistudio/Kamala_Beauty_Parlor_Gold_Emblem_f4a21eee.png"
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="block font-serif text-base font-bold text-[#8A2E44] leading-none">
                      Kamala
                    </span>
                    <span className="text-[9px] uppercase font-bold text-pink-600 tracking-wider">
                      Beauty Parlor
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-pink-100/50 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Language Switcher in Drawer */}
              <div className="p-3 bg-pink-50/70 border-b border-pink-100 flex items-center justify-between text-xs">
                <span className="font-bold text-stone-700 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-pink-600" />
                  Language / भाषा:
                </span>
                <div className="flex rounded-xl bg-white p-0.5 border border-pink-200">
                  <button
                    onClick={() => toggleLanguage()}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      language === 'en' ? 'bg-[#8A2E44] text-white shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => toggleLanguage()}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      language === 'ne' ? 'bg-[#8A2E44] text-white shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    नेपाली
                  </button>
                </div>
              </div>

              {/* Large Tap-Friendly Navigation Links (>= 48px height) */}
              <div className="p-3 space-y-1">
                {[
                  { id: 'home', label: t('nav.home'), icon: Sparkles },
                  { id: 'services', label: t('nav.services'), icon: Scissors },
                  { id: 'booking', label: t('nav.book_now'), icon: Calendar, highlight: true },
                  { id: 'gallery', label: t('nav.gallery'), icon: ImageIcon },
                  { id: 'training', label: t('nav.training'), icon: GraduationCap },
                  { id: 'about', label: t('nav.about'), icon: Heart },
                  { id: 'contact', label: t('nav.contact'), icon: MapPin },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-between transition cursor-pointer min-h-[48px] active:scale-98 ${
                        item.highlight
                          ? 'bg-gradient-to-r from-pink-500 to-[#8A2E44] text-white shadow-sm'
                          : isActive
                          ? 'bg-pink-100 text-[#8A2E44] border-l-4 border-[#8A2E44]'
                          : 'text-stone-800 hover:bg-pink-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${item.highlight ? 'text-white' : 'text-pink-600'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && !item.highlight && (
                        <span className="w-2 h-2 rounded-full bg-[#8A2E44]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-pink-100 bg-stone-50/70 space-y-3">
              {/* Account / Login Status */}
              {currentUser ? (
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-2xl border border-pink-200">
                    <p className="text-[10px] text-stone-400 font-bold uppercase">Logged In</p>
                    <p className="text-xs font-bold text-pink-950 truncate">
                      {userProfile?.fullName || currentUser.email}
                    </p>
                  </div>

                  {isAdmin ? (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className="w-full py-2.5 bg-[#8A2E44] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-h-[44px]"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>{t('nav.admin')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNavClick('my-bookings')}
                      className="w-full py-2.5 bg-pink-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-h-[44px]"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{t('nav.my_bookings')}</span>
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full py-2 text-stone-500 hover:text-red-600 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('nav.sign_out')}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full py-3 bg-[#8A2E44] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer min-h-[48px]"
                >
                  <UserIcon className="w-4 h-4 text-pink-200" />
                  <span>{t('nav.sign_in')}</span>
                </button>
              )}

              {/* Direct Quick Contact Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${settings.phone}`}
                  className="py-2.5 px-3 bg-white border border-pink-200 text-[#8A2E44] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs min-h-[44px]"
                >
                  <Phone className="w-3.5 h-3.5 text-[#8A2E44]" />
                  <span>{t('action.call')}</span>
                </a>
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-[#25D366] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs min-h-[44px]"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Social Link Badges */}
              <div className="flex items-center justify-center gap-4 text-xs pt-1 text-stone-500">
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-600 font-medium flex items-center gap-1 min-h-[36px]"
                >
                  <span>Instagram</span>
                  <ExternalLink className="w-3 h-3 text-pink-400" />
                </a>
                <span>•</span>
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-600 font-medium flex items-center gap-1 min-h-[36px]"
                >
                  <span>TikTok</span>
                  <ExternalLink className="w-3 h-3 text-pink-400" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
