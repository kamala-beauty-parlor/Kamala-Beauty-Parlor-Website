import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  MessageCircle, 
  ArrowRight,
  ArrowLeft,
  Search,
  Check,
  UserCheck,
  LogIn,
  RotateCcw,
  Scissors
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { useLanguage } from '../context/LanguageContext';
import { Booking as BookingType } from '../types';
import { getBookedSlotsForDate, placeBookingFast } from '../lib/bookingStore';
import { formatDuration, parseDurationMinutes } from '../lib/formatters';

interface BookingProps {
  setCurrentTab: (tab: string) => void;
  preselectedService?: string;
}

const DRAFT_KEY = 'kamala_booking_draft';

export const Booking: React.FC<BookingProps> = ({ setCurrentTab, preselectedService }) => {
  const { currentUser, userProfile } = useAuth();
  const { services, categories: siteCategories, settings, saveBooking } = useSite();
  const { language, t } = useLanguage();

  // 3-Step Flow: 1 = Services, 2 = Date & Time, 3 = Confirm Summary, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Selections
  const [selectedServiceTitles, setSelectedServiceTitles] = useState<string[]>([]);
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');

  // UI helpers
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [bookedSlotsCount, setBookedSlotsCount] = useState<Record<string, number>>({});
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [completedBooking, setCompletedBooking] = useState<BookingType | null>(null);

  // Restore draft from sessionStorage if returning from login or reload
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.selectedServiceTitles?.length > 0) {
          setSelectedServiceTitles(draft.selectedServiceTitles);
        }
        if (draft.date) setDate(draft.date);
        if (draft.time) setTime(draft.time);
        if (draft.notes) setNotes(draft.notes);
        // If returning with selections and signed in, advance to step 3
        if (currentUser && draft.selectedServiceTitles?.length > 0 && draft.date && draft.time) {
          setStep(3);
        }
      }
    } catch (e) {
      console.warn('Draft restore notice:', e);
    }
  }, [currentUser]);

  // Save draft whenever selections change
  useEffect(() => {
    if (step < 4) {
      try {
        sessionStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ selectedServiceTitles, date, time, notes })
        );
      } catch (e) {
        console.warn('Draft save notice:', e);
      }
    }
  }, [selectedServiceTitles, date, time, notes, step]);

  // Auto-fill customer info from profile
  useEffect(() => {
    if (userProfile) {
      if (userProfile.fullName && !fullName) setFullName(userProfile.fullName);
      if (userProfile.phone && !phone) setPhone(userProfile.phone);
    } else if (currentUser) {
      if (currentUser.displayName && !fullName) setFullName(currentUser.displayName);
      if (currentUser.phoneNumber && !phone) setPhone(currentUser.phoneNumber);
    }
  }, [userProfile, currentUser]);

  // Preselected service handler
  useEffect(() => {
    if (preselectedService && services.length > 0) {
      const match = services.find(
        (s) => (s.name || s.title || '').toLowerCase() === preselectedService.toLowerCase()
      );
      if (match) {
        const sTitle = match.name || match.title;
        if (!selectedServiceTitles.includes(sTitle)) {
          setSelectedServiceTitles([sTitle]);
        }
      }
    }
  }, [preselectedService, services]);

  // Generate next 14 calendar dates for quick horizontal chip selection
  const upcomingDates = useMemo(() => {
    const list: Array<{
      dateStr: string;
      dayName: string;
      dayNumber: string;
      monthName: string;
      isToday: boolean;
      isClosed: boolean;
    }> = [];

    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = String(d.getDate());
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });

      // Check closed dates in settings
      const isClosed = (settings.closedDates || []).includes(dateStr);

      list.push({
        dateStr,
        dayName,
        dayNumber,
        monthName,
        isToday: i === 0,
        isClosed
      });
    }
    return list;
  }, [settings.closedDates]);

  // Default to today or first open date
  useEffect(() => {
    if (!date && upcomingDates.length > 0) {
      const firstOpen = upcomingDates.find((d) => !d.isClosed) || upcomingDates[0];
      setDate(firstOpen.dateStr);
    }
  }, [upcomingDates, date]);

  // Fetch slot counts when date changes
  useEffect(() => {
    if (!date) return;
    let isMounted = true;
    const checkSlots = async () => {
      setLoadingSlots(true);
      try {
        const counts = await getBookedSlotsForDate(date);
        if (isMounted) setBookedSlotsCount(counts);
      } catch (e) {
        console.warn('Slot check notice:', e);
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    };
    checkSlots();
    return () => {
      isMounted = false;
    };
  }, [date]);

  // Available services list
  const availableServices = useMemo(() => {
    return services.filter((s) => (s.available ?? s.isAvailable ?? true) !== false);
  }, [services]);

  const categoryList = useMemo(() => {
    const fromSite = siteCategories.filter((c) => c.visible !== false).map((c) => c.name);
    return ['All', ...(fromSite.length > 0 ? fromSite : [
      'Hair',
      'Facial & Skin',
      'Makeup',
      'Nails',
      'Threading & Waxing',
      'Mehendi'
    ])];
  }, [siteCategories]);

  const filteredServices = useMemo(() => {
    return availableServices.filter((s) => {
      const sName = s.name || s.title || '';
      const sDesc = s.description || '';
      const matchesCat =
        selectedCategory === 'All' || s.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesQuery =
        !searchQuery ||
        sName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [availableServices, selectedCategory, searchQuery]);

  const selectedServicesObjects = useMemo(() => {
    return availableServices.filter((s) => selectedServiceTitles.includes(s.name || s.title));
  }, [availableServices, selectedServiceTitles]);

  const totalPrice = useMemo(() => {
    return selectedServicesObjects.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  }, [selectedServicesObjects]);

  const totalEstDuration = useMemo(() => {
    return selectedServicesObjects.reduce((acc, curr) => acc + parseDurationMinutes(curr.duration), 0);
  }, [selectedServicesObjects]);

  const toggleService = (title: string) => {
    if (selectedServiceTitles.includes(title)) {
      setSelectedServiceTitles(selectedServiceTitles.filter((t) => t !== title));
    } else {
      setSelectedServiceTitles([...selectedServiceTitles, title]);
    }
  };

  // Direct WhatsApp booking url with prefilled details
  const getDirectWhatsAppUrl = () => {
    const sList = selectedServiceTitles.length > 0 ? selectedServiceTitles.join(', ') : 'Salon Services';
    const msg = `Namaste Kamala Beauty Parlor!
I would like to book an appointment:
*Services:* ${sList}
*Est. Total:* Rs. ${totalPrice.toLocaleString()}
${date ? `*Date:* ${date}\n` : ''}${time ? `*Time:* ${time}\n` : ''}${fullName ? `*Name:* ${fullName}\n` : ''}
Please confirm my appointment slot!`;

    const cleanPhone = settings.whatsapp.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  // Safe navigation between steps with validation & smooth scroll
  const handleStepChange = (targetStep: 1 | 2 | 3) => {
    setErrorMsg('');
    if (targetStep === 1) {
      setStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (targetStep === 2) {
      if (selectedServiceTitles.length === 0) {
        setErrorMsg('Please select at least one treatment below to continue.');
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (targetStep === 3) {
      if (selectedServiceTitles.length === 0) {
        setErrorMsg('Please select at least one treatment first.');
        setStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!date || !time) {
        setErrorMsg('Please choose your preferred appointment date and time slot.');
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  };

  // Handle final appointment confirmation
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedServiceTitles.length === 0) {
      setErrorMsg('Please select at least one beauty service.');
      setStep(1);
      return;
    }
    if (!date) {
      setErrorMsg('Please select an appointment date.');
      setStep(2);
      return;
    }
    if (!time) {
      setErrorMsg('Please select a time slot.');
      setStep(2);
      return;
    }

    // Check slot limit
    const currentCount = bookedSlotsCount[time] || 0;
    if (currentCount >= settings.slotCapacity) {
      setErrorMsg(`The ${time} slot is fully booked. Please pick an alternative time slot.`);
      setStep(2);
      return;
    }

    // Require sign in or provide contact info
    if (!currentUser) {
      setErrorMsg('Please sign in or sign up to finalize your booking reservation.');
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ selectedServiceTitles, date, time, notes })
      );
      setCurrentTab('login');
      return;
    }

    setIsSubmitting(true);
    try {
      const clientName = fullName.trim() || userProfile?.fullName || currentUser.displayName || 'Client';
      const clientPhone = phone.trim() || userProfile?.phone || '';
      const clientEmail = currentUser.email || '';
      const now = new Date().toISOString();

      const newBooking: Omit<BookingType, 'id'> = {
        userId: currentUser.uid,
        userName: clientName,
        customerName: clientName,
        phone: clientPhone,
        customerPhone: clientPhone,
        email: clientEmail,
        customerEmail: clientEmail,
        services: selectedServicesObjects.map((s) => ({
          serviceId: s.id,
          name: s.name || s.title,
          price: s.price
        })),
        totalPrice,
        date,
        time,
        timeSlot: time,
        notes: notes.trim(),
        source: 'website',
        status: 'pending',
        createdAt: now,
        updatedAt: now
      };

      const confirmed = await placeBookingFast(newBooking);
      await saveBooking(confirmed);
      setCompletedBooking(confirmed);
      sessionStorage.removeItem(DRAFT_KEY);
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Booking placement error:', err);
      setErrorMsg('Unable to place booking right now. Please try again or book directly via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 4: SUCCESS CONFIRMATION SCREEN
  if (step === 4 && completedBooking) {
    const waUrl = getDirectWhatsAppUrl();

    return (
      <div className="max-w-xl mx-auto px-4 py-8 sm:py-16 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-300 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
              Appointment Reserved
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-pink-950 mt-2">
              Booking Received!
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Your appointment request is saved with <strong>Status: Pending</strong>. Kamala Ma'am will review and welcome you!
            </p>
          </div>

          {/* Summary Box */}
          <div className="bg-pink-50/50 rounded-2xl p-4 sm:p-5 text-left border border-pink-100 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-pink-100/60 pb-2">
              <span className="text-stone-500 font-medium">Customer:</span>
              <span className="font-bold text-stone-900">{completedBooking.customerName || completedBooking.userName}</span>
            </div>
            <div className="flex justify-between border-b border-pink-100/60 pb-2">
              <span className="text-stone-500 font-medium">Date & Slot:</span>
              <span className="font-bold text-pink-700">{completedBooking.date} • {completedBooking.timeSlot || completedBooking.time}</span>
            </div>
            <div className="border-b border-pink-100/60 pb-2">
              <span className="text-stone-500 font-medium block mb-1">Services:</span>
              <div className="flex flex-wrap gap-1.5">
                {completedBooking.services.map((srv, idx) => (
                  <span key={idx} className="bg-white border border-pink-200 text-pink-900 px-2 py-0.5 rounded-lg text-xs font-semibold">
                    {typeof srv === 'string' ? srv : srv.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between pt-1 text-sm sm:text-base">
              <span className="font-bold text-stone-900">Total Price:</span>
              <span className="font-serif font-bold text-[#8A2E44]">
                Rs. {Number(completedBooking.totalPrice).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Instant WhatsApp Priority Button */}
          <div className="space-y-2.5 pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer min-h-[48px]"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Confirm on WhatsApp for Priority</span>
            </a>
            <p className="text-[11px] text-stone-500">
              Direct chat with Kamala Ma'am at Swayambhu for urgent bridal or wedding scheduling.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4 border-t border-pink-100">
            <button
              onClick={() => setCurrentTab('my-bookings')}
              className="text-xs font-bold text-[#8A2E44] hover:underline cursor-pointer min-h-[44px] flex items-center"
            >
              {t('action.view_history')}
            </button>
            <span className="text-pink-300">•</span>
            <button
              onClick={() => {
                setCompletedBooking(null);
                setSelectedServiceTitles([]);
                setStep(1);
              }}
              className="text-xs font-semibold text-stone-600 hover:underline cursor-pointer min-h-[44px] flex items-center"
            >
              Book Another Treatment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 bg-white pb-48 sm:pb-28">
      
      {/* ============================================================== */}
      {/* TOP INTERACTIVE BOOKING STEPS (Clear & Clickable Navigation)   */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-b from-white to-pink-50/50 border-2 border-pink-200 rounded-3xl p-3 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pink-100/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8A2E44] animate-pulse" />
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#8A2E44]">
                Online Appointment • 3 Easy Steps
              </span>
            </div>
            <h1 className="font-serif font-bold text-lg sm:text-2xl text-pink-950 mt-0.5">
              {step === 1 && 'Step 1: Choose Your Beauty Treatments'}
              {step === 2 && 'Step 2: Choose Appointment Day & Time'}
              {step === 3 && 'Step 3: Review & Confirm Appointment'}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-extrabold text-[#8A2E44] bg-pink-100/80 px-3 py-1 rounded-full border border-pink-200">
              Step {step} of 3
            </span>
          </div>
        </div>

        {/* 3 Interactive Step Cards / Buttons */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Step 1 Tab Button */}
          <button
            type="button"
            onClick={() => handleStepChange(1)}
            className={`p-2.5 sm:p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 active:scale-98 ${
              step === 1
                ? 'bg-white border-[#8A2E44] ring-2 ring-rose-200 shadow-md'
                : selectedServiceTitles.length > 0
                ? 'bg-pink-50/50 border-pink-200 hover:border-pink-300 hover:bg-pink-100/50'
                : 'bg-stone-50 border-stone-200 opacity-70 hover:opacity-100'
            }`}
          >
            <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 transition-colors ${
              step === 1
                ? 'bg-[#8A2E44] text-white shadow-xs'
                : selectedServiceTitles.length > 0
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-200 text-stone-600'
            }`}>
              {selectedServiceTitles.length > 0 && step > 1 ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : (
                <Scissors className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">1. Treatments</span>
              <p className={`text-xs sm:text-sm font-black truncate leading-tight ${step === 1 ? 'text-[#8A2E44]' : 'text-stone-800'}`}>
                Services
              </p>
              <span className="hidden sm:block text-[11px] text-stone-500 truncate mt-0.5">
                {selectedServiceTitles.length > 0 ? `${selectedServiceTitles.length} selected` : 'Pick services'}
              </span>
            </div>
          </button>

          {/* Step 2 Tab Button */}
          <button
            type="button"
            onClick={() => handleStepChange(2)}
            className={`p-2.5 sm:p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 active:scale-98 ${
              step === 2
                ? 'bg-white border-[#8A2E44] ring-2 ring-rose-200 shadow-md'
                : date && time
                ? 'bg-pink-50/50 border-pink-200 hover:border-pink-300 hover:bg-pink-100/50'
                : selectedServiceTitles.length > 0
                ? 'bg-white border-pink-200 hover:border-pink-400'
                : 'bg-stone-50 border-stone-200 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 transition-colors ${
              step === 2
                ? 'bg-[#8A2E44] text-white shadow-xs'
                : date && time && step > 2
                ? 'bg-emerald-600 text-white shadow-xs'
                : selectedServiceTitles.length > 0
                ? 'bg-pink-100 text-[#8A2E44]'
                : 'bg-stone-200 text-stone-600'
            }`}>
              {date && time && step > 2 ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : (
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">2. Schedule</span>
              <p className={`text-xs sm:text-sm font-black truncate leading-tight ${step === 2 ? 'text-[#8A2E44]' : 'text-stone-800'}`}>
                Date & Time
              </p>
              <span className="hidden sm:block text-[11px] text-stone-500 truncate mt-0.5">
                {date && time ? `${time}` : 'Choose slot'}
              </span>
            </div>
          </button>

          {/* Step 3 Tab Button */}
          <button
            type="button"
            onClick={() => handleStepChange(3)}
            className={`p-2.5 sm:p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 active:scale-98 ${
              step === 3
                ? 'bg-white border-[#8A2E44] ring-2 ring-rose-200 shadow-md'
                : selectedServiceTitles.length > 0 && date && time
                ? 'bg-pink-50/50 border-pink-200 hover:border-pink-300 hover:bg-pink-100/50'
                : 'bg-stone-50 border-stone-200 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 transition-colors ${
              step === 3
                ? 'bg-[#8A2E44] text-white shadow-xs'
                : selectedServiceTitles.length > 0 && date && time
                ? 'bg-pink-100 text-[#8A2E44]'
                : 'bg-stone-200 text-stone-600'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">3. Final</span>
              <p className={`text-xs sm:text-sm font-black truncate leading-tight ${step === 3 ? 'text-[#8A2E44]' : 'text-stone-800'}`}>
                Confirm
              </p>
              <span className="hidden sm:block text-[11px] text-stone-500 truncate mt-0.5">
                Review & Book
              </span>
            </div>
          </button>
        </div>

        {/* Progress Bar line with smooth gradient */}
        <div className="w-full bg-pink-100 h-2 rounded-full overflow-hidden mt-2">
          <div
            className="bg-gradient-to-r from-pink-500 via-rose-600 to-[#8A2E44] h-full transition-all duration-300 rounded-full"
            style={{ width: step === 1 ? '33.3%' : step === 2 ? '66.6%' : '100%' }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 1: CHOOSE SERVICES */}
      {/* ============================================================== */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Search Box & Category Filter Chips */}
          <div className="space-y-3 bg-white p-3 sm:p-4 rounded-2xl border border-pink-100 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                placeholder="Search haircut, facial, bridal, nails, keratin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-base sm:text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 bg-white"
              />
            </div>

            {/* Horizontal Scrollable Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
              {categoryList.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[36px] active:scale-95 ${
                      isSelected
                        ? 'bg-[#8A2E44] text-white shadow-xs'
                        : 'bg-pink-50 text-stone-700 hover:bg-pink-100 border border-pink-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Services Grid (Card selection style for fast tapping) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredServices.map((srv) => {
              const sTitle = srv.name || srv.title;
              const isSelected = selectedServiceTitles.includes(sTitle);
              const waPerServiceUrl = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Namaste Kamala Ma’am! I want to book ${sTitle} (Rs. ${Number(srv.price).toLocaleString()}). Please let me know available slots.`
              )}`;

              return (
                <div
                  key={srv.id || sTitle}
                  onClick={() => toggleService(sTitle)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 active:scale-[0.98] ${
                    isSelected
                      ? 'bg-pink-50/70 border-[#8A2E44] shadow-md ring-2 ring-rose-200'
                      : 'bg-white border-pink-100 hover:border-pink-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700 bg-pink-100/60 px-2 py-0.5 rounded">
                          {srv.category}
                        </span>
                        {srv.duration && (
                          <span className="text-[11px] text-stone-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-pink-500" />
                            {formatDuration(srv.duration)}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif font-bold text-base text-stone-900 leading-tight">
                        {sTitle}
                      </h3>

                      {srv.description && (
                        <p className="text-xs text-stone-500 line-clamp-2">
                          {srv.description}
                        </p>
                      )}
                    </div>

                    {/* Touch Checkbox */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-[#8A2E44] text-white shadow-xs' : 'border-2 border-stone-300 bg-stone-50'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Price & Direct WhatsApp Booking */}
                  <div className="flex items-center justify-between pt-2 border-t border-pink-100/60 text-xs">
                    <div>
                      <span className="font-serif font-bold text-base text-[#8A2E44]">
                        Rs. {Number(srv.price).toLocaleString()}
                      </span>
                      {srv.priceNote && (
                        <span className="text-[10px] text-stone-400 block -mt-1">{srv.priceNote}</span>
                      )}
                    </div>

                    <a
                      href={waPerServiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 active:scale-95 transition min-h-[36px]"
                      title="1-Tap WhatsApp Booking"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current text-emerald-600" />
                      <span>{t('action.book_whatsapp')}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Navigation for Step 1 (Inline + Sticky Bar) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-pink-50/70 p-4 sm:p-5 rounded-3xl border-2 border-pink-200">
            <div>
              <span className="text-xs uppercase font-bold text-stone-500 block">
                {selectedServiceTitles.length} {t('booking.selected_count')}
              </span>
              <span className="font-serif font-black text-xl sm:text-2xl text-[#8A2E44]">
                Rs. {totalPrice.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              disabled={selectedServiceTitles.length === 0}
              onClick={() => handleStepChange(2)}
              className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-[#8A2E44] text-white px-7 sm:px-9 py-3.5 rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:pointer-events-none min-h-[48px] cursor-pointer"
            >
              <span>Next: Choose Date & Time</span>
              <ArrowRight className="w-4 h-4 text-pink-200" />
            </button>
          </div>

          {/* Sticky Bottom Action Bar for Step 1 */}
          <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-pink-200 shadow-[0_-4px_25px_rgba(138,46,68,0.12)] p-3 sm:px-6">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block">
                  {selectedServiceTitles.length} {t('booking.selected_count')}
                </span>
                <span className="font-serif font-bold text-lg sm:text-xl text-[#8A2E44]">
                  Rs. {totalPrice.toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                disabled={selectedServiceTitles.length === 0}
                onClick={() => handleStepChange(2)}
                className="bg-gradient-to-r from-pink-600 to-[#8A2E44] text-white px-5 sm:px-8 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 active:scale-95 disabled:opacity-40 disabled:pointer-events-none min-h-[48px] cursor-pointer"
              >
                <span>Next: Choose Date & Time</span>
                <ArrowRight className="w-4 h-4 text-pink-200" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 2: CHOOSE DATE & TIME */}
      {/* ============================================================== */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Quick Selected Summary Strip */}
          <div className="bg-pink-50/60 p-3.5 rounded-2xl border border-pink-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-pink-950 block">
                {selectedServiceTitles.length} treatments chosen
              </span>
              <span className="text-stone-500 truncate max-w-xs block">
                {selectedServiceTitles.join(', ')}
              </span>
            </div>
            <span className="font-serif font-bold text-base text-[#8A2E44]">
              Rs. {totalPrice.toLocaleString()}
            </span>
          </div>

          {/* 1. HORIZONTAL DATE CHIP SCROLLER */}
          <div className="space-y-2">
            <label className="font-serif font-bold text-sm sm:text-base text-pink-950 block">
              1. Select Appointment Day
            </label>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
              {upcomingDates.map((item) => {
                const isSelected = date === item.dateStr;
                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    disabled={item.isClosed}
                    onClick={() => setDate(item.dateStr)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[74px] sm:min-w-[82px] transition-all cursor-pointer min-h-[78px] active:scale-95 ${
                      isSelected
                        ? 'bg-[#8A2E44] text-white shadow-lg ring-2 ring-rose-400'
                        : item.isClosed
                        ? 'bg-stone-100 text-stone-400 opacity-50 cursor-not-allowed border border-stone-200'
                        : 'bg-white text-stone-900 border-2 border-pink-200 hover:border-pink-400 shadow-xs'
                    }`}
                  >
                    <span className={`text-[11px] font-extrabold uppercase tracking-wider ${
                      isSelected ? 'text-rose-100' : 'text-stone-600'
                    }`}>
                      {item.dayName}
                    </span>
                    <span className={`font-serif text-2xl sm:text-3xl font-black my-0.5 leading-none ${
                      isSelected ? 'text-white' : 'text-stone-900'
                    }`}>
                      {item.dayNumber}
                    </span>
                    <span className={`text-[11px] font-bold ${
                      isSelected ? 'text-rose-100' : 'text-stone-700'
                    }`}>
                      {item.monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. TIME SLOTS GRID */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="font-serif font-bold text-sm sm:text-base text-pink-950">
                2. Select Preferred Time Slot
              </label>
              {loadingSlots && (
                <span className="text-[11px] text-pink-600 animate-pulse font-medium">
                  Checking availability...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {settings.timeSlots.map((slot) => {
                const isSelected = time === slot;
                const bookedCount = bookedSlotsCount[slot] || 0;
                const isFull = bookedCount >= settings.slotCapacity;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isFull}
                    onClick={() => setTime(slot)}
                    className={`py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition-all min-h-[56px] active:scale-95 cursor-pointer border-2 ${
                      isSelected
                        ? 'bg-[#8A2E44] text-white border-[#8A2E44] shadow-md ring-2 ring-rose-300'
                        : isFull
                        ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                        : 'bg-white border-pink-200 text-stone-900 hover:border-pink-400 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Clock className={`w-4 h-4 ${isSelected ? 'text-rose-200' : 'text-[#8A2E44]'}`} />
                      <span className={`font-black text-sm ${isSelected ? 'text-white' : 'text-stone-950'}`}>{slot}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${
                      isSelected ? 'text-rose-100' : isFull ? 'text-stone-400' : 'text-[#8A2E44]'
                    }`}>
                      {isFull ? 'Fully Booked' : `${settings.slotCapacity - bookedCount} spots left`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigation for Step 2 (Inline + Sticky Bar) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-pink-50/70 p-4 sm:p-5 rounded-3xl border-2 border-pink-200">
            <button
              type="button"
              onClick={() => handleStepChange(1)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border-2 border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer min-h-[48px] transition active:scale-95 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-stone-600" />
              <span>← Previous: Services</span>
            </button>

            <div className="text-center">
              <span className="text-[11px] uppercase font-bold text-stone-500 block">Chosen Slot</span>
              <span className="text-sm font-black text-[#8A2E44]">
                {date ? date : 'No date'} • {time ? time : 'Pick time slot'}
              </span>
            </div>

            <button
              type="button"
              disabled={!date || !time}
              onClick={() => handleStepChange(3)}
              className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-[#8A2E44] text-white px-7 sm:px-9 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:pointer-events-none min-h-[48px] cursor-pointer"
            >
              <span>Next: Review & Confirm →</span>
              <ArrowRight className="w-4 h-4 text-pink-200" />
            </button>
          </div>

          {/* Sticky Bottom Bar for Step 2 */}
          <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-pink-200 shadow-[0_-4px_25px_rgba(138,46,68,0.12)] p-3 sm:px-6">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleStepChange(1)}
                className="px-4 sm:px-5 py-2.5 rounded-2xl border-2 border-stone-200 bg-white text-stone-800 font-bold text-xs sm:text-sm flex items-center gap-1.5 hover:bg-stone-50 cursor-pointer min-h-[48px] shadow-xs active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-stone-600" />
                <span>← Previous</span>
              </button>

              <div className="hidden sm:block text-center">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Selected Slot</span>
                <span className="text-xs font-bold text-[#8A2E44]">
                  {date} • {time || 'Choose a slot'}
                </span>
              </div>

              <button
                type="button"
                disabled={!date || !time}
                onClick={() => handleStepChange(3)}
                className="bg-gradient-to-r from-pink-600 to-[#8A2E44] text-white px-5 sm:px-8 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 active:scale-95 disabled:opacity-40 disabled:pointer-events-none min-h-[48px] cursor-pointer"
              >
                <span>Next: Review & Confirm</span>
                <ArrowRight className="w-4 h-4 text-pink-200" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 3: CONFIRM & CUSTOMER DETAILS */}
      {/* ============================================================== */}
      {step === 3 && (
        <form onSubmit={handleConfirmBooking} className="space-y-6">
          {/* Reservation Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-pink-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600">
                  Appointment Details
                </span>
                <h3 className="font-serif font-bold text-lg text-pink-950">
                  {date} at {time}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-pink-600 underline cursor-pointer"
              >
                Change Date/Time
              </button>
            </div>

            {/* Services List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-500 uppercase block">
                Selected Beauty Treatments:
              </span>
              <div className="divide-y divide-pink-50">
                {selectedServicesObjects.map((s) => (
                  <div key={s.id || s.title} className="py-2 flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <p className="font-bold text-stone-900">{s.name || s.title}</p>
                      <p className="text-[11px] text-stone-500">{s.category} • {formatDuration(s.duration)}</p>
                    </div>
                    <span className="font-serif font-bold text-[#8A2E44]">
                      Rs. {Number(s.price).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-pink-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900 text-sm block">Total Estimated Price</span>
                  <span className="text-[11px] text-stone-500">Pay at parlor after treatment</span>
                </div>
                <span className="font-serif text-2xl font-bold text-[#8A2E44]">
                  Rs. {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Customer Info */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-pink-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-pink-950">
              Customer Contact Information
            </h3>

            {!currentUser ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3 text-xs">
                <div className="flex items-start gap-2 text-amber-900">
                  <LogIn className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Account required to book via website:</strong> Sign in with your email or Google to record this booking under your profile. Your selections will be kept!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.setItem(
                        DRAFT_KEY,
                        JSON.stringify({ selectedServiceTitles, date, time, notes })
                      );
                      setCurrentTab('login');
                    }}
                    className="flex-1 py-2.5 bg-[#8A2E44] text-white rounded-xl font-bold text-xs shadow-xs text-center cursor-pointer min-h-[44px]"
                  >
                    Sign In / Create Account
                  </button>

                  <a
                    href={getDirectWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-[#25D366] text-white rounded-xl font-bold text-xs shadow-xs text-center flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Skip Login & Book on WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 uppercase block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Anju Shrestha"
                      autoComplete="name"
                      className="w-full p-3 border border-pink-200 rounded-xl text-base sm:text-sm focus:outline-none focus:border-pink-500 bg-white min-h-[48px]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 uppercase block mb-1">
                      Phone Number (Nepal) *
                    </label>
                    <input
                      type="tel"
                      required
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98XXXXXXXX"
                      className="w-full p-3 border border-pink-200 rounded-xl text-base sm:text-sm focus:outline-none focus:border-pink-500 bg-white min-h-[48px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase block mb-1">
                    Special Requests or Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('booking.notes_placeholder')}
                    className="w-full p-3 border border-pink-200 rounded-xl text-base sm:text-sm focus:outline-none focus:border-pink-500 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation for Step 3 (Inline + Sticky Bar) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-pink-50/70 p-4 sm:p-5 rounded-3xl border-2 border-pink-200">
            <button
              type="button"
              onClick={() => handleStepChange(2)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border-2 border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer min-h-[48px] transition active:scale-95 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-stone-600" />
              <span>← Previous: Date & Time</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !currentUser}
              className="w-full sm:w-auto bg-gradient-to-r from-pink-600 via-rose-600 to-[#8A2E44] text-white px-8 sm:px-10 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:pointer-events-none min-h-[48px] cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{isSubmitting ? 'Reserving...' : 'Confirm & Book Appointment ✓'}</span>
            </button>
          </div>

          {/* Sticky Bottom Bar for Step 3 */}
          <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-pink-200 shadow-[0_-4px_25px_rgba(138,46,68,0.12)] p-3 sm:px-6">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleStepChange(2)}
                className="px-4 sm:px-5 py-2.5 rounded-2xl border-2 border-stone-200 bg-white text-stone-800 font-bold text-xs sm:text-sm flex items-center gap-1.5 hover:bg-stone-50 cursor-pointer min-h-[48px] shadow-xs active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-stone-600" />
                <span>← Previous</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !currentUser}
                className="bg-gradient-to-r from-pink-600 via-rose-600 to-[#8A2E44] text-white px-6 sm:px-10 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-lg transition flex items-center gap-2 active:scale-95 disabled:opacity-40 disabled:pointer-events-none min-h-[48px] cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>{isSubmitting ? 'Reserving...' : 'Confirm Appointment ✓'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

    </div>
  );
};
