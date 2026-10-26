/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ChatBox } from './components/ChatBox';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallBanner } from './components/PWAInstallBanner';

// Code-split pages for high Lighthouse mobile performance & fast startup
const Home = React.lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Services = React.lazy(() => import('./pages/Services').then(m => ({ default: m.Services })));
const Training = React.lazy(() => import('./pages/Training').then(m => ({ default: m.Training })));
const Gallery = React.lazy(() => import('./pages/Gallery').then(m => ({ default: m.Gallery })));
const About = React.lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = React.lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Booking = React.lazy(() => import('./pages/Booking').then(m => ({ default: m.Booking })));
const Login = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const MyBookings = React.lazy(() => import('./pages/MyBookings').then(m => ({ default: m.MyBookings })));
const Admin = React.lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })));
const NotFound = React.lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// Lightweight skeleton placeholder while chunks load
const PageSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 animate-pulse">
    <div className="h-8 bg-pink-100 rounded-2xl w-48 mx-auto" />
    <div className="h-4 bg-pink-50 rounded-xl w-72 mx-auto" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
      <div className="h-40 bg-pink-50/60 rounded-3xl" />
      <div className="h-40 bg-pink-50/60 rounded-3xl" />
    </div>
  </div>
);

function MainApp() {
  const { currentUser, isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [preselectedService, setPreselectedService] = useState<string | undefined>(undefined);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['home', 'services', 'training', 'gallery', 'about', 'contact', 'booking', 'login', 'my-bookings', 'admin'].includes(hash)) {
        setCurrentTab(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToTab = (tab: string) => {
    setCurrentTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectServiceToBook = (serviceTitle: string) => {
    setPreselectedService(serviceTitle);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <Home
            setCurrentTab={navigateToTab}
            onSelectServiceToBook={handleSelectServiceToBook}
          />
        );
      case 'services':
        return (
          <Services
            setCurrentTab={navigateToTab}
            onSelectServiceToBook={handleSelectServiceToBook}
          />
        );
      case 'training':
        return <Training setCurrentTab={navigateToTab} />;
      case 'gallery':
        return (
          <Gallery
            setCurrentTab={navigateToTab}
            onSelectServiceToBook={handleSelectServiceToBook}
          />
        );
      case 'about':
        return <About setCurrentTab={navigateToTab} />;
      case 'contact':
        return <Contact />;
      case 'booking':
        return (
          <Booking
            setCurrentTab={navigateToTab}
            preselectedService={preselectedService}
          />
        );
      case 'login':
        return <Login setCurrentTab={navigateToTab} />;
      case 'my-bookings':
        return (
          <MyBookings
            setCurrentTab={navigateToTab}
            onSelectServiceToBook={handleSelectServiceToBook}
          />
        );
      case 'admin':
        return <Admin setCurrentTab={navigateToTab} />;
      default:
        return <NotFound setCurrentTab={navigateToTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#2C2727] selection:bg-pink-200 selection:text-pink-900 overflow-x-hidden">
      {/* Offline Alert Banner */}
      <OfflineIndicator />

      {/* Sticky Top Navigation with Language Switcher and Mobile Drawer */}
      <Navbar currentTab={currentTab} setCurrentTab={navigateToTab} />
      
      {/* Main Content Area */}
      <main className="flex-1 pb-16 lg:pb-0">
        <Suspense fallback={<PageSkeleton />}>
          {renderContent()}
        </Suspense>
      </main>

      {/* Footer */}
      <Footer setCurrentTab={navigateToTab} />

      {/* Mobile Fixed Bottom Navigation (Thumb-friendly 5 items) */}
      <BottomNav currentTab={currentTab} setCurrentTab={navigateToTab} />

      {/* Floating Action Stack (Call & WhatsApp) - Never covers the bottom nav */}
      {currentTab !== 'admin' && (
        <>
          <FloatingWhatsApp currentTab={currentTab} />
          <ChatBox currentTab={currentTab} />
        </>
      )}

      {/* PWA Install Offer (Dismissible, shows after 2 visits) */}
      <PWAInstallBanner />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SiteProvider>
          <MainApp />
        </SiteProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
