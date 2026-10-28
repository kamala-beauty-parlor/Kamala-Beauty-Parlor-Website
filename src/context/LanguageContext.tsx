import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ne';

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.services': 'Services & Prices',
    'nav.book': 'Book',
    'nav.book_now': 'Book Now',
    'nav.gallery': 'Gallery',
    'nav.account': 'Account',
    'nav.training': 'Training Courses',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.my_bookings': 'My Bookings',
    'nav.admin': 'Admin Dashboard',
    'nav.sign_in': 'Sign In / Register',
    'nav.sign_out': 'Sign Out',

    // Quick Actions
    'action.call': 'Call',
    'action.whatsapp': 'WhatsApp',
    'action.directions': 'Directions',
    'action.book_whatsapp': 'Book on WhatsApp',
    'action.confirm_booking': 'Confirm Appointment',
    'action.choose_datetime': 'Select Date & Time',
    'action.continue_summary': 'Review & Confirm',
    'action.back': 'Back',
    'action.rebook': 'Rebook',
    'action.cancel_booking': 'Cancel Booking',
    'action.view_history': 'View My Bookings',
    'action.view_menu': 'Explore Services',

    // Booking Flow
    'booking.title': 'Book Your Appointment',
    'booking.step1_title': '1. Choose Treatments',
    'booking.step1_sub': 'Tap to select one or multiple beauty services',
    'booking.step2_title': '2. Date & Time',
    'booking.step2_sub': 'Select an appointment day and time slot in Kathmandu',
    'booking.step3_title': '3. Confirm & Reserve',
    'booking.step3_sub': 'Review your selections and contact details',
    'booking.selected_count': 'Selected',
    'booking.services': 'Services',
    'booking.total': 'Total Estimated Price',
    'booking.est_duration': 'Est. Duration',
    'booking.notes_placeholder': 'Any specific requests, bridal details, or hairstyle preference?',
    'booking.instant_wa_desc': 'Need priority booking? You can also reserve directly via WhatsApp in 1 tap without logging in.',

    // Common
    'currency': 'Rs.',
    'npr': 'NPR',
    'offline.banner': "You're offline. Browsing cached services & salon details.",
    'install.prompt': 'Install Kamala Parlor App for instant offline booking & quick access!'
  },
  ne: {
    // Navigation
    'nav.home': 'गृहपृष्ठ',
    'nav.services': 'सेवा तथा मूल्य',
    'nav.book': 'बुकिङ',
    'nav.book_now': 'अहिले बुकिङ गर्नुहोस्',
    'nav.gallery': 'ग्यालरी',
    'nav.account': 'मेरो खाता',
    'nav.training': 'ब्युटिसियन तालिम',
    'nav.about': 'हाम्रो बारेमा',
    'nav.contact': 'सम्पर्क तथा नक्सा',
    'nav.my_bookings': 'मेरो बुकिङहरू',
    'nav.admin': 'प्रशासक केन्द्र',
    'nav.sign_in': 'साइन इन / दर्ता',
    'nav.sign_out': 'लगआउट',

    // Quick Actions
    'action.call': 'फोन गर्नुहोस्',
    'action.whatsapp': 'ह्वाट्सएप',
    'action.directions': 'लोकेसन हेर्नुहोस्',
    'action.book_whatsapp': 'ह्वाट्सएपबाट बुकिङ',
    'action.confirm_booking': 'बुकिङ निश्चित गर्नुहोस्',
    'action.choose_datetime': 'मिति र समय छान्नुहोस्',
    'action.continue_summary': 'विवरण हेरी पुष्टि गर्नुहोस्',
    'action.back': 'पछाडि फर्कनुहोस्',
    'action.rebook': 'पुनः बुकिङ',
    'action.cancel_booking': 'बुकिङ रद्द गर्नुहोस्',
    'action.view_history': 'मेरो बुकिङ सूची',
    'action.view_menu': 'सबै सेवाहरू हेर्नुहोस्',

    // Booking Flow
    'booking.title': 'अपोइन्टमेन्ट बुकिङ गर्नुहोस्',
    'booking.step1_title': '१. सेवाहरू छान्नुहोस्',
    'booking.step1_sub': 'चाहिएको एक वा धेरै ब्युटी सेवाहरू छनोट गर्नुहोस्',
    'booking.step2_title': '२. मिति र समय छान्नुहोस्',
    'booking.step2_sub': 'आफूलाई पायक पर्ने दिन र समय छान्नुहोस्',
    'booking.step3_title': '३. विवरण र पुष्टि',
    'booking.step3_sub': 'आफ्नो सेवा र सम्पर्क नम्बर रुजु गर्नुहोस्',
    'booking.selected_count': 'छनोट भएको',
    'booking.services': 'सेवाहरू',
    'booking.total': 'जम्मा अनुमानित रकम',
    'booking.est_duration': 'अनुमानित समय',
    'booking.notes_placeholder': 'कुनै विशेष अनुरोध वा दुलही मेकअप सम्बन्धी जानकारी भए लेख्नुहोस्...',
    'booking.instant_wa_desc': 'छिटो र तत्काल बुकिङको लागि लगइन नगरी सिधै ह्वाट्सएपमा पनि सम्पर्क गर्न सक्नुहुन्छ।',

    // Common
    'currency': 'रु.',
    'npr': 'नेपाली रुपैयाँ',
    'offline.banner': 'तपाईं अफलाइन हुनुहुन्छ। सेभ गरिएको जानकारी देखाइएको छ।',
    'install.prompt': 'छिटो बुकिङको लागि कमला पार्लर एप मोबाइलमा इन्स्टल गर्नुहोस्!'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const language: Language = 'en';

  const setLanguage = () => {};
  const toggleLanguage = () => {};

  const t = (key: string, fallback?: string): string => {
    const text = TRANSLATIONS.en[key];
    return text || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
