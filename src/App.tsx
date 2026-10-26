/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ChatBox } from './components/ChatBox';

import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { Training } from './pages/Training';
import { Gallery } from './pages/Gallery';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Booking } from './pages/Booking';
import { Login } from './pages/Login';
import { MyBookings } from './pages/MyBookings';
import { Admin } from './pages/Admin';
import { NotFound } from './pages/NotFound';

function MainApp() {
  const { currentUser, isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [preselectedService, setPreselectedService] = useState<string | undefined>(undefined);

  // Sync hash routing if desired
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
        return <MyBookings setCurrentTab={navigateToTab} />;
      case 'admin':
        return <Admin setCurrentTab={navigateToTab} />;
      default:
        return <NotFound setCurrentTab={navigateToTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#2C2727] selection:bg-pink-200 selection:text-pink-900">
      <Navbar currentTab={currentTab} setCurrentTab={navigateToTab} />
      
      <main className="flex-1">
        {renderContent()}
      </main>

      <Footer setCurrentTab={navigateToTab} />
      {currentTab !== 'admin' && (
        <>
          <FloatingWhatsApp currentTab={currentTab} />
          <ChatBox currentTab={currentTab} />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SiteProvider>
        <MainApp />
      </SiteProvider>
    </AuthProvider>
  );
}
