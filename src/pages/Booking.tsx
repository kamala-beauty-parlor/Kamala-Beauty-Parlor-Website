import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  MessageCircle, 
  ArrowRight,
  LogIn
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { Booking as BookingType } from '../types';
import { getBookedSlotsForDate, placeBookingFast } from '../lib/bookingStore';

interface BookingProps {
  setCurrentTab: (tab: string) => void;
  preselectedService?: string;
}

export const Booking: React.FC<BookingProps> = ({ setCurrentTab, preselectedService }) => {
  const { currentUser, userProfile } = useAuth();
  const { services, settings } = useSite();

  // Multi-select services
  const [selectedServiceTitles, setSelectedServiceTitles] = useState<string[]>([]);
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [bookedSlotsCount, setBookedSlotsCount] = useState<Record<string, number>>({});
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [completedBooking, setCompletedBooking] = useState<BookingType | null>(null);

  // Auto-fill from profile when user is signed in
  useEffect(() => {
    if (userProfile) {
      if (userProfile.fullName) setFullName(userProfile.fullName);
      if (userProfile.phone) setPhone(userProfile.phone);
    } else if (currentUser) {
      if (currentUser.displayName) setFullName(currentUser.displayName);
      if (currentUser.phoneNumber) setPhone(currentUser.phoneNumber);
    }
  }, [userProfile, currentUser]);

  // Handle preselected service if passed from Home or Services
  useEffect(() => {
    if (preselectedService && services.length > 0) {
      const match = services.find(
        (s) => s.title.toLowerCase() === preselectedService.toLowerCase()
      );
      if (match && !selectedServiceTitles.includes(match.title)) {
        setSelectedServiceTitles([match.title]);
      }
    }
  }, [preselectedService, services]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Check slot capacities for selected date instantly
  useEffect(() => {
    if (!date) return;
    let isMounted = true;
    
    const fetchSlotBookings = async () => {
      setLoadingSlots(true);
      try {
        const counts = await getBookedSlotsForDate(date);
        if (isMounted) {
          setBookedSlotsCount(counts);
        }
      } catch (e) {
        console.warn('Slot booking check notice:', e);
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    };

    fetchSlotBookings();
    return () => {
      isMounted = false;
    };
  }, [date]);

  const selectedServices = services.filter((s) =>
    selectedServiceTitles.includes(s.title)
  );
  const totalPrice = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);

  const toggleService = (title: string) => {
    if (selectedServiceTitles.includes(title)) {
      setSelectedServiceTitles(selectedServiceTitles.filter((t) => t !== title));
    } else {
      setSelectedServiceTitles([...selectedServiceTitles, title]);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser) {
      setErrorMsg('Please sign in to confirm this reservation.');
      setCurrentTab('login');
      return;
    }

    if (selectedServiceTitles.length === 0) {
      setErrorMsg('Please select at least one beauty service.');
      return;
    }

    if (!date) {
      setErrorMsg('Please choose an appointment date.');
      return;
    }

    if (!time) {
      setErrorMsg('Please select a time slot.');
      return;
    }

    const currentBooked = bookedSlotsCount[time] || 0;
    if (currentBooked >= settings.slotCapacity) {
      setErrorMsg(
        `The ${time} slot has reached maximum capacity (${settings.slotCapacity} clients). Please choose another time slot.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const clientName = fullName.trim() || userProfile?.fullName || 'Client';
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
        services: selectedServiceTitles,
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

      // Instant fast placement with background synchronization
      const confirmed = await placeBookingFast(newBooking);
      setCompletedBooking(confirmed);
    } catch (err) {
      console.error('Booking submission error:', err);
      setErrorMsg('Failed to place booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppMessage = (b: BookingType) => {
    const text = `Namaste Kamala Beauty Parlor!
I have submitted an online appointment reservation:
*Name:* ${b.userName}
*Phone:* ${b.phone}
*Services:* ${b.services.join(', ')}
*Total Price:* Rs. ${b.totalPrice.toLocaleString()}
*Date:* ${b.date}
*Time Slot:* ${b.time}
${b.notes ? `*Notes:* ${b.notes}\n` : ''}
Please confirm my appointment slot!`;
    return encodeURIComponent(text);
  };

  // 1. Success confirmation screen in Pink & White
  if (completedBooking) {
    const waUrl = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${getWhatsAppMessage(
      completedBooking
    )}`;

    return (
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20 animate-fadeIn bg-white">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-pink-300 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-pink-700 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
              Booking Received
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-pink-950 mt-2">
              Appointment Request Placed!
            </h1>
            <p className="text-stone-600 text-sm mt-1">
              Your appointment has been registered under <strong>Status: Pending</strong>.
            </p>
          </div>

          {/* Booking Summary Box */}
          <div className="bg-pink-50/50 rounded-2xl p-5 text-left border border-pink-100 space-y-3 text-sm">
            <div className="flex justify-between border-b border-pink-100 pb-2">
              <span className="text-stone-500">Client Name:</span>
              <span className="font-semibold text-stone-900">{completedBooking.userName}</span>
            </div>
            <div className="flex justify-between border-b border-pink-100 pb-2">
              <span className="text-stone-500">Phone:</span>
              <span className="font-semibold text-stone-900">{completedBooking.phone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between border-b border-pink-100 pb-2">
              <span className="text-stone-500">Date & Time:</span>
              <span className="font-bold text-pink-700">
                {completedBooking.date} at {completedBooking.time}
              </span>
            </div>
            <div className="border-b border-pink-100 pb-2">
              <span className="text-stone-500 block mb-1">Selected Services:</span>
              <div className="flex flex-wrap gap-1.5">
                {completedBooking.services.map((srv, i) => (
                  <span
                    key={i}
                    className="bg-white border border-pink-200 text-pink-900 text-xs px-2.5 py-1 rounded-md font-semibold"
                  >
                    {typeof srv === 'string' ? srv : srv.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-bold text-stone-900">Total Estimated Price:</span>
              <span className="font-serif text-2xl font-bold text-pink-600">
                Rs. {completedBooking.totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action to confirm on WhatsApp */}
          <div className="space-y-3 pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20be5a] text-white py-3.5 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Also Confirm on WhatsApp</span>
            </a>

            <p className="text-xs text-stone-500">
              Sending a WhatsApp confirmation gives you instant priority confirmation directly from Kamala Ma’am!
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4 border-t border-pink-100">
            <button
              onClick={() => setCurrentTab('my-bookings')}
              className="text-xs font-bold text-pink-700 hover:underline"
            >
              View in My Bookings
            </button>
            <span className="text-pink-300">•</span>
            <button
              onClick={() => {
                setCompletedBooking(null);
                setSelectedServiceTitles([]);
                setDate('');
                setTime('');
                setNotes('');
              }}
              className="text-xs font-semibold text-stone-600 hover:underline"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Main Booking Screen in Pink & White
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 bg-white">
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-pink-700 uppercase tracking-widest bg-pink-50 border border-pink-200 px-4 py-1.5 rounded-full">
          Online Reservation
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-pink-950">
          Book Your Appointment
        </h1>
        <p className="text-stone-600 text-sm sm:text-base">
          Select your services, preferred date, and time slot. We will prepare your station with gentle care.
        </p>
      </div>

      {/* WhatsApp Alternative banner for guests */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl p-4 sm:p-5 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="font-bold text-emerald-950 text-sm">
              Prefer Instant Booking via WhatsApp?
            </p>
            <p className="text-emerald-800 text-xs">
              No account creation needed! Chat directly with Kamala Ma’am for walk-in availability.
            </p>
          </div>
        </div>

        <a
          href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
            'Namaste Kamala Beauty Parlor! I would like to book an appointment directly over WhatsApp.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#20be5a] text-white text-xs font-bold px-4 py-2.5 rounded-xl whitespace-nowrap shadow-xs transition"
        >
          Book on WhatsApp
        </a>
      </div>

      {/* Guest Warning / Login Prompt if not authenticated */}
      {!currentUser && (
        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-pink-700 flex-shrink-0" />
            <p className="text-pink-950 text-xs sm:text-sm">
              <strong>Account Required for Online System:</strong> Please sign in or register to submit appointments and view your status.
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('login')}
            className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl whitespace-nowrap shadow-xs transition flex items-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Register</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Booking Form Layout */}
      <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Step 1: Services Selection (Multi-select) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-pink-600 uppercase tracking-wider">
                  Step 1
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-pink-950">
                  Select Services (Multi-Select)
                </h2>
              </div>
              <span className="text-xs text-stone-500 font-medium">
                {selectedServiceTitles.length} selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {services.map((srv) => {
                const isSelected = selectedServiceTitles.includes(srv.title);
                return (
                  <button
                    type="button"
                    key={srv.id || srv.title}
                    onClick={() => toggleService(srv.title)}
                    className={`text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'border-pink-600 bg-pink-50 ring-1 ring-pink-600'
                        : 'border-stone-200 hover:border-pink-300 bg-white'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-stone-900">
                        {srv.title}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {srv.category} {srv.duration ? `• ${srv.duration}` : ''}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-pink-600">
                        Rs. {srv.price.toLocaleString()}
                      </p>
                      <span
                        className={`inline-block w-4 h-4 rounded mt-1 border text-center text-[10px] leading-3 font-bold ${
                          isSelected
                            ? 'bg-pink-600 text-white border-pink-600'
                            : 'border-stone-300'
                        }`}
                      >
                        {isSelected ? '✓' : ''}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Date & Time Selection */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-200 shadow-xs space-y-6">
            <div>
              <span className="text-[11px] font-bold text-pink-600 uppercase tracking-wider">
                Step 2
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-pink-950">
                Select Date & Time Slot
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Date Input */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTime('');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Open Sunday to Friday (8 AM - 7 PM), Saturday (9 AM - 5 PM).
                </p>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Available Time Slot *
                </label>

                {!date ? (
                  <p className="text-xs text-stone-400 italic py-2">
                    Please pick an appointment date first to see available slots.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                      {settings.timeSlots.map((slot) => {
                        const bookedCount = bookedSlotsCount[slot] || 0;
                        const isFull = bookedCount >= settings.slotCapacity;
                        const isSelected = time === slot;

                        return (
                          <button
                            type="button"
                            key={slot}
                            disabled={isFull}
                            onClick={() => setTime(slot)}
                            className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                              isFull
                                ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed line-through'
                                : isSelected
                                ? 'bg-pink-600 text-white border-pink-600 shadow-sm font-bold'
                                : 'bg-white text-stone-800 border-pink-200 hover:border-pink-500 hover:bg-pink-50/50'
                            }`}
                          >
                            <div>{slot}</div>
                            {isFull ? (
                              <span className="text-[9px] block text-rose-500 font-bold">Full</span>
                            ) : (
                              <span className={`text-[9px] block ${isSelected ? 'text-pink-100' : 'text-pink-600 font-medium'}`}>
                                {settings.slotCapacity - bookedCount} open
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {loadingSlots && (
                      <p className="text-[10px] text-pink-500 italic">
                        Checking slot availability in real time...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 3: Contact Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-200 shadow-xs space-y-4">
            <div>
              <span className="text-[11px] font-bold text-pink-600 uppercase tracking-wider">
                Step 3
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-pink-950">
                Contact Details & Special Notes
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9841XXXXXX"
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Special Requests or Skin/Hair Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention allergies, hair length, wedding timings, or specific preferences..."
                className="w-full px-4 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-white rounded-3xl p-6 border-2 border-pink-300 shadow-lg space-y-6">
            <h3 className="font-serif text-xl font-bold text-pink-950 border-b border-pink-100 pb-3">
              Booking Summary
            </h3>

            {/* Selected items list */}
            <div className="space-y-2">
              <span className="text-xs text-stone-500 uppercase tracking-wider font-bold">
                Services ({selectedServiceTitles.length})
              </span>

              {selectedServices.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No services selected yet.</p>
              ) : (
                <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedServices.map((s) => (
                    <li
                      key={s.id || s.title}
                      className="flex items-center justify-between text-xs text-stone-700 bg-pink-50/50 p-2 rounded-lg border border-pink-100"
                    >
                      <span className="font-medium truncate pr-2">{s.title}</span>
                      <span className="font-bold flex-shrink-0 text-pink-700">
                        Rs. {s.price.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Schedule details */}
            <div className="bg-pink-50/60 p-3.5 rounded-xl text-xs space-y-1.5 border border-pink-200">
              <div className="flex justify-between">
                <span className="text-stone-500">Date:</span>
                <span className="font-bold text-stone-900">{date || 'Not chosen'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Time Slot:</span>
                <span className="font-bold text-stone-900">{time || 'Not chosen'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Client:</span>
                <span className="font-bold text-pink-950">
                  {fullName || (currentUser ? 'Signed in' : 'Guest')}
                </span>
              </div>
            </div>

            {/* Price total */}
            <div className="pt-2 border-t border-pink-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-500">Estimated Total</p>
                <p className="font-serif text-2xl font-bold text-pink-600">
                  Rs. {totalPrice.toLocaleString()}
                </p>
              </div>
              <span className="text-[11px] text-stone-400 font-medium">Pay at Parlor</span>
            </div>

            {/* Submit Button */}
            {currentUser ? (
              <button
                type="submit"
                disabled={isSubmitting || selectedServiceTitles.length === 0 || !date || !time}
                className="w-full bg-gradient-to-r from-pink-500 via-pink-600 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md transition disabled:opacity-40 flex items-center justify-center gap-2 active:scale-95"
              >
                <Calendar className="w-4 h-4 text-white" />
                <span>{isSubmitting ? 'Confirming...' : 'Confirm Appointment'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentTab('login')}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Complete Booking</span>
              </button>
            )}

            <p className="text-[11px] text-stone-500 text-center leading-tight">
              Free cancellation up to 4 hours before slot. No advance deposit required for general services.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
