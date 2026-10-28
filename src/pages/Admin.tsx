import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  Scissors, 
  GraduationCap, 
  Image as ImageIcon, 
  Layers, 
  Users, 
  Settings as SettingsIcon, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Phone, 
  MessageCircle, 
  Search, 
  Filter, 
  RefreshCw, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  DollarSign, 
  Clock, 
  Sparkles, 
  Database,
  ExternalLink,
  AlertTriangle,
  Mail,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { seedSampleData } from '../lib/firebase';
import { 
  Booking, 
  BookingServiceItem,
  ServiceCategory,
  ServiceItem, 
  CourseItem, 
  GalleryItem, 
  PageSection, 
  ContactMessage, 
  SiteSettings,
  UserProfile 
} from '../types';

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void | Promise<void>;
}

export const Admin: React.FC<{ setCurrentTab: (tab: string) => void }> = ({ setCurrentTab }) => {
  const { currentUser, isAdmin } = useAuth();
  const { 
    settings, 
    categories,
    services, 
    courses, 
    gallery, 
    testimonials, 
    sections, 
    messages, 
    bookings,
    customers,
    loading,
    refreshAll,
    saveCategory,
    deleteCategory,
    saveService,
    deleteService,
    saveCourse,
    deleteCourse,
    saveSection,
    deleteSection,
    saveGalleryItem,
    deleteGalleryItem,
    saveSettings,
    updateBookingStatus,
    deleteBooking,
    markMessageRead,
    deleteMessage
  } = useSite();

  // 7 explicit functional admin sections
  const [activeTab, setActiveTab] = useState<
    'bookings' | 'services' | 'courses' | 'gallery' | 'sections' | 'customers' | 'settings_messages'
  >('bookings');

  // Sub-tab for Settings & Messages
  const [settingsSubTab, setSettingsSubTab] = useState<'messages' | 'settings'>('messages');

  // Page filter for Sections
  const [sectionPageFilter, setSectionPageFilter] = useState<string>('all');

  // Category filter for Gallery
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('all');

  // Search & Filter for Bookings
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [bookingDateFilter, setBookingDateFilter] = useState<string>('');

  // Search for Customers
  const [customerSearch, setCustomerSearch] = useState('');

  // Search for Messages
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'read'>('all');

  // In-app Notification / Toast
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // In-app Confirmation Modal (Strictly replaces all window.confirm)
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Modal States
  const [editingCategory, setEditingCategory] = useState<Partial<ServiceCategory> | null>(null);
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [editingCourse, setEditingCourse] = useState<Partial<CourseItem> | null>(null);
  const [editingGallery, setEditingGallery] = useState<Partial<GalleryItem> | null>(null);
  const [editingSection, setEditingSection] = useState<Partial<PageSection> | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<{
    profile: UserProfile;
    bookings: Booking[];
    totalSpent: number;
  } | null>(null);

  // Editable settings copy
  const [formSettings, setFormSettings] = useState<SiteSettings>(settings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);

  // Sync settings form when settings in context change
  React.useEffect(() => {
    setFormSettings(settings);
  }, [settings]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Helper to safely format service strings/items
  const getBookingServiceNames = (b: Booking): string[] => {
    return b.services.map((s) => {
      if (typeof s === 'string') return s;
      return s.name || 'Service';
    });
  };

  // 1. BOOKINGS DATA & CALCULATIONS
  const todayStr = new Date().toISOString().split('T')[0];
  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return sortedBookings.filter((b) => {
      const name = (b.customerName || b.userName || '').toLowerCase();
      const phone = (b.customerPhone || b.phone || '');
      const email = (b.customerEmail || b.email || '').toLowerCase();
      const srvNames = getBookingServiceNames(b).join(' ').toLowerCase();

      const q = bookingSearch.toLowerCase();
      const matchesSearch = !q || name.includes(q) || phone.includes(q) || email.includes(q) || srvNames.includes(q);
      const matchesStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
      const matchesDate = !bookingDateFilter || b.date === bookingDateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [sortedBookings, bookingSearch, bookingStatusFilter, bookingDateFilter]);

  const todayBookingsCount = bookings.filter((b) => b.date === todayStr).length;
  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedBookingsCount = bookings.filter((b) => b.status === 'confirmed').length;
  const completedBookingsCount = bookings.filter((b) => b.status === 'completed').length;
  const cancelledBookingsCount = bookings.filter((b) => b.status === 'cancelled').length;
  
  // Total Revenue of completed bookings in NPR
  const totalCompletedRevenue = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'completed')
      .reduce((acc, curr) => acc + (Number(curr.totalPrice) || 0), 0);
  }, [bookings]);

  // 2. CUSTOMERS AGGREGATION
  const aggregatedCustomers = useMemo(() => {
    const map = new Map<string, { profile: UserProfile; bookings: Booking[]; totalSpent: number }>();

    // Add registered users
    customers.forEach((u) => {
      const key = u.email ? u.email.toLowerCase() : u.id;
      map.set(key, {
        profile: u,
        bookings: [],
        totalSpent: 0
      });
    });

    // Merge bookings
    bookings.forEach((b) => {
      const key = b.customerEmail
        ? b.customerEmail.toLowerCase()
        : b.email
        ? b.email.toLowerCase()
        : b.customerPhone || b.phone || b.userId || b.id || 'guest';

      const existing = map.get(key);
      if (existing) {
        existing.bookings.push(b);
        if (b.status === 'completed') {
          existing.totalSpent += Number(b.totalPrice) || 0;
        }
      } else {
        const guestProfile: UserProfile = {
          id: b.userId || key,
          fullName: b.customerName || b.userName || 'Guest Customer',
          email: b.customerEmail || b.email || '',
          phone: b.customerPhone || b.phone || '',
          role: 'user',
          createdAt: b.createdAt
        };
        map.set(key, {
          profile: guestProfile,
          bookings: [b],
          totalSpent: b.status === 'completed' ? Number(b.totalPrice) || 0 : 0
        });
      }
    });

    const list = Array.from(map.values());
    list.sort((a, b) => b.bookings.length - a.bookings.length);
    return list;
  }, [customers, bookings]);

  const filteredCustomers = useMemo(() => {
    return aggregatedCustomers.filter((c) => {
      const q = customerSearch.toLowerCase();
      if (!q) return true;
      return (
        c.profile.fullName.toLowerCase().includes(q) ||
        (c.profile.phone && c.profile.phone.includes(q)) ||
        (c.profile.email && c.profile.email.toLowerCase().includes(q))
      );
    });
  }, [aggregatedCustomers, customerSearch]);

  // Handle Load Sample Data Action
  const triggerLoadSampleData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Load Kathmandu Sample Data?',
      message: 'This will seed 6 categories, ~30 services with Nepali prices (NPR), 5 training courses, 6 gallery items, 3 testimonials, default page sections, and salon settings into Firestore.',
      confirmText: 'Yes, Seed Data',
      confirmVariant: 'primary',
      onConfirm: async () => {
        setIsSeeding(true);
        try {
          await seedSampleData(true);
          await refreshAll();
          showToast('Sample dataset loaded successfully into Firestore!');
        } catch (err) {
          console.error(err);
          showToast('Failed to seed sample data.', 'error');
        } finally {
          setIsSeeding(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Auth Guard
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-pink-200 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 bg-rose-100 text-[#8A2E44] rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-9 h-9" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-pink-950">
          Admin Authorization Required
        </h2>
        <p className="text-xs sm:text-sm text-stone-600">
          This dashboard is strictly reserved for the owner account (<strong>kamalaparlor@gmail.com</strong>).
        </p>
        <button
          onClick={() => setCurrentTab('login')}
          className="bg-[#8A2E44] text-white px-6 py-2.5 rounded-full text-xs font-semibold shadow hover:opacity-90 transition cursor-pointer"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 bg-stone-50/50 min-h-screen">
      
      {/* TOP HEADER */}
      <div className="bg-gradient-to-r from-[#8A2E44] via-rose-700 to-[#8A2E44] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-2 border-rose-400">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-white text-[#8A2E44] font-black text-[11px] uppercase px-3 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8A2E44]" />
              Verified Owner
            </span>
            <span className="text-xs text-rose-100 font-medium">kamalaparlor@gmail.com</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
            Kamala Beauty Parlor Admin Center
          </h1>
          <p className="text-xs sm:text-sm text-rose-100">
            Control all 7 functional management areas: Bookings, Services & Prices, Courses, Gallery, Sections, Customers, and Messages & Settings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={async () => {
              await refreshAll();
              showToast('Database refreshed.');
            }}
            className="bg-white/20 hover:bg-white/30 text-white px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* UNREAD INQUIRIES & CHAT ALERT BANNER (Ensures no message is left unseen) */}
      {/* UNREAD INQUIRIES & CHAT ALERT BANNER (Ensures no message is left unseen) */}
      {messages.filter(m => !m.read).length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 text-white p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-amber-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-amber-700 flex items-center justify-center font-bold flex-shrink-0 animate-bounce">
              <MessageSquare className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base text-white">
                {messages.filter(m => !m.read).length} Unread Customer Message{messages.filter(m => !m.read).length > 1 ? 's' : ''}!
              </p>
              <p className="text-xs text-amber-100">
                New inquiries received from clients. Respond promptly so no client is left waiting.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('settings_messages');
              setSettingsSubTab('messages');
              setMessageFilter('unread');
            }}
            className="bg-white text-amber-950 hover:bg-amber-50 px-4 py-2.5 rounded-xl text-xs font-extrabold transition shadow-md self-start sm:self-auto cursor-pointer active:scale-95 whitespace-nowrap"
          >
            Open & Reply ({messages.filter(m => !m.read).length})
          </button>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center justify-between gap-3 shadow-sm border transition-all animate-in fade-in slide-in-from-top-2 ${
            toastMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-xs underline font-bold cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* 7 MAIN SECTION NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-pink-200">
        {[
          { id: 'bookings', label: '1. Bookings', icon: Calendar, badge: pendingBookingsCount },
          { id: 'services', label: '2. Services & Prices', icon: Scissors, badge: services.length },
          { id: 'courses', label: '3. Training Courses', icon: GraduationCap, badge: courses.length },
          { id: 'gallery', label: '4. Gallery', icon: ImageIcon, badge: gallery.length },
          { id: 'sections', label: '5. Website Sections', icon: Layers, badge: sections.length },
          { id: 'customers', label: '6. Customers', icon: Users, badge: aggregatedCustomers.length },
          { id: 'settings_messages', label: '7. Messages & Settings', icon: MessageSquare, badge: messages.filter(m => !m.read).length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#8A2E44] text-white shadow-md ring-2 ring-rose-300'
                  : 'bg-white text-stone-700 hover:bg-pink-50 border border-pink-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-xs ${
                  isActive ? 'bg-white text-[#8A2E44]' : 'bg-pink-100 text-pink-800'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 1) BOOKINGS SECTION */}
      {/* ============================================================== */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-pink-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Today's Bookings</span>
              <p className="font-serif text-2xl font-bold text-pink-900 mt-1">{todayBookingsCount}</p>
              <span className="text-[10px] text-pink-600 font-medium">{todayStr}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Pending Approval</span>
              <p className="font-serif text-2xl font-bold text-amber-600 mt-1">{pendingBookingsCount}</p>
              <span className="text-[10px] text-amber-600 font-medium">Needs review</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Confirmed</span>
              <p className="font-serif text-2xl font-bold text-emerald-600 mt-1">{confirmedBookingsCount}</p>
              <span className="text-[10px] text-emerald-600 font-medium">Scheduled</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Completed</span>
              <p className="font-serif text-2xl font-bold text-blue-600 mt-1">{completedBookingsCount}</p>
              <span className="text-[10px] text-blue-600 font-medium">Fulfilled</span>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-pink-50 p-4 rounded-2xl border border-amber-300 shadow-xs">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">Completed Revenue</span>
              <p className="font-serif text-2xl font-bold text-[#8A2E44] mt-1">
                Rs. {totalCompletedRevenue.toLocaleString()}
              </p>
              <span className="text-[10px] text-amber-700 font-medium">NPR collected</span>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-pink-200 shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="relative w-full lg:w-80">
                <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer, phone, email, service..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 bg-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2 bg-pink-50/80 border border-pink-300 rounded-xl px-3 py-1.5 shadow-xs">
                  <Filter className="w-3.5 h-3.5 text-pink-600" />
                  <label htmlFor="booking-status-select" className="text-xs font-bold text-pink-950">Status:</label>
                  <select
                    id="booking-status-select"
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="text-xs font-bold text-pink-900 bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Bookings ({bookings.length})</option>
                    <option value="pending">Pending ({pendingBookingsCount})</option>
                    <option value="confirmed">Confirmed ({confirmedBookingsCount})</option>
                    <option value="completed">Completed ({completedBookingsCount})</option>
                    <option value="cancelled">Cancelled ({cancelledBookingsCount})</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-white border border-pink-200 rounded-xl px-3 py-1.5">
                  <Calendar className="w-3.5 h-3.5 text-pink-500" />
                  <input
                    type="date"
                    value={bookingDateFilter}
                    onChange={(e) => setBookingDateFilter(e.target.value)}
                    className="text-xs text-stone-700 bg-transparent focus:outline-none cursor-pointer"
                  />
                </div>

                {(bookingSearch || bookingStatusFilter !== 'all' || bookingDateFilter) && (
                  <button
                    onClick={() => {
                      setBookingSearch('');
                      setBookingStatusFilter('all');
                      setBookingDateFilter('');
                    }}
                    className="text-xs font-bold text-pink-600 hover:underline px-2 py-1 cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bookings Table & Cards */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-pink-500 animate-pulse text-sm">
                Loading all customer bookings...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-stone-600 font-serif text-base font-bold">No bookings match the filter criteria</p>
                <p className="text-stone-400 text-xs">Try clearing search or status filters to view records.</p>
              </div>
            ) : (
              <div>
                {/* Mobile Cards View (Visible on small screens, no horizontal scroll) */}
                <div className="block md:hidden divide-y divide-pink-100">
                  {filteredBookings.map((b) => {
                    const name = b.customerName || b.userName || 'Customer';
                    const phone = b.customerPhone || b.phone || '';
                    const email = b.customerEmail || b.email || '';
                    const time = b.timeSlot || b.time || '';
                    const srvNames = getBookingServiceNames(b);

                    const cleanPhone = phone.replace(/[^0-9]/g, '');
                    const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      `Namaste ${name}! This is Kamala Beauty Parlor regarding your appointment for ${b.date} at ${time}. Services: ${srvNames.join(', ')}. Status: ${b.status.toUpperCase()}.`
                    )}` : '';

                    return (
                      <div key={b.id} className="p-4 space-y-3 bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-stone-900 text-sm">{name}</h4>
                            <div className="flex items-center gap-2 text-xs text-stone-600 mt-0.5">
                              {phone && (
                                <a href={`tel:${phone}`} className="font-semibold text-pink-700 underline flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{phone}</span>
                                </a>
                              )}
                              {email && <span className="text-[11px] text-stone-400">({email})</span>}
                            </div>
                          </div>

                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : b.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}>
                            {b.status}
                          </span>
                        </div>

                        {/* Date, Time & Price */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-pink-50/50 p-2.5 rounded-xl border border-pink-100">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-stone-800">{b.date}</span>
                            <span className="text-stone-500">{time}</span>
                          </div>
                          <span className="font-serif font-bold text-pink-700">
                            Rs. {Number(b.totalPrice || 0).toLocaleString()}
                          </span>
                        </div>

                        {/* Services */}
                        <div className="flex flex-wrap gap-1">
                          {srvNames.map((s, idx) => (
                            <span key={idx} className="bg-pink-50 border border-pink-200 text-pink-900 px-2 py-0.5 rounded text-[11px] font-medium">
                              {s}
                            </span>
                          ))}
                        </div>

                        {b.notes && (
                          <p className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg">
                            Note: {b.notes}
                          </p>
                        )}

                        {/* Mobile Actions with 44px touch targets */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-pink-50">
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="min-h-[40px] px-3 bg-[#25D366] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 active:scale-95"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-current" />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          {b.status === 'pending' && (
                            <button
                              onClick={async () => {
                                if (!b.id) return;
                                await updateBookingStatus(b.id, 'confirmed');
                                showToast(`Booking for ${name} confirmed!`);
                              }}
                              className="min-h-[40px] px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold active:scale-95 cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}

                          {b.status === 'confirmed' && (
                            <button
                              onClick={async () => {
                                if (!b.id) return;
                                await updateBookingStatus(b.id, 'completed');
                                showToast(`Booking for ${name} completed!`);
                              }}
                              className="min-h-[40px] px-3 bg-blue-600 text-white rounded-xl text-xs font-bold active:scale-95 cursor-pointer"
                            >
                              Complete
                            </button>
                          )}

                          {b.status !== 'cancelled' && (
                            <button
                              onClick={async () => {
                                if (!b.id) return;
                                await updateBookingStatus(b.id, 'cancelled');
                                showToast(`Booking cancelled.`);
                              }}
                              className="min-h-[40px] px-3 border border-stone-300 text-stone-600 rounded-xl text-xs font-medium active:scale-95 cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}

                          <button
                            onClick={() => setViewingBooking(b)}
                            className="min-h-[40px] px-3 bg-pink-100 text-pink-800 rounded-xl text-xs font-bold active:scale-95 cursor-pointer"
                          >
                            Details
                          </button>

                          <button
                            onClick={() => {
                              if (!b.id) return;
                              setConfirmModal({
                                isOpen: true,
                                title: 'Delete Booking Record?',
                                message: `Are you sure you want to permanently delete booking for "${name}" on ${b.date}?`,
                                confirmText: 'Delete Permanently',
                                confirmVariant: 'danger',
                                onConfirm: async () => {
                                  await deleteBooking(b.id!);
                                  showToast('Booking deleted.');
                                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                                }
                              });
                            }}
                            className="min-h-[40px] px-2.5 text-rose-500 hover:text-rose-700 active:scale-95 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table View (Hidden on mobile) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] text-stone-700 uppercase font-bold border-b border-stone-200">
                      <tr>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Date & Slot</th>
                        <th className="py-3 px-4">Services</th>
                        <th className="py-3 px-4">Price (NPR)</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredBookings.map((b) => {
                        const name = b.customerName || b.userName || 'Customer';
                        const phone = b.customerPhone || b.phone || '';
                        const email = b.customerEmail || b.email || '';
                        const time = b.timeSlot || b.time || '';
                        const srvNames = getBookingServiceNames(b);

                        const cleanPhone = phone.replace(/[^0-9]/g, '');
                        const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                          `Namaste ${name}! This is Kamala Beauty Parlor regarding your appointment for ${b.date} at ${time}. Services: ${srvNames.join(', ')}. Status: ${b.status.toUpperCase()}.`
                        )}` : '';

                        return (
                          <tr key={b.id} className="hover:bg-pink-50/30 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-stone-900">{name}</div>
                              {b.notes && (
                                <div className="text-[10px] text-stone-500 italic max-w-xs truncate">
                                  Note: {b.notes}
                                </div>
                              )}
                              {b.adminNote && (
                                <div className="text-[10px] text-[#8A2E44] font-semibold max-w-xs truncate">
                                  Admin: {b.adminNote}
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                {phone ? (
                                  <a href={`tel:${phone}`} className="font-semibold text-stone-800 hover:text-[#8A2E44]">
                                    {phone}
                                  </a>
                                ) : (
                                  <span className="text-stone-400">No phone</span>
                                )}
                                {waLink && (
                                  <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 hover:text-emerald-700"
                                    title="WhatsApp client"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                  </a>
                                )}
                              </div>
                              {email && <div className="text-[10px] text-stone-400">{email}</div>}
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-bold text-stone-900">{b.date}</div>
                              <div className="text-[11px] text-stone-500">{time}</div>
                            </td>

                            <td className="py-3 px-4 max-w-xs">
                              <div className="flex flex-wrap gap-1">
                                {srvNames.map((s, idx) => (
                                  <span key={idx} className="bg-pink-50 border border-pink-200 text-pink-900 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </td>

                            <td className="py-3 px-4 font-bold text-[#8A2E44]">
                              Rs. {Number(b.totalPrice || 0).toLocaleString()}
                            </td>

                            <td className="py-3 px-4">
                              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-block ${
                                b.status === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : b.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : b.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-stone-200 text-stone-700'
                              }`}>
                                {b.status}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Quick Confirm button */}
                                {b.status === 'pending' && (
                                  <button
                                    onClick={async () => {
                                      if (!b.id) return;
                                      await updateBookingStatus(b.id, 'confirmed');
                                      showToast(`Booking for ${name} confirmed!`);
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                                    title="Confirm booking"
                                  >
                                    Confirm
                                  </button>
                                )}

                                {/* Quick Complete button */}
                                {b.status === 'confirmed' && (
                                  <button
                                    onClick={async () => {
                                      if (!b.id) return;
                                      await updateBookingStatus(b.id, 'completed');
                                      showToast(`Booking for ${name} marked completed!`);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                                    title="Complete booking"
                                  >
                                    Complete
                                  </button>
                                )}

                                {/* Quick Cancel button */}
                                {b.status !== 'cancelled' && (
                                  <button
                                    onClick={async () => {
                                      if (!b.id) return;
                                      await updateBookingStatus(b.id, 'cancelled');
                                      showToast(`Booking cancelled.`);
                                    }}
                                    className="border border-stone-300 hover:bg-stone-100 text-stone-600 px-2 py-1 rounded text-[10px] font-medium cursor-pointer"
                                    title="Cancel booking"
                                  >
                                    Cancel
                                  </button>
                                )}

                                {/* View Details modal */}
                                <button
                                  onClick={() => setViewingBooking(b)}
                                  className="bg-pink-100 hover:bg-pink-200 text-pink-800 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                                  title="View & edit booking details"
                                >
                                  Details
                                </button>

                                {/* Delete button */}
                                <button
                                  onClick={() => {
                                    if (!b.id) return;
                                    setConfirmModal({
                                      isOpen: true,
                                      title: 'Delete Booking Record?',
                                      message: `Are you sure you want to permanently delete booking for "${name}" on ${b.date}?`,
                                      confirmText: 'Delete Permanently',
                                      confirmVariant: 'danger',
                                      onConfirm: async () => {
                                        await deleteBooking(b.id!);
                                        showToast('Booking deleted.');
                                        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                                      }
                                    });
                                  }}
                                  className="text-rose-500 hover:text-rose-800 p-1 cursor-pointer"
                                  title="Delete booking"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2) SERVICES & PRICES SECTION */}
      {/* ============================================================== */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-pink-950">
                Services & Pricing Menu
              </h2>
              <p className="text-xs text-stone-500">
                Manage salon services, pricing in Nepali Rupees (NPR), durations, categories, and availability.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setEditingCategory({
                    name: '',
                    order: categories.length + 1,
                    visible: true
                  })
                }
                className="bg-white border-2 border-pink-300 text-pink-900 hover:bg-pink-50 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-pink-600" />
                <span>New Category</span>
              </button>

              <button
                onClick={() =>
                  setEditingService({
                    name: '',
                    title: '',
                    category: categories[0]?.name || 'Hair',
                    price: 1000,
                    priceNote: '',
                    duration: 45,
                    description: '',
                    imageUrl: '',
                    featured: false,
                    available: true,
                    order: services.length + 1
                  })
                }
                className="bg-[#8A2E44] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Add Service</span>
              </button>
            </div>
          </div>

          {/* Grouped Services by Category */}
          <div className="space-y-8">
            {categories.map((cat) => {
              const catServices = services.filter((s) => s.category.toLowerCase() === cat.name.toLowerCase());

              return (
                <div key={cat.id} className="bg-white rounded-3xl border border-pink-200 p-5 sm:p-6 shadow-xs space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-serif text-xl font-bold text-pink-950">{cat.name}</h3>
                      <span className="bg-pink-50 text-pink-700 text-xs font-bold px-2 py-0.5 rounded-full border border-pink-200">
                        {catServices.length} {catServices.length === 1 ? 'service' : 'services'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          await saveCategory({ ...cat, visible: !cat.visible });
                          showToast(`Category "${cat.name}" is now ${!cat.visible ? 'visible' : 'hidden'}.`);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 cursor-pointer ${
                          cat.visible ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-stone-100 text-stone-500'
                        }`}
                        title="Toggle category visibility"
                      >
                        {cat.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{cat.visible ? 'Visible' : 'Hidden'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: `Delete Category "${cat.name}"?`,
                            message: `Are you sure you want to delete this category? Services currently in this category will not be removed but will remain unassigned.`,
                            confirmText: 'Delete Category',
                            confirmVariant: 'danger',
                            onConfirm: async () => {
                              await deleteCategory(cat.id);
                              showToast(`Category "${cat.name}" deleted.`);
                              setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                            }
                          });
                        }}
                        className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Services list under this category */}
                  {catServices.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-400 italic">
                      No services added to this category yet. Click "Add Service" above to add one.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {catServices.map((srv) => (
                        <div
                          key={srv.id}
                          className="bg-pink-50/20 rounded-2xl p-4 border border-pink-100 hover:border-pink-300 transition-all flex flex-col justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-serif font-bold text-stone-900 text-sm">
                                {srv.name || srv.title}
                              </h4>
                              <span className="font-serif font-bold text-base text-[#8A2E44] whitespace-nowrap">
                                Rs. {Number(srv.price).toLocaleString()}
                              </span>
                            </div>

                            {srv.priceNote && (
                              <span className="text-[10px] text-stone-500 italic block">
                                {srv.priceNote}
                              </span>
                            )}

                            {srv.duration && (
                              <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                                <Clock className="w-3 h-3 text-pink-500" />
                                <span>{srv.duration} min</span>
                              </div>
                            )}

                            {srv.description && (
                              <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                                {srv.description}
                              </p>
                            )}
                          </div>

                          {/* Badges & Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-pink-100/60 text-xs">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={async () => {
                                  const updated = { ...srv, featured: !(srv.featured ?? srv.isFeatured) };
                                  await saveService(updated);
                                }}
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold cursor-pointer ${
                                  (srv.featured ?? srv.isFeatured)
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-stone-100 text-stone-500'
                                }`}
                                title="Toggle Featured"
                              >
                                {(srv.featured ?? srv.isFeatured) ? '★ Featured' : 'Normal'}
                              </button>

                              <button
                                onClick={async () => {
                                  const currentAvail = srv.available ?? srv.isAvailable ?? true;
                                  const updated = { ...srv, available: !currentAvail };
                                  await saveService(updated);
                                }}
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold cursor-pointer ${
                                  (srv.available ?? srv.isAvailable ?? true)
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                                title="Toggle Availability"
                              >
                                {(srv.available ?? srv.isAvailable ?? true) ? 'Available' : 'Unavailable'}
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingService(srv)}
                                className="p-1 text-stone-500 hover:text-[#8A2E44] cursor-pointer"
                                title="Edit service"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (!srv.id) return;
                                  setConfirmModal({
                                    isOpen: true,
                                    title: `Delete Service?`,
                                    message: `Are you sure you want to permanently delete "${srv.name || srv.title}"?`,
                                    confirmText: 'Delete Service',
                                    confirmVariant: 'danger',
                                    onConfirm: async () => {
                                      await deleteService(srv.id!);
                                      showToast('Service deleted.');
                                      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                                    }
                                  });
                                }}
                                className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                                title="Delete service"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3) TRAINING COURSES SECTION */}
      {/* ============================================================== */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-pink-950">
                Training Courses & Masterclasses
              </h2>
              <p className="text-xs text-stone-500">
                Manage beautician certification courses, syllabus highlights, duration, and tuition fees in NPR.
              </p>
            </div>

            <button
              onClick={() =>
                setEditingCourse({
                  title: '',
                  fee: 20000,
                  duration: '1 month',
                  description: '',
                  whatYouLearn: [],
                  imageUrl: '',
                  visible: true,
                  order: courses.length + 1
                })
              }
              className="bg-[#8A2E44] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>Add Course</span>
            </button>
          </div>

          {courses.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border text-center space-y-2">
              <GraduationCap className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="font-serif text-base font-bold text-stone-700">No courses published</p>
              <p className="text-xs text-stone-500">Click "Add Course" or "Load Sample Data" to add courses.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const topics = course.whatYouLearn || course.topics || [];

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl border border-pink-200 overflow-hidden shadow-xs hover:border-pink-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {course.imageUrl && (
                        <div className="h-44 w-full bg-stone-100 overflow-hidden relative">
                          <img
                            src={course.imageUrl}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              course.visible !== false ? 'bg-emerald-600 text-white' : 'bg-stone-700 text-white'
                            }`}>
                              {course.visible !== false ? 'Active' : 'Hidden'}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-serif font-bold text-lg text-pink-950">
                            {course.title}
                          </h3>
                          <span className="font-serif font-bold text-base text-[#8A2E44] whitespace-nowrap">
                            Rs. {Number(course.fee).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-pink-600" />
                          <span>Duration: {course.duration}</span>
                        </div>

                        <p className="text-xs text-stone-600 line-clamp-2">
                          {course.description}
                        </p>

                        {topics.length > 0 && (
                          <div className="space-y-1 pt-2">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                              What You'll Learn:
                            </span>
                            <ul className="text-xs text-stone-600 space-y-1 pl-3 list-disc">
                              {topics.slice(0, 3).map((t, idx) => (
                                <li key={idx} className="line-clamp-1">{t}</li>
                              ))}
                              {topics.length > 3 && (
                                <li className="text-[11px] text-pink-600 font-semibold list-none pl-0">
                                  + {topics.length - 3} more modules
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-pink-50/40 border-t border-pink-100 flex items-center justify-between text-xs">
                      <button
                        onClick={async () => {
                          const updated = { ...course, visible: !(course.visible ?? true) };
                          await saveCourse(updated);
                          showToast(`Course is now ${updated.visible ? 'visible' : 'hidden'}.`);
                        }}
                        className="text-stone-600 hover:text-pink-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {course.visible !== false ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-stone-400" />}
                        <span>{course.visible !== false ? 'Hide' : 'Show'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingCourse(course)}
                          className="bg-white border border-stone-200 hover:bg-stone-50 px-2.5 py-1 rounded-lg text-stone-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => {
                            if (!course.id) return;
                            setConfirmModal({
                              isOpen: true,
                              title: `Delete Course?`,
                              message: `Are you sure you want to permanently delete "${course.title}"?`,
                              confirmText: 'Delete Course',
                              confirmVariant: 'danger',
                              onConfirm: async () => {
                                await deleteCourse(course.id!);
                                showToast('Course deleted.');
                                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                              }
                            });
                          }}
                          className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Delete course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4) GALLERY SECTION */}
      {/* ============================================================== */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-pink-950">
                Photo Gallery & Lookbook
              </h2>
              <p className="text-xs text-stone-500">
                Curate bridal transformations, hairstyles, nail extensions, and facial results with direct image URLs.
              </p>
            </div>

            <button
              onClick={() =>
                setEditingGallery({
                  caption: '',
                  title: '',
                  category: 'Bridal',
                  imageUrl: '',
                  visible: true,
                  order: gallery.length + 1
                })
              }
              className="bg-[#8A2E44] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>Add Photo</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['all', 'Bridal', 'Party', 'Hair', 'Nails', 'Skin', 'Mehendi', 'Other'].map((cat) => {
              const isSelected = galleryCategoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setGalleryCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-white text-stone-600 hover:bg-pink-50 border border-pink-200'
                  }`}
                >
                  {cat === 'all' ? 'All Photos' : cat}
                </button>
              );
            })}
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {gallery
              .filter((g) => galleryCategoryFilter === 'all' || g.category.toLowerCase() === galleryCategoryFilter.toLowerCase())
              .map((item) => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-pink-200 shadow-xs relative group flex flex-col justify-between">
                  <div className="aspect-square w-full bg-stone-100 overflow-hidden relative">
                    <img
                      src={item.imageUrl}
                      alt={item.caption || item.title || 'Salon photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <span className="text-[9px] font-black uppercase bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5">
                    <p className="text-xs font-bold text-stone-900 truncate">
                      {item.caption || item.title || 'Bridal Makeover'}
                    </p>
                  </div>

                  {/* Hover Action overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 p-1 rounded-xl backdrop-blur-xs">
                    <button
                      onClick={() => setEditingGallery(item)}
                      className="p-1 bg-white text-stone-700 hover:text-pink-600 rounded-lg shadow cursor-pointer"
                      title="Edit caption / URL"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (!item.id) return;
                        setConfirmModal({
                          isOpen: true,
                          title: 'Delete Photo?',
                          message: `Are you sure you want to remove this photo from the gallery?`,
                          confirmText: 'Delete Photo',
                          confirmVariant: 'danger',
                          onConfirm: async () => {
                            await deleteGalleryItem(item.id!);
                            showToast('Photo removed.');
                            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                          }
                        });
                      }}
                      className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow cursor-pointer"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5) WEBSITE SECTIONS (SHOW / HIDE / ADD / DELETE / REORDER) */}
      {/* ============================================================== */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-pink-950">
                Website Sections (Dynamic Page Builder)
              </h2>
              <p className="text-xs text-stone-500">
                Customize content blocks per page (Home, About, Services, Training, Contact). Toggle visibility, edit copy, and reorder.
              </p>
            </div>

            <button
              onClick={() =>
                setEditingSection({
                  page: 'home',
                  type: 'text',
                  title: 'New Section Title',
                  subtitle: '',
                  body: '',
                  content: '',
                  imageUrl: '',
                  buttonText: '',
                  buttonLink: '',
                  visible: true,
                  order: sections.length + 1
                })
              }
              className="bg-[#8A2E44] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>Add Section</span>
            </button>
          </div>

          {/* Page Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['all', 'home', 'about', 'services', 'training', 'contact'].map((p) => {
              const isSelected = sectionPageFilter === p;
              return (
                <button
                  key={p}
                  onClick={() => setSectionPageFilter(p)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-white text-stone-600 hover:bg-pink-50 border border-pink-200'
                  }`}
                >
                  {p === 'all' ? 'All Pages' : `${p} Page`}
                </button>
              );
            })}
          </div>

          {/* Section Items List */}
          <div className="space-y-3">
            {sections
              .filter((sec) => sectionPageFilter === 'all' || (sec.page || 'home').toLowerCase() === sectionPageFilter.toLowerCase())
              .map((sec, idx, arr) => (
                <div
                  key={sec.id || idx}
                  className="bg-white p-5 rounded-2xl border border-pink-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-pink-100 text-pink-900 px-2 py-0.5 rounded">
                        Page: {sec.page || 'home'}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                        Type: {sec.type}
                      </span>
                      <span className="text-xs text-stone-400">Order: {sec.order}</span>

                      <button
                        onClick={async () => {
                          const updated = { ...sec, visible: !sec.visible };
                          await saveSection(updated);
                          showToast(`Section is now ${updated.visible ? 'visible' : 'hidden'}.`);
                        }}
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 cursor-pointer ${
                          sec.visible
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {sec.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{sec.visible ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-stone-900">{sec.title}</h3>
                    {sec.subtitle && <p className="text-xs text-[#8A2E44] font-semibold">{sec.subtitle}</p>}
                    <p className="text-xs text-stone-500 line-clamp-2 max-w-2xl">{sec.body || sec.content}</p>
                  </div>

                  {/* Actions & Reordering */}
                  <div className="flex items-center gap-2 self-start md:self-center">
                    <button
                      disabled={idx === 0}
                      onClick={async () => {
                        if (idx === 0) return;
                        const prevSec = arr[idx - 1];
                        const currentOrder = sec.order;
                        const prevOrder = prevSec.order;
                        await saveSection({ ...sec, order: prevOrder });
                        await saveSection({ ...prevSec, order: currentOrder });
                        showToast('Section moved up.');
                      }}
                      className="p-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    <button
                      disabled={idx === arr.length - 1}
                      onClick={async () => {
                        if (idx === arr.length - 1) return;
                        const nextSec = arr[idx + 1];
                        const currentOrder = sec.order;
                        const nextOrder = nextSec.order;
                        await saveSection({ ...sec, order: nextOrder });
                        await saveSection({ ...nextSec, order: currentOrder });
                        showToast('Section moved down.');
                      }}
                      className="p-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setEditingSection(sec)}
                      className="p-1.5 text-stone-600 hover:text-[#8A2E44] cursor-pointer"
                      title="Edit section"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (!sec.id) return;
                        setConfirmModal({
                          isOpen: true,
                          title: `Delete Section "${sec.title}"?`,
                          message: `Are you sure you want to permanently delete this section from the ${sec.page || 'home'} page?`,
                          confirmText: 'Delete Section',
                          confirmVariant: 'danger',
                          onConfirm: async () => {
                            await deleteSection(sec.id!);
                            showToast(`Section "${sec.title}" deleted.`);
                            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                          }
                        });
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 cursor-pointer"
                      title="Delete section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6) CUSTOMERS SECTION */}
      {/* ============================================================== */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-pink-950">
                Customer Database & Client Accounts
              </h2>
              <p className="text-xs text-stone-500">
                View registered users, total booking counts, and lifetime appointment history.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 bg-white"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            {filteredCustomers.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Users className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="font-serif text-base font-bold text-stone-700">No customers found</p>
                <p className="text-xs text-stone-400">Customer records appear automatically when users sign up or book treatments.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-stone-700 uppercase font-bold border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Total Bookings</th>
                      <th className="py-3 px-4">Last Booking Date</th>
                      <th className="py-3 px-4">Completed Spend</th>
                      <th className="py-3 px-4 text-right">History</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredCustomers.map((c, idx) => {
                      const lastBooking = c.bookings.length > 0
                        ? [...c.bookings].sort((a, b) => (b.date > a.date ? 1 : -1))[0]
                        : null;

                      return (
                        <tr key={c.profile.id || idx} className="hover:bg-pink-50/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-stone-900">{c.profile.fullName}</div>
                            <span className="text-[10px] text-pink-700 bg-pink-50 px-1.5 py-0.2 rounded font-semibold">
                              {c.profile.role === 'admin' ? 'Administrator' : 'Client'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-stone-700 font-semibold">
                            {c.profile.phone || '—'}
                          </td>

                          <td className="py-3 px-4 text-stone-500">
                            {c.profile.email || '—'}
                          </td>

                          <td className="py-3 px-4">
                            <span className="bg-pink-100 text-pink-900 px-2 py-0.5 rounded-full font-bold">
                              {c.bookings.length}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-stone-700">
                            {lastBooking ? lastBooking.date : 'No bookings yet'}
                          </td>

                          <td className="py-3 px-4 font-bold text-[#8A2E44]">
                            Rs. {c.totalSpent.toLocaleString()}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setViewingCustomer(c)}
                              className="bg-white hover:bg-pink-50 border border-pink-300 text-pink-900 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 ml-auto cursor-pointer shadow-xs"
                            >
                              <span>View History</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7) MESSAGES & SITE SETTINGS SECTION */}
      {/* ============================================================== */}
      {activeTab === 'settings_messages' && (
        <div className="space-y-6">
          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-3 border-b border-pink-200 pb-2">
            <button
              onClick={() => setSettingsSubTab('messages')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                settingsSubTab === 'messages'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-pink-50 border border-pink-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact Messages</span>
              {messages.filter(m => !m.read).length > 0 && (
                <span className="bg-white text-pink-700 text-[10px] font-black px-1.5 rounded-full">
                  {messages.filter(m => !m.read).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setSettingsSubTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                settingsSubTab === 'settings'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-pink-50 border border-pink-200'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Site & Business Settings</span>
            </button>
          </div>

          {/* Sub-Tab 1: Messages */}
          {settingsSubTab === 'messages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-pink-950">
                    Inbound Client Inquiries & Feedback
                  </h3>
                  <p className="text-xs text-stone-500">
                    Messages submitted from the website Contact page.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  {(['all', 'unread', 'read'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setMessageFilter(filter)}
                      className={`px-3 py-1 rounded-full capitalize font-bold cursor-pointer ${
                        messageFilter === filter
                          ? 'bg-pink-600 text-white'
                          : 'bg-white text-stone-600 hover:bg-pink-50 border border-pink-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {messages.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border text-center space-y-2">
                  <Mail className="w-10 h-10 text-stone-300 mx-auto" />
                  <p className="font-serif text-base font-bold text-stone-700">Inbox is empty</p>
                  <p className="text-xs text-stone-400">Inquiries sent from the website contact form will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages
                    .filter((m) => {
                      if (messageFilter === 'unread') return !m.read;
                      if (messageFilter === 'read') return m.read;
                      return true;
                    })
                    .map((m) => {
                      const cleanPhone = m.phone ? m.phone.replace(/[^0-9]/g, '') : '';
                      const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        `Namaste ${m.name}! This is Kamala Ma'am replying to your message sent to Kamala Beauty Parlor.`
                      )}` : '';

                      return (
                        <div
                          key={m.id}
                          className={`p-5 rounded-2xl border transition-all ${
                            m.read
                              ? 'bg-white border-stone-200'
                              : 'bg-pink-50/50 border-pink-300 shadow-xs ring-1 ring-pink-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-serif font-bold text-sm text-stone-900">{m.name}</span>
                                {!m.read && (
                                  <span className="bg-rose-500 text-white text-[9px] font-black uppercase px-2 py-0.2 rounded-full">
                                    New Unread
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-0.5">
                                {m.phone && <span>Phone: {m.phone}</span>}
                                {m.email && <span>Email: {m.email}</span>}
                                <span>{new Date(m.createdAt).toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {m.phone && (
                                <a
                                  href={`tel:${m.phone}`}
                                  className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 p-1.5 rounded-lg text-xs"
                                  title="Call"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {waLink && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-lg text-xs"
                                  title="Reply on WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                </a>
                              )}

                              <button
                                onClick={async () => {
                                  if (!m.id) return;
                                  await markMessageRead(m.id, !m.read);
                                  showToast(m.read ? 'Marked as unread' : 'Marked as read');
                                }}
                                className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer"
                              >
                                {m.read ? 'Mark Unread' : 'Mark Read'}
                              </button>

                              <button
                                onClick={() => {
                                  if (!m.id) return;
                                  setConfirmModal({
                                    isOpen: true,
                                    title: 'Delete Message?',
                                    message: `Delete message from "${m.name}"?`,
                                    confirmText: 'Delete Message',
                                    confirmVariant: 'danger',
                                    onConfirm: async () => {
                                      await deleteMessage(m.id!);
                                      showToast('Message deleted.');
                                      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                                    }
                                  });
                                }}
                                className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-stone-700 mt-3 bg-white p-3 rounded-xl border border-stone-100 leading-relaxed">
                            {m.message}
                          </p>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 2: Site Settings Form */}
          {settingsSubTab === 'settings' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-200 shadow-xs space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-pink-950">
                  Business Information & Booking Controls
                </h3>
                <p className="text-xs text-stone-500">
                  Update salon contact information, opening hours, booking slot limits, and Google Maps embed.
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSavingSettings(true);
                  try {
                    await saveSettings(formSettings);
                    showToast('Site settings updated successfully!');
                  } catch (err) {
                    console.error(err);
                    showToast('Failed to save settings.', 'error');
                  } finally {
                    setIsSavingSettings(false);
                  }
                }}
                className="space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-stone-700 uppercase">Business Name</label>
                    <input
                      type="text"
                      value={formSettings.businessName}
                      onChange={(e) => setFormSettings({ ...formSettings, businessName: e.target.value })}
                      className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 uppercase">Tagline</label>
                    <input
                      type="text"
                      value={formSettings.tagline}
                      onChange={(e) => setFormSettings({ ...formSettings, tagline: e.target.value })}
                      className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 uppercase">Phone Number</label>
                    <input
                      type="text"
                      value={formSettings.phone}
                      onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
                      className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 uppercase">WhatsApp Number (with country code)</label>
                    <input
                      type="text"
                      value={formSettings.whatsapp}
                      onChange={(e) => setFormSettings({ ...formSettings, whatsapp: e.target.value })}
                      className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 uppercase">Email Address</label>
                    <input
                      type="email"
                      value={formSettings.email}
                      onChange={(e) => setFormSettings({ ...formSettings, email: e.target.value })}
                      className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 uppercase">Physical Address (Kathmandu)</label>
                    <input
                      type="text"
                      value={formSettings.address}
                      onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
                      className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 uppercase">Opening Hours Description</label>
                    <input
                      type="text"
                      value={typeof formSettings.openingHours === 'string' ? formSettings.openingHours : 'Sun-Fri: 8AM-7PM'}
                      onChange={(e) => setFormSettings({ ...formSettings, openingHours: e.target.value })}
                      className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 uppercase">Slot Capacity (Bookings per time slot)</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={formSettings.slotCapacity}
                      onChange={(e) => setFormSettings({ ...formSettings, slotCapacity: Number(e.target.value) })}
                      className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 uppercase">Instagram Profile URL</label>
                    <input
                      type="text"
                      value={formSettings.instagramUrl}
                      onChange={(e) => setFormSettings({ ...formSettings, instagramUrl: e.target.value })}
                      className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 uppercase">TikTok Profile URL</label>
                    <input
                      type="text"
                      value={formSettings.tiktokUrl}
                      onChange={(e) => setFormSettings({ ...formSettings, tiktokUrl: e.target.value })}
                      className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 uppercase">Google Maps Link</label>
                    <input
                      type="text"
                      value={formSettings.mapsLink}
                      onChange={(e) => setFormSettings({ ...formSettings, mapsLink: e.target.value })}
                      className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 uppercase">Google Maps Embed URL</label>
                    <input
                      type="text"
                      value={formSettings.mapsEmbedUrl}
                      onChange={(e) => setFormSettings({ ...formSettings, mapsEmbedUrl: e.target.value })}
                      className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="font-bold text-stone-700 uppercase">
                    Available Time Slots (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formSettings.timeSlots.join(', ')}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        timeSlots: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      })
                    }
                    className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="bg-[#8A2E44] hover:bg-[#722335] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow transition cursor-pointer disabled:opacity-50"
                  >
                    {isSavingSettings ? 'Saving Settings...' : 'Save Site Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* IN-APP CONFIRMATION MODAL (Strictly replaces window.confirm) */}
      {/* ============================================================== */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-pink-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
              confirmModal.confirmVariant === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-pink-100 text-[#8A2E44]'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-xl font-bold text-pink-950">
                {confirmModal.title}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {confirmModal.message}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs shadow transition cursor-pointer ${
                  confirmModal.confirmVariant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-[#8A2E44] hover:bg-[#722335]'
                }`}
              >
                {confirmModal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: NEW CATEGORY */}
      {/* ============================================================== */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 text-xs shadow-2xl border border-pink-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-xl font-bold text-pink-950">New Service Category</h3>
              <button onClick={() => setEditingCategory(null)} className="cursor-pointer text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="font-bold text-stone-700 uppercase">Category Name *</label>
              <input
                type="text"
                placeholder="e.g. Hair, Facial, Makeup, Nails"
                value={editingCategory.name || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 uppercase">Display Order</label>
              <input
                type="number"
                value={editingCategory.order || 1}
                onChange={(e) => setEditingCategory({ ...editingCategory, order: Number(e.target.value) })}
                className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cat-vis"
                checked={editingCategory.visible ?? true}
                onChange={(e) => setEditingCategory({ ...editingCategory, visible: e.target.checked })}
                className="w-4 h-4 text-pink-600 rounded cursor-pointer"
              />
              <label htmlFor="cat-vis" className="font-bold text-stone-700 cursor-pointer">
                Visible on public menu
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 border rounded-xl text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingCategory.name?.trim()) return;
                  await saveCategory(editingCategory as ServiceCategory);
                  setEditingCategory(null);
                  showToast('Category saved.');
                }}
                className="px-5 py-2 bg-[#8A2E44] text-white rounded-xl font-bold cursor-pointer hover:opacity-90 shadow"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT SERVICE */}
      {/* ============================================================== */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 text-xs shadow-2xl border border-pink-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-xl font-bold text-pink-950">
                {editingService.id ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={() => setEditingService(null)} className="cursor-pointer text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="font-bold text-stone-700 uppercase">Service Name *</label>
              <input
                type="text"
                placeholder="e.g. Hydra Glow Facial"
                value={editingService.name || editingService.title || ''}
                onChange={(e) => setEditingService({ ...editingService, name: e.target.value, title: e.target.value })}
                className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 uppercase">Category *</label>
                <select
                  value={editingService.category || categories[0]?.name || 'Hair'}
                  onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                  className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 bg-white focus:outline-none focus:border-pink-500 cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 uppercase">Price in NPR *</label>
                <input
                  type="number"
                  min={1}
                  value={editingService.price || 500}
                  onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                  className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 uppercase">Duration (Minutes)</label>
                <input
                  type="number"
                  value={Number(editingService.duration) || 45}
                  onChange={(e) => setEditingService({ ...editingService, duration: Number(e.target.value) })}
                  className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 uppercase">Price Note (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. starting from"
                  value={editingService.priceNote || ''}
                  onChange={(e) => setEditingService({ ...editingService, priceNote: e.target.value })}
                  className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 uppercase">Description (optional)</label>
              <textarea
                rows={2}
                placeholder="Details about product quality, steps involved..."
                value={editingService.description || ''}
                onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 uppercase">Image URL (optional)</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={editingService.imageUrl || ''}
                onChange={(e) => setEditingService({ ...editingService, imageUrl: e.target.value })}
                className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={editingService.featured ?? editingService.isFeatured ?? false}
                  onChange={(e) => setEditingService({ ...editingService, featured: e.target.checked, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded"
                />
                <span>Featured on Homepage</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={editingService.available ?? editingService.isAvailable ?? true}
                  onChange={(e) => setEditingService({ ...editingService, available: e.target.checked, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded"
                />
                <span>Available for Booking</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2 border rounded-xl text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const sName = editingService.name || editingService.title;
                  if (!sName?.trim()) return;
                  await saveService(editingService as ServiceItem);
                  setEditingService(null);
                  showToast('Service saved successfully.');
                }}
                className="px-5 py-2 bg-[#8A2E44] text-white rounded-xl font-bold cursor-pointer hover:opacity-90 shadow"
              >
                Save Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT COURSE */}
      {/* ============================================================== */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 text-xs shadow-2xl border border-pink-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-xl font-bold text-pink-950">
                {editingCourse.id ? 'Edit Course' : 'Add Training Course'}
              </h3>
              <button onClick={() => setEditingCourse(null)} className="cursor-pointer text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="font-bold text-stone-700 uppercase">Course Title *</label>
              <input
                type="text"
                placeholder="e.g. Professional Makeup Artist Course"
                value={editingCourse.title || ''}
                onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 uppercase">Fee in NPR *</label>
                <input
                  type="number"
                  min={1}
                  value={editingCourse.fee || 15000}
                  onChange={(e) => setEditingCourse({ ...editingCourse, fee: Number(e.target.value) })}
                  className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 uppercase">Duration *</label>
                <input
                  type="text"
                  placeholder="e.g. 3 months"
                  value={editingCourse.duration || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                  className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 uppercase">Description *</label>
              <textarea
                rows={3}
                placeholder="Course overview, who it's for, certificate provided..."
                value={editingCourse.description || ''}
                onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 uppercase">What You'll Learn (1 topic per line)</label>
              <textarea
                rows={4}
                placeholder="Skin Types & Prepping&#10;Foundation & Concealer Matching&#10;Eyebrow Sculpting"
                value={(editingCourse.whatYouLearn || editingCourse.topics || []).join('\n')}
                onChange={(e) => {
                  const arr = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean);
                  setEditingCourse({ ...editingCourse, whatYouLearn: arr, topics: arr });
                }}
                className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 uppercase">Image URL (optional)</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={editingCourse.imageUrl || ''}
                onChange={(e) => setEditingCourse({ ...editingCourse, imageUrl: e.target.value })}
                className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="course-vis"
                checked={editingCourse.visible ?? true}
                onChange={(e) => setEditingCourse({ ...editingCourse, visible: e.target.checked })}
                className="w-4 h-4 text-pink-600 rounded cursor-pointer"
              />
              <label htmlFor="course-vis" className="font-bold text-stone-700 cursor-pointer">
                Visible on public training page
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="px-4 py-2 border rounded-xl text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingCourse.title?.trim()) return;
                  await saveCourse(editingCourse as CourseItem);
                  setEditingCourse(null);
                  showToast('Course saved successfully.');
                }}
                className="px-5 py-2 bg-[#8A2E44] text-white rounded-xl font-bold cursor-pointer hover:opacity-90 shadow"
              >
                Save Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT GALLERY PHOTO (WITH LIVE PREVIEW) */}
      {/* ============================================================== */}
      {editingGallery && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 text-xs shadow-2xl border border-pink-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-xl font-bold text-pink-950">Add Photo to Gallery</h3>
              <button onClick={() => setEditingGallery(null)} className="cursor-pointer text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="font-bold text-stone-700 uppercase">Image URL (Direct link) *</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={editingGallery.imageUrl || ''}
                onChange={(e) => setEditingGallery({ ...editingGallery, imageUrl: e.target.value })}
                className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* LIVE PREVIEW BOX */}
            <div>
              <label className="font-bold text-stone-700 uppercase block mb-1">Live Image Preview</label>
              <div className="h-44 w-full rounded-2xl overflow-hidden border border-pink-200 bg-pink-50/40 flex items-center justify-center relative">
                {editingGallery.imageUrl ? (
                  <img
                    src={editingGallery.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                ) : (
                  <div className="text-center text-stone-400 space-y-1">
                    <ImageIcon className="w-8 h-8 mx-auto text-pink-300" />
                    <span className="text-[11px] block">Paste image URL above to see live preview</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 uppercase">Caption / Title *</label>
              <input
                type="text"
                placeholder="e.g. Traditional Nepali Bridal Look"
                value={editingGallery.caption || editingGallery.title || ''}
                onChange={(e) => setEditingGallery({ ...editingGallery, caption: e.target.value, title: e.target.value })}
                className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 uppercase">Category *</label>
              <select
                value={editingGallery.category || 'Bridal'}
                onChange={(e) => setEditingGallery({ ...editingGallery, category: e.target.value })}
                className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 bg-white focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                <option value="Bridal">Bridal</option>
                <option value="Party">Party</option>
                <option value="Hair">Hair</option>
                <option value="Nails">Nails</option>
                <option value="Skin">Skin</option>
                <option value="Mehendi">Mehendi</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditingGallery(null)}
                className="px-4 py-2 border rounded-xl text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingGallery.imageUrl?.trim()) return;
                  await saveGalleryItem(editingGallery as GalleryItem);
                  setEditingGallery(null);
                  showToast('Photo added to gallery.');
                }}
                className="px-5 py-2 bg-[#8A2E44] text-white rounded-xl font-bold cursor-pointer hover:opacity-90 shadow"
              >
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT SECTION */}
      {/* ============================================================== */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 text-xs shadow-2xl border border-pink-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-xl font-bold text-pink-950">
                {editingSection.id ? 'Edit Page Section' : 'Add New Section'}
              </h3>
              <button onClick={() => setEditingSection(null)} className="cursor-pointer text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 uppercase">Target Page *</label>
                <select
                  value={editingSection.page || 'home'}
                  onChange={(e) => setEditingSection({ ...editingSection, page: e.target.value })}
                  className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 bg-white focus:outline-none focus:border-pink-500 cursor-pointer"
                >
                  <option value="home">Home</option>
                  <option value="about">About</option>
                  <option value="services">Services</option>
                  <option value="training">Training</option>
                  <option value="contact">Contact</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 uppercase">Section Type *</label>
                <select
                  value={editingSection.type || 'text'}
                  onChange={(e) => setEditingSection({ ...editingSection, type: e.target.value as any })}
                  className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 bg-white focus:outline-none focus:border-pink-500 cursor-pointer"
                >
                  <option value="hero">Hero</option>
                  <option value="text">Text Block</option>
                  <option value="imageText">Image + Text</option>
                  <option value="cards">Cards</option>
                  <option value="gallery">Gallery</option>
                  <option value="banner">Banner</option>
                  <option value="testimonials">Testimonials</option>
                  <option value="cta">Call to Action (CTA)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 uppercase">Title *</label>
              <input
                type="text"
                placeholder="e.g. Masterclass & Training Facility"
                value={editingSection.title || ''}
                onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 uppercase">Subtitle (optional)</label>
              <input
                type="text"
                placeholder="e.g. Learn from Kathmandu's Leading Artist"
                value={editingSection.subtitle || ''}
                onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 uppercase">Body Content (optional)</label>
              <textarea
                rows={4}
                placeholder="Write paragraph content..."
                value={editingSection.body || editingSection.content || ''}
                onChange={(e) => setEditingSection({ ...editingSection, body: e.target.value, content: e.target.value })}
                className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 uppercase">Image URL (optional)</label>
              <input
                type="text"
                placeholder="https://..."
                value={editingSection.imageUrl || ''}
                onChange={(e) => setEditingSection({ ...editingSection, imageUrl: e.target.value })}
                className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 uppercase">Button Text (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Learn More"
                  value={editingSection.buttonText || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, buttonText: e.target.value })}
                  className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 uppercase">Button Link (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. /training"
                  value={editingSection.buttonLink || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, buttonLink: e.target.value })}
                  className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sec-vis"
                checked={editingSection.visible ?? true}
                onChange={(e) => setEditingSection({ ...editingSection, visible: e.target.checked })}
                className="w-4 h-4 text-pink-600 rounded cursor-pointer"
              />
              <label htmlFor="sec-vis" className="font-bold text-stone-700 cursor-pointer">
                Visible on public page
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 border rounded-xl text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingSection.title?.trim()) return;
                  await saveSection(editingSection as PageSection);
                  setEditingSection(null);
                  showToast('Page section saved.');
                }}
                className="px-5 py-2 bg-[#8A2E44] text-white rounded-xl font-bold cursor-pointer hover:opacity-90 shadow"
              >
                Save Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: BOOKING DETAILS (VIEW, CHANGE STATUS, ADD ADMIN NOTE) */}
      {/* ============================================================== */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 text-xs shadow-2xl border border-pink-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-pink-950">Booking Record</h3>
                <span className="text-[10px] text-stone-400">ID: {viewingBooking.id}</span>
              </div>
              <button onClick={() => setViewingBooking(null)} className="cursor-pointer text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Customer</span>
                  <p className="font-bold text-stone-900 text-sm">
                    {viewingBooking.customerName || viewingBooking.userName || 'Client'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Phone</span>
                  <p className="font-semibold text-stone-900">
                    {viewingBooking.customerPhone || viewingBooking.phone || '—'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-pink-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Appointment Date</span>
                  <p className="font-bold text-stone-900">{viewingBooking.date}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Time Slot</span>
                  <p className="font-bold text-stone-900">{viewingBooking.timeSlot || viewingBooking.time}</p>
                </div>
              </div>

              <div className="pt-1 border-t border-pink-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Selected Services</span>
                <p className="font-semibold text-stone-800">
                  {getBookingServiceNames(viewingBooking).join(', ')}
                </p>
                <p className="text-base font-serif font-bold text-[#8A2E44] mt-1">
                  Total: Rs. {Number(viewingBooking.totalPrice).toLocaleString()}
                </p>
              </div>

              {viewingBooking.notes && (
                <div className="pt-1 border-t border-pink-100">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Client Notes</span>
                  <p className="text-stone-600 italic">{viewingBooking.notes}</p>
                </div>
              )}
            </div>

            {/* Change Status */}
            <div>
              <label className="font-bold text-stone-700 uppercase">Appointment Status</label>
              <select
                value={viewingBooking.status}
                onChange={(e) => setViewingBooking({ ...viewingBooking, status: e.target.value as any })}
                className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 bg-white font-bold cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Admin Internal Note */}
            <div>
              <label className="font-bold text-stone-700 uppercase">Admin Internal Note</label>
              <textarea
                rows={3}
                placeholder="e.g. Deposit paid via Esewa / client requested Kamala Ma'am directly"
                value={viewingBooking.adminNote || ''}
                onChange={(e) => setViewingBooking({ ...viewingBooking, adminNote: e.target.value })}
                className="w-full p-2.5 border border-pink-200 rounded-xl mt-1 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setViewingBooking(null)}
                className="px-4 py-2 border rounded-xl text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!viewingBooking.id) return;
                  await updateBookingStatus(viewingBooking.id, viewingBooking.status, viewingBooking.adminNote);
                  setViewingBooking(null);
                  showToast('Booking record updated.');
                }}
                className="px-5 py-2 bg-[#8A2E44] text-white rounded-xl font-bold cursor-pointer hover:opacity-90 shadow"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CUSTOMER BOOKING HISTORY */}
      {/* ============================================================== */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 text-xs shadow-2xl border border-pink-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-100 text-[#8A2E44] flex items-center justify-center font-bold font-serif text-lg">
                  {viewingCustomer.profile.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-pink-950">
                    {viewingCustomer.profile.fullName}
                  </h3>
                  <div className="text-stone-500 flex items-center gap-3">
                    {viewingCustomer.profile.phone && <span>{viewingCustomer.profile.phone}</span>}
                    {viewingCustomer.profile.email && <span>{viewingCustomer.profile.email}</span>}
                  </div>
                </div>
              </div>

              <button onClick={() => setViewingCustomer(null)} className="cursor-pointer text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-pink-50/50 p-3 rounded-2xl border border-pink-200 text-center">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Total Bookings</span>
                <p className="font-serif text-xl font-bold text-pink-900 mt-0.5">
                  {viewingCustomer.bookings.length}
                </p>
              </div>

              <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-700 uppercase font-bold block">Completed Treatments</span>
                <p className="font-serif text-xl font-bold text-emerald-800 mt-0.5">
                  {viewingCustomer.bookings.filter(b => b.status === 'completed').length}
                </p>
              </div>

              <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-200 text-center">
                <span className="text-[10px] text-amber-700 uppercase font-bold block">Lifetime Spend</span>
                <p className="font-serif text-xl font-bold text-[#8A2E44] mt-0.5">
                  Rs. {viewingCustomer.totalSpent.toLocaleString()}
                </p>
              </div>
            </div>

            {/* List of Bookings */}
            <div>
              <h4 className="font-serif font-bold text-sm text-pink-950 mb-2">Appointment History</h4>
              {viewingCustomer.bookings.length === 0 ? (
                <p className="text-stone-400 italic py-4 text-center">No appointment records found for this account.</p>
              ) : (
                <div className="space-y-2">
                  {viewingCustomer.bookings.map((b) => (
                    <div key={b.id} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                            b.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            b.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-stone-200 text-stone-700'
                          }`}>
                            {b.status}
                          </span>
                          <span className="font-bold text-stone-900">{b.date} • {b.timeSlot || b.time}</span>
                        </div>
                        <p className="text-stone-600 font-medium">
                          {getBookingServiceNames(b).join(' • ')}
                        </p>
                      </div>

                      <div className="text-right whitespace-nowrap">
                        <span className="font-serif font-bold text-sm text-[#8A2E44]">
                          Rs. {Number(b.totalPrice).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setViewingCustomer(null)}
                className="px-5 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-stone-700 cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
