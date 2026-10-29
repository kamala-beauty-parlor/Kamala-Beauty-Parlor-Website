import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Scissors,
  GraduationCap,
  Image as ImageIcon,
  Heart,
  MapPin,
  ExternalLink,
  MessageCircle,
  MoreVertical,
  CheckCircle2,
  Clock,
  Layers,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { settings } = useSite();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Close menu on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to open_kamala_mobile_menu event from BottomNav or elsewhere
  useEffect(() => {
    const handleOpenMenu = () => setMobileMenuOpen(true);
    window.addEventListener('open_kamala_mobile_menu', handleOpenMenu);
    return () => window.removeEventListener('open_kamala_mobile_menu', handleOpenMenu);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    setCurrentTab('home');
  };

  const mainNavItems = [
    { id: 'home', label: 'Home', icon: Sparkles },
    { id: 'services', label: 'Services & Prices', icon: Scissors },
    { id: 'training', label: 'Training Courses', icon: GraduationCap },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'about', label: 'About Us', icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm bg-white border-b-2 border-pink-200">
      {/* 1. TOP BRAND & ACTION BAR */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3 max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Logo & Brand on the Left */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 sm:gap-3 text-left group cursor-pointer flex-shrink-0"
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
            <span className="block font-serif text-lg sm:text-2xl font-black tracking-tight text-[#8A2E44] leading-tight">
              Kamala
            </span>
            <span className="block text-[9px] sm:text-[11px] font-sans font-extrabold tracking-widest uppercase text-pink-700">
              Beauty Parlor
            </span>
          </div>
        </button>

        {/* Laptop & Desktop Menubar Links (Visible on screens >= 1024px) */}
        <nav aria-label="Desktop Navigation" className="hidden lg:flex items-center gap-1.5 xl:gap-2">
          {mainNavItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-1.5 xl:px-4 xl:py-2 rounded-full text-xs xl:text-sm font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  active
                    ? 'text-white bg-[#8A2E44] font-black shadow-md'
                    : 'text-stone-800 hover:text-[#8A2E44] hover:bg-pink-100/70 font-bold'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions for Laptop & Desktop */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Book Appointment CTA Button (Desktop & Laptop only) */}
          <button
            onClick={() => handleNavClick('booking')}
            className="hidden lg:flex bg-gradient-to-r from-pink-600 via-rose-600 to-[#8A2E44] hover:opacity-95 text-white px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold shadow-md transition-all items-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Calendar className="w-4 h-4 text-white" />
            <span>Book Appointment</span>
          </button>

          {/* Desktop User Account / Admin Dropdown */}
          <div className="hidden lg:block relative">
            {currentUser ? (
              <div>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-pink-50 border-2 border-pink-300 px-3 py-1.5 rounded-full hover:bg-pink-100 transition shadow-xs text-xs font-bold cursor-pointer text-stone-900"
                >
                  <div className="w-6 h-6 rounded-full bg-[#8A2E44] text-white flex items-center justify-center font-bold text-[10px] uppercase">
                    {userProfile?.fullName?.[0] || currentUser.email?.[0] || 'U'}
                  </div>
                  <span className="text-pink-950 max-w-[100px] truncate font-extrabold text-xs">
                    {userProfile?.fullName || (isAdmin ? 'Admin' : 'Account')}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-pink-600" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-pink-200 py-2 z-50 animate-in fade-in">
                    <div className="px-4 py-2 border-b border-pink-100">
                      <p className="text-[10px] text-stone-400 font-semibold">Signed in as</p>
                      <p className="text-xs font-bold text-pink-950 truncate">
                        {userProfile?.fullName || currentUser.email}
                      </p>
                    </div>

                    {isAdmin ? (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-pink-700 hover:bg-pink-50 flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-pink-600" />
                        <span>Admin Dashboard</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleNavClick('my-bookings')}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-pink-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-pink-600" />
                        <span>My Bookings</span>
                      </button>
                    )}

                    <div className="border-t border-pink-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="border-2 border-pink-400 text-[#8A2E44] hover:bg-pink-50 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* 3 DOTS MENU BUTTON ON MOBILE (Only element on the right in mobile view) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden relative w-11 h-11 rounded-full bg-pink-50 hover:bg-pink-100 active:bg-pink-200 border-2 border-pink-300 text-[#8A2E44] flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-xs"
            aria-label="Open 3 dots menu"
            title="Menu"
          >
            <MoreVertical className="w-6 h-6 text-[#8A2E44]" />
          </button>
        </div>

      </div>

      {/* 3. FULL MOBILE MENU MODAL (Triggered when 3 dots is clicked, rendered via createPortal directly to body) */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div 
            role="dialog"
            aria-modal="true"
            aria-label="Kamala Beauty Parlor Navigation Menu"
            className="relative z-10 w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-2 border-pink-300 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-5"
          >
            
            {/* Grab Handle for Touch UI */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2 sm:hidden flex-shrink-0" />

            {/* Header with Salon Brand & Close button */}
            <div className="px-4 py-3 bg-gradient-to-r from-[#8A2E44] via-rose-700 to-[#8A2E44] text-white flex items-center justify-between shadow-md flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md bg-white flex-shrink-0">
                  <img
                    src="/assets/aistudio/Kamala_Beauty_Parlor_Gold_Emblem_f4a21eee.png"
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-black text-white leading-tight">
                    Kamala Beauty Menu
                  </h3>
                  <p className="text-[11px] text-pink-200 font-medium">
                    Swayambhu, Kathmandu • All Options
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-white/20 hover:bg-white/30 cursor-pointer active:scale-95 transition"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Options List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* ADMIN BANNER & DIRECT ACCESS (If logged in as Admin) */}
              {isAdmin && (
                <div className="bg-gradient-to-r from-amber-50 to-pink-50 p-3.5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#8A2E44] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#8A2E44]" />
                      <span>Admin Management</span>
                    </span>
                  </div>
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="w-full py-2.5 px-4 bg-[#8A2E44] text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>Open Admin Dashboard</span>
                  </button>
                </div>
              )}

              {/* USER ACCOUNT BAR */}
              <div className="bg-pink-50/80 p-3 rounded-2xl border border-pink-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-full bg-[#8A2E44] text-white flex items-center justify-center font-bold text-xs">
                    {currentUser ? (userProfile?.fullName?.[0] || currentUser.email?.[0] || 'U') : <UserIcon className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-extrabold text-pink-950 truncate">
                      {currentUser ? (userProfile?.fullName || currentUser.email) : 'Guest Visitor'}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      {currentUser ? (isAdmin ? 'Salon Owner' : 'Verified Client') : 'Sign in to track appointments'}
                    </p>
                  </div>
                </div>

                {currentUser ? (
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavClick('login')}
                    className="px-3 py-1.5 rounded-xl bg-[#8A2E44] text-white text-xs font-bold transition flex items-center gap-1 active:scale-95 cursor-pointer shadow-xs"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>

              {/* SECTION: ALL WEBSITE PAGES */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-black uppercase tracking-wider text-pink-800 px-1">
                  Website Pages
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-between transition cursor-pointer min-h-[46px] active:scale-98 ${
                          isActive
                            ? 'bg-[#8A2E44] text-white shadow-md'
                            : 'bg-white hover:bg-pink-50 border border-pink-200 text-stone-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-pink-600'}`} />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: CLIENT APPOINTMENTS & BOOKINGS */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-black uppercase tracking-wider text-pink-800 px-1">
                  Bookings & Appointments
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNavClick('booking')}
                    className="p-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl font-extrabold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer text-center"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Book Appointment</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('my-bookings')}
                    className="p-3 bg-pink-50 hover:bg-pink-100 border-2 border-pink-200 text-[#8A2E44] rounded-2xl font-extrabold text-xs flex flex-col items-center justify-center gap-1.5 active:scale-95 cursor-pointer text-center"
                  >
                    <Clock className="w-5 h-5 text-pink-600" />
                    <span>My Bookings</span>
                  </button>
                </div>
              </div>

              {/* SECTION: INSTANT CONTACT ACTIONS */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-black uppercase tracking-wider text-pink-800 px-1">
                  Contact Salon Directly
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${settings.phone}`}
                    className="py-2.5 px-3 bg-white border-2 border-pink-200 text-[#8A2E44] rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs active:scale-95"
                  >
                    <Phone className="w-4 h-4 text-[#8A2E44]" />
                    <span>Call Us</span>
                  </a>

                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-[#25D366] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* DEVELOPER CREDIT */}
              <div className="pt-2 border-t border-pink-100 text-center">
                <p className="text-[11px] text-stone-500 font-medium">
                  Website made by <span className="text-[#8A2E44] font-bold">Er. Sagar Chokhal</span>
                </p>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

export default Navbar;
