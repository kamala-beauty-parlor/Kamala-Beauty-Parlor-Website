import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Phone, 
  MapPin, 
  Calendar, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { MessageModal } from './MessageModal';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { settings } = useSite();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  // Purely beauty parlor navigation (no academy)
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services & Prices' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setCurrentTab('home');
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm bg-white">
      {/* Top Notification Strip - Pink & White */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-1.5 hover:text-pink-100 transition-colors font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-white" />
              <span>{settings.phone}</span>
            </a>
            <span className="hidden sm:inline text-pink-200">|</span>
            <div className="hidden sm:flex items-center gap-1 text-pink-50">
              <MapPin className="w-3.5 h-3.5 text-pink-200" />
              <span>Swayambhu, Panchdhara, Kathmandu</span>
            </div>
            <span className="hidden md:inline text-pink-200">|</span>
            <div className="hidden md:flex items-center gap-1 text-pink-50">
              <Clock className="w-3.5 h-3.5 text-pink-200" />
              <span>Sun-Fri 8 AM - 7 PM</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs ml-auto">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open_kamala_chat'))}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-2.5 sm:px-3 py-0.5 rounded-full border border-white/30 flex items-center gap-1 font-medium transition cursor-pointer"
            >
              <MessageSquare className="w-3 h-3 text-white" />
              <span>Chat with Kamala</span>
            </button>
            <span className="hidden sm:inline text-pink-200">|</span>
            <span className="hidden sm:flex bg-white/20 backdrop-blur-sm text-white px-3 py-0.5 rounded-full border border-white/30 items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-white" />
              Bridal & Hair Transformations Open
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar - Crisp White & Pink */}
      <nav className="bg-white border-b border-pink-100 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-pink-300 shadow-md group-hover:scale-105 transition-transform bg-pink-50 flex-shrink-0">
              <img
                src="/assets/aistudio/Kamala_Beauty_Parlor_Gold_Emblem_f4a21eee.png"
                alt="Kamala Beauty Parlor Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="block font-serif text-xl sm:text-2xl font-bold tracking-tight text-pink-900 leading-none">
                Kamala
              </span>
              <span className="block text-[10px] sm:text-[11px] font-sans font-bold tracking-widest uppercase text-pink-600">
                Beauty Parlor
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    active
                      ? 'text-pink-700 bg-pink-50 font-bold shadow-xs border border-pink-200'
                      : 'text-stone-700 hover:text-pink-600 hover:bg-pink-50/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Book Now Button in Vibrant Salon Pink */}
            <button
              onClick={() => handleNavClick('booking')}
              className="bg-gradient-to-r from-pink-500 via-pink-600 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span>Book Appointment</span>
            </button>

            {/* Auth Buttons */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-pink-50/70 border border-pink-200 px-3 py-1.5 rounded-full hover:bg-pink-100 transition shadow-xs text-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {userProfile?.fullName?.[0] || currentUser.email?.[0] || 'U'}
                  </div>
                  <span className="font-semibold text-pink-950 max-w-[120px] truncate">
                    {userProfile?.fullName || (isAdmin ? 'Kamala' : 'Account')}
                  </span>
                  {isAdmin && (
                    <span className="bg-pink-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      ADMIN
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-pink-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-pink-100 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-pink-50">
                      <p className="text-xs text-stone-500">Signed in as</p>
                      <p className="text-xs font-semibold text-pink-900 truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    {isAdmin ? (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleNavClick('admin');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-pink-700 font-semibold hover:bg-pink-50 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-pink-600" />
                        Admin Dashboard
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleNavClick('my-bookings');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-pink-50 flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4 text-pink-600" />
                        My Bookings
                      </button>
                    )}

                    <div className="border-t border-pink-50 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="border-2 border-pink-500 text-pink-600 hover:bg-pink-600 hover:text-white px-4 py-1.5 rounded-full text-sm font-semibold transition shadow-xs flex items-center gap-1.5"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>

          {/* Mobile Menu & Quick Book Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => handleNavClick('booking')}
              className="bg-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-white" />
              <span>Book</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-pink-900 hover:text-pink-600 rounded-xl hover:bg-pink-50"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-pink-100 mt-2 pt-3 pb-4 space-y-1 bg-white">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between ${
                  currentTab === item.id
                    ? 'text-pink-700 bg-pink-50 font-bold border-l-4 border-pink-600'
                    : 'text-stone-700 hover:bg-pink-50/50'
                }`}
              >
                <span>{item.label}</span>
                {currentTab === item.id && (
                  <span className="w-2 h-2 rounded-full bg-pink-600" />
                )}
              </button>
            ))}

            <div className="pt-3 border-t border-pink-100 mt-2 space-y-2 px-2">
              {currentUser ? (
                <>
                  <div className="px-3 py-2 bg-pink-50 rounded-xl border border-pink-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-stone-500">Signed in as</p>
                      <p className="text-sm font-semibold text-pink-950">
                        {userProfile?.fullName || currentUser.email}
                      </p>
                    </div>
                    {isAdmin && (
                      <span className="bg-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ADMIN
                      </span>
                    )}
                  </div>

                  {isAdmin ? (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Open Admin Dashboard
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNavClick('my-bookings')}
                      className="w-full bg-pink-600 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Calendar className="w-4 h-4" />
                      View My Bookings
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full border border-red-200 text-red-600 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full bg-pink-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
                >
                  <UserIcon className="w-4 h-4" />
                  Sign In / Register
                </button>
              )}

              {/* Direct WhatsApp Callout in Mobile menu */}
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Direct WhatsApp Inquiries</span>
              </a>

              {/* Chat with Kamala button in Mobile menu */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('open_kamala_chat'));
                }}
                className="w-full border border-pink-200 text-pink-700 hover:bg-pink-50 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition"
              >
                <MessageSquare className="w-4 h-4 text-pink-600" />
                <span>Chat with Kamala (Live)</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
      />
    </header>
  );
};
