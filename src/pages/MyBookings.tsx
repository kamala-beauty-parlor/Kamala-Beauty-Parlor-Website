import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageCircle, 
  Plus,
  Star,
  Search,
  XCircle,
  X
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { Booking } from '../types';
import { getLocalBookings, updateLocalBookingStatus } from '../lib/bookingStore';
import { ReviewModal } from '../components/ReviewModal';

interface MyBookingsProps {
  setCurrentTab: (tab: string) => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ setCurrentTab }) => {
  const { currentUser, userProfile } = useAuth();
  const { settings } = useSite();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const isUserMatch = (b: Booking) => {
    if (!currentUser) return false;
    return (
      b.userId === currentUser.uid ||
      (currentUser.email && b.email?.toLowerCase() === currentUser.email?.toLowerCase()) ||
      (userProfile?.phone && b.phone === userProfile.phone)
    );
  };

  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (!currentUser) return [];
    return getLocalBookings().filter(isUserMatch);
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (!currentUser) return false;
    return getLocalBookings().filter(isUserMatch).length === 0;
  });
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionMessage, setActionMessage] = useState<string>('');
  const [reviewModalService, setReviewModalService] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const loadLocal = () => {
      const local = getLocalBookings().filter(isUserMatch);
      setBookings((prev) => {
        const map = new Map<string, Booking>();
        prev.forEach((b) => { if (b.id) map.set(b.id, b); });
        local.forEach((b) => { if (b.id) map.set(b.id, b); });
        const list = Array.from(map.values());
        list.sort((a, b) => (b.date > a.date ? 1 : -1));
        return list;
      });
      setLoading(false);
    };

    loadLocal();
    window.addEventListener('kamala_bookings_updated', loadLocal);

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const remoteList: Booking[] = [];
        snapshot.forEach((doc) => {
          remoteList.push({ id: doc.id, ...doc.data() } as Booking);
        });
        
        setBookings((prev) => {
          const map = new Map<string, Booking>();
          prev.forEach((b) => { if (b.id) map.set(b.id, b); });
          remoteList.forEach((b) => { if (b.id) map.set(b.id, b); });
          const list = Array.from(map.values());
          list.sort((a, b) => (b.date > a.date ? 1 : -1));
          return list;
        });
        setLoading(false);
      },
      (error) => {
        console.warn('MyBookings snapshot notice:', error.message);
        setLoading(false);
      }
    );

    return () => {
      window.removeEventListener('kamala_bookings_updated', loadLocal);
      unsubscribe();
    };
  }, [currentUser]);

  const handleConfirmCancel = async () => {
    if (!cancellingBooking?.id) return;
    const bookingId = cancellingBooking.id;
    setIsCancelling(true);
    setActionMessage('');

    // Instant local cancellation
    updateLocalBookingStatus(bookingId, 'cancelled', 'Cancelled by client from My Bookings');
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
    setActionMessage('Your booking has been cancelled successfully.');
    setCancellingBooking(null);
    setIsCancelling(false);

    // Background update Firestore
    try {
      const ref = doc(db, 'bookings', bookingId);
      await updateDoc(ref, {
        status: 'cancelled',
        notes: 'Cancelled by client from My Bookings'
      });
    } catch (err) {
      console.warn('Firestore cancel sync notice:', err);
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="bg-pink-100 text-pink-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-pink-200">
            <Clock className="w-3.5 h-3.5" />
            Pending Approval
          </span>
        );
      case 'completed':
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-stone-200 text-stone-600 text-xs font-medium px-3 py-1 rounded-full">
            Cancelled
          </span>
        );
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 text-center space-y-4 bg-white">
        <div className="w-14 h-14 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center mx-auto border border-pink-200">
          <Calendar className="w-7 h-7" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-pink-950">
          Sign In to View Bookings
        </h2>
        <p className="text-sm text-stone-500">
          Please log in to your account to review your appointments and status.
        </p>
        <button
          onClick={() => setCurrentTab('login')}
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-xs transition"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-pink-700 uppercase tracking-wider bg-pink-50 border border-pink-200 px-3.5 py-1 rounded-full">
            Account Management
          </span>
          <h1 className="font-serif text-3xl font-bold text-pink-950 mt-2">
            My Appointments
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Logged in as {userProfile?.fullName || currentUser.email}
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('booking')}
          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-pink-50 border border-pink-200 text-pink-950 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-pink-600 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-pink-100 shadow-xs">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All History', count: bookings.length },
            { id: 'active', label: 'Upcoming / Active', count: bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed').length },
            { id: 'completed', label: 'Completed', count: bookings.filter((b) => b.status === 'completed').length },
            { id: 'cancelled', label: 'Cancelled', count: bookings.filter((b) => b.status === 'cancelled').length }
          ].map((pill) => {
            const isSelected = statusFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setStatusFilter(pill.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'bg-pink-50 text-pink-900 hover:bg-pink-100'
                }`}
              >
                <span>{pill.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-pink-900 border border-pink-200'}`}>
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service, date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 bg-white"
          />
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-16 text-center text-pink-400 animate-pulse text-sm">
          Loading your appointment history...
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-pink-50/20 rounded-3xl border border-dashed border-pink-200 p-6 space-y-4">
          <Calendar className="w-12 h-12 text-pink-300 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-pink-950">
            No Appointments Found
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto">
            You haven't scheduled any beauty treatments with us yet. Reserve your slot now for a glowing makeover!
          </p>
          <button
            onClick={() => setCurrentTab('booking')}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-xs transition"
          >
            Explore Services & Book
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings
            .filter((b) => {
              const srvNames = b.services.map((s) => (typeof s === 'string' ? s : s.name || 'Service'));
              const bookingTime = b.timeSlot || b.time || '';
              const matchesSearch =
                srvNames.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                b.date.includes(searchTerm) ||
                bookingTime.toLowerCase().includes(searchTerm.toLowerCase());
              if (!matchesSearch) return false;

              if (statusFilter === 'active') return b.status === 'pending' || b.status === 'confirmed';
              if (statusFilter === 'completed') return b.status === 'completed';
              if (statusFilter === 'cancelled') return b.status === 'cancelled';
              return true;
            })
            .map((b) => {
              const isCanCancel = b.status === 'pending' || b.status === 'confirmed';
              const srvNames = b.services.map((s) => (typeof s === 'string' ? s : s.name || 'Service'));
              const bookingTime = b.timeSlot || b.time || '';
              const waFollowup = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Namaste Kamala Beauty Parlor! I am checking on my booking for ${b.date} at ${bookingTime} (Services: ${srvNames.join(', ')}).`
              )}`;

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-pink-100 shadow-xs hover:border-pink-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {getStatusBadge(b.status)}
                      <span className="text-xs text-stone-400">
                        Booked on: {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-pink-950">
                        {srvNames.join(' • ')}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 mt-1">
                        <span className="flex items-center gap-1 font-semibold text-stone-900">
                          <Calendar className="w-3.5 h-3.5 text-pink-600" />
                          {b.date}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-stone-900">
                          <Clock className="w-3.5 h-3.5 text-pink-600" />
                          {bookingTime}
                        </span>
                        <span className="font-serif text-base font-bold text-pink-600">
                          Total: Rs. {b.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {b.notes && (
                      <p className="text-xs text-stone-500 italic bg-pink-50/50 p-2.5 rounded-lg border border-pink-100 max-w-xl">
                        Note: {b.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
                    <button
                      type="button"
                      onClick={() => setReviewModalService(srvNames[0] || 'Bridal Makeup')}
                      className="bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                      <span>Leave Review</span>
                    </button>

                    <a
                      href={waFollowup}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366] hover:bg-[#20be5a] text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp Parlor</span>
                    </a>

                    {isCanCancel && b.id && (
                      <button
                        type="button"
                        onClick={() => setCancellingBooking(b)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-pink-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-xl font-bold text-pink-950">
                Cancel Your Appointment?
              </h3>
              <p className="text-xs text-stone-500">
                Are you sure you want to cancel this booking? You can reschedule anytime.
              </p>
            </div>

            <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-200 text-xs space-y-1.5">
              <p className="font-bold text-pink-950">
                {cancellingBooking.services.map(s => typeof s === 'string' ? s : s.name || 'Service').join(' • ')}
              </p>
              <div className="flex items-center gap-3 text-stone-600">
                <span>Date: {cancellingBooking.date}</span>
                <span>Time: {cancellingBooking.timeSlot || cancellingBooking.time}</span>
              </div>
              <p className="text-pink-700 font-semibold">
                Amount: Rs. {cancellingBooking.totalPrice.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewModalService && (
        <ReviewModal
          isOpen={true}
          defaultService={reviewModalService}
          onClose={() => setReviewModalService(null)}
        />
      )}
    </div>
  );
};
