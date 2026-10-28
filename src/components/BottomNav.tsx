import React from 'react';
import { Home, Scissors, Calendar, Image as ImageIcon, MoreHorizontal, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenMenu?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab, onOpenMenu }) => {
  const { currentUser, isAdmin } = useAuth();
  const { messages } = useSite();

  const totalUnread = isAdmin 
    ? messages.filter((m) => !m.read).length 
    : 0;

  const handleTabSelect = (tab: string, isMenuTrigger?: boolean) => {
    if (isMenuTrigger) {
      if (onOpenMenu) {
        onOpenMenu();
      } else {
        window.dispatchEvent(new Event('open_kamala_mobile_menu'));
      }
      return;
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'services',
      label: 'Services',
      icon: Scissors,
    },
    {
      id: 'booking',
      label: 'Book',
      icon: Calendar,
      isPrimary: true,
    },
    {
      id: 'gallery',
      label: 'Gallery',
      icon: ImageIcon,
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: MoreHorizontal,
      isMenuTrigger: true,
      hasBadge: totalUnread > 0,
      hasDot: !!currentUser,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/98 backdrop-blur-md border-t border-pink-200 shadow-[0_-4px_20px_rgba(138,46,68,0.08)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 h-16 items-center max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

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
              onClick={() => handleTabSelect(item.id, item.isMenuTrigger)}
              className={`flex flex-col items-center justify-center h-full py-1 active:scale-95 transition-transform cursor-pointer relative ${
                isActive ? 'text-[#8A2E44]' : 'text-stone-600 hover:text-stone-900'
              }`}
              aria-label={item.isMenuTrigger ? 'Open 3 dots menu with all options' : item.label}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[2]'}`} />
                {item.hasBadge && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
                )}
                {!item.hasBadge && item.hasDot && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 truncate max-w-[62px] ${
                isActive ? 'font-black text-[#8A2E44]' : 'font-semibold'
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

