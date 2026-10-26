import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  deleteDoc, 
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { 
  db, 
  DEFAULT_SETTINGS, 
  SEED_CATEGORIES,
  SEED_SERVICES, 
  SEED_COURSES, 
  SEED_GALLERY, 
  SEED_TESTIMONIALS, 
  SEED_SECTIONS,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import { 
  SiteSettings, 
  ServiceCategory,
  ServiceItem, 
  CourseItem, 
  GalleryItem, 
  TestimonialItem, 
  PageSection,
  ContactMessage,
  Booking,
  UserProfile
} from '../types';
import { getLocalBookings, saveLocalBooking, deleteLocalBooking, updateLocalBookingStatus } from '../lib/bookingStore';

interface SiteContextType {
  settings: SiteSettings;
  categories: ServiceCategory[];
  services: ServiceItem[];
  courses: CourseItem[];
  gallery: GalleryItem[];
  testimonials: TestimonialItem[];
  sections: PageSection[];
  messages: ContactMessage[];
  bookings: Booking[];
  customers: UserProfile[];
  loading: boolean;
  refreshAll: () => Promise<void>;
  saveCategory: (category: ServiceCategory) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveService: (service: ServiceItem) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  saveCourse: (course: CourseItem) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  saveSection: (section: PageSection) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  saveGalleryItem: (item: GalleryItem) => Promise<void>;
  deleteGalleryItem: (id: string) => Promise<void>;
  saveTestimonial: (item: TestimonialItem) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  saveSettings: (newSettings: SiteSettings) => Promise<void>;
  saveBooking: (booking: Booking) => Promise<void>;
  updateBookingStatus: (id: string, status: Booking['status'], notes?: string) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  addCustomerReview: (review: Omit<TestimonialItem, 'id'>) => Promise<void>;
  sendCustomerMessage: (message: Omit<ContactMessage, 'id'>) => Promise<void>;
  markMessageRead: (id: string, read: boolean) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

const getStored = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const setStored = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error caching ${key}:`, err);
  }
};

export const getDeletedItemIds = (): string[] => {
  return getStored<string[]>('kamala_deleted_item_ids', []);
};

export const markItemIdDeleted = (id: string) => {
  try {
    const current = getDeletedItemIds();
    if (!current.includes(id)) {
      setStored('kamala_deleted_item_ids', [...current, id]);
    }
  } catch (e) {
    console.warn('Error marking deleted id:', e);
  }
};

export const unmarkItemIdDeleted = (id: string) => {
  try {
    const current = getDeletedItemIds();
    setStored('kamala_deleted_item_ids', current.filter((item) => item !== id));
  } catch (e) {
    console.warn('Error unmarking deleted id:', e);
  }
};

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() =>
    getStored('kamala_settings', DEFAULT_SETTINGS)
  );

  const [categories, setCategories] = useState<ServiceCategory[]>(() => {
    const deleted = getDeletedItemIds();
    const loaded = getStored('kamala_categories', SEED_CATEGORIES);
    return loaded.filter((c) => !deleted.includes(c.id));
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    const deleted = getDeletedItemIds();
    const loaded = getStored(
      'kamala_services',
      SEED_SERVICES.map((s, idx) => ({ ...s, id: `seed-srv-${idx}` }))
    );
    return loaded.filter((s) => !s.id || !deleted.includes(s.id));
  });

  const [courses, setCourses] = useState<CourseItem[]>(() => {
    const deleted = getDeletedItemIds();
    const loaded = getStored(
      'kamala_courses',
      SEED_COURSES.map((c, idx) => ({ ...c, id: `seed-course-${idx}` }))
    );
    return loaded.filter((c) => !c.id || !deleted.includes(c.id));
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const deleted = getDeletedItemIds();
    const loaded = getStored(
      'kamala_gallery',
      SEED_GALLERY.map((g, idx) => ({ ...g, id: `seed-gal-${idx}` }))
    );
    return loaded.filter((g) => !g.id || !deleted.includes(g.id));
  });

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(() => {
    const deleted = getDeletedItemIds();
    const loaded = getStored(
      'kamala_testimonials',
      SEED_TESTIMONIALS.map((t, idx) => ({ ...t, id: `seed-test-${idx}` }))
    );
    return loaded.filter((t) => !t.id || !deleted.includes(t.id));
  });

  const [sections, setSections] = useState<PageSection[]>(() => {
    const deleted = getDeletedItemIds();
    const loaded = getStored(
      'kamala_sections',
      SEED_SECTIONS.map((sec, idx) => ({ ...sec, id: `seed-sec-${idx}` }))
    );
    return loaded.filter((sec) => !sec.id || !deleted.includes(sec.id));
  });

  const [messages, setMessages] = useState<ContactMessage[]>(() =>
    getStored('kamala_messages', [])
  );

  const [bookings, setBookings] = useState<Booking[]>(() =>
    getLocalBookings()
  );

  const [customers, setCustomers] = useState<UserProfile[]>(() =>
    getStored('kamala_customers', [])
  );

  const [loading, setLoading] = useState<boolean>(true);

  // Test Firestore Connection on boot per Skill instruction
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'settings', 'site'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    // 1. Settings listener
    const unsubSettings = onSnapshot(doc(db, 'settings', 'site'), (snap) => {
      if (snap.exists()) {
        const merged = { ...DEFAULT_SETTINGS, ...snap.data() } as SiteSettings;
        setSettings(merged);
        setStored('kamala_settings', merged);
      }
    }, (err) => console.warn('Settings snapshot notice:', err.message));

    // 2. Categories listener
    const unsubCategories = onSnapshot(collection(db, 'serviceCategories'), (snap) => {
      if (!snap.empty) {
        const deleted = getDeletedItemIds();
        const list: ServiceCategory[] = [];
        snap.forEach((d) => {
          if (!deleted.includes(d.id)) {
            list.push({ id: d.id, ...d.data() } as ServiceCategory);
          }
        });
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setCategories(list);
        setStored('kamala_categories', list);
      }
    }, (err) => console.warn('Categories snapshot notice:', err.message));

    // 3. Services listener
    const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
      if (!snap.empty) {
        const deleted = getDeletedItemIds();
        const list: ServiceItem[] = [];
        snap.forEach((d) => {
          if (!deleted.includes(d.id)) {
            const data = d.data();
            list.push({ 
              id: d.id, 
              name: data.name || data.title || '',
              title: data.title || data.name || '',
              ...data 
            } as ServiceItem);
          }
        });
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setServices(list);
        setStored('kamala_services', list);
      }
    }, (err) => console.warn('Services snapshot notice:', err.message));

    // 4. Courses listener
    const unsubCourses = onSnapshot(collection(db, 'courses'), (snap) => {
      if (!snap.empty) {
        const deleted = getDeletedItemIds();
        const list: CourseItem[] = [];
        snap.forEach((d) => {
          if (!deleted.includes(d.id)) {
            const data = d.data();
            list.push({
              id: d.id,
              whatYouLearn: data.whatYouLearn || data.topics || [],
              topics: data.topics || data.whatYouLearn || [],
              ...data
            } as CourseItem);
          }
        });
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setCourses(list);
        setStored('kamala_courses', list);
      }
    }, (err) => console.warn('Courses snapshot notice:', err.message));

    // 5. Gallery listener
    const unsubGallery = onSnapshot(collection(db, 'gallery'), (snap) => {
      if (!snap.empty) {
        const deleted = getDeletedItemIds();
        const list: GalleryItem[] = [];
        snap.forEach((d) => {
          if (!deleted.includes(d.id)) {
            const data = d.data();
            list.push({
              id: d.id,
              caption: data.caption || data.title || '',
              title: data.title || data.caption || '',
              ...data
            } as GalleryItem);
          }
        });
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setGallery(list);
        setStored('kamala_gallery', list);
      }
    }, (err) => console.warn('Gallery snapshot notice:', err.message));

    // 6. Testimonials listener
    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (snap) => {
      if (!snap.empty) {
        const deleted = getDeletedItemIds();
        const list: TestimonialItem[] = [];
        snap.forEach((d) => {
          if (!deleted.includes(d.id)) {
            const data = d.data();
            list.push({
              id: d.id,
              name: data.name || data.clientName || '',
              clientName: data.clientName || data.name || '',
              text: data.text || data.reviewText || '',
              reviewText: data.reviewText || data.text || '',
              ...data
            } as TestimonialItem);
          }
        });
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setTestimonials(list);
        setStored('kamala_testimonials', list);
      }
    }, (err) => console.warn('Testimonials snapshot notice:', err.message));

    // 7. Sections listener
    const unsubSections = onSnapshot(collection(db, 'sections'), (snap) => {
      if (!snap.empty) {
        const deleted = getDeletedItemIds();
        const list: PageSection[] = [];
        snap.forEach((d) => {
          if (!deleted.includes(d.id)) {
            const data = d.data();
            list.push({
              id: d.id,
              body: data.body || data.content || '',
              content: data.content || data.body || '',
              page: data.page || 'home',
              ...data
            } as PageSection);
          }
        });
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setSections(list);
        setStored('kamala_sections', list);
      }
    }, (err) => console.warn('Sections snapshot notice:', err.message));

    // 8. Messages listener
    const unsubMessages = onSnapshot(collection(db, 'messages'), (snap) => {
      if (!snap.empty) {
        const list: ContactMessage[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as ContactMessage));
        list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
        setMessages(list);
        setStored('kamala_messages', list);
      }
    }, (err) => console.warn('Messages snapshot notice:', err.message));

    // 9. Bookings listener
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
      if (!snap.empty) {
        const list: Booking[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            userName: data.userName || data.customerName || 'Customer',
            customerName: data.customerName || data.userName || 'Customer',
            phone: data.phone || data.customerPhone || '',
            customerPhone: data.customerPhone || data.phone || '',
            email: data.email || data.customerEmail || '',
            customerEmail: data.customerEmail || data.email || '',
            time: data.time || data.timeSlot || '',
            timeSlot: data.timeSlot || data.time || '',
            ...data
          } as Booking);
        });
        list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
        setBookings(list);
      }
    }, (err) => console.warn('Bookings snapshot notice:', err.message));

    // 10. Users listener
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      if (!snap.empty) {
        const list: UserProfile[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as UserProfile));
        setCustomers(list);
        setStored('kamala_customers', list);
      }
    }, (err) => console.warn('Users snapshot notice:', err.message));

    const onBookingsUpdated = () => {
      const local = getLocalBookings();
      setBookings(local);
    };
    window.addEventListener('kamala_bookings_updated', onBookingsUpdated);

    setLoading(false);

    return () => {
      unsubSettings();
      unsubCategories();
      unsubServices();
      unsubCourses();
      unsubGallery();
      unsubTestimonials();
      unsubSections();
      unsubMessages();
      unsubBookings();
      unsubUsers();
      window.removeEventListener('kamala_bookings_updated', onBookingsUpdated);
    };
  }, []);

  const refreshAll = async () => {
    try {
      const snap = await getDoc(doc(db, 'settings', 'site'));
      if (snap.exists()) {
        const merged = { ...DEFAULT_SETTINGS, ...snap.data() } as SiteSettings;
        setSettings(merged);
        setStored('kamala_settings', merged);
      }
    } catch (e) {
      console.warn('Refresh error:', e);
    }
  };

  // CRUD for Categories
  const saveCategory = async (cat: ServiceCategory) => {
    const id = cat.id || `cat-${Date.now()}`;
    unmarkItemIdDeleted(id);
    const cleanItem: ServiceCategory = { ...cat, id };
    setCategories((prev) => {
      const next = prev.some((c) => c.id === id)
        ? prev.map((c) => (c.id === id ? cleanItem : c))
        : [...prev, cleanItem];
      setStored('kamala_categories', next);
      return next;
    });
    try {
      await setDoc(doc(db, 'serviceCategories', id), cleanItem, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `serviceCategories/${id}`);
    }
  };

  const deleteCategory = async (id: string) => {
    markItemIdDeleted(id);
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      setStored('kamala_categories', next);
      return next;
    });
    try {
      await deleteDoc(doc(db, 'serviceCategories', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `serviceCategories/${id}`);
    }
  };

  // CRUD for Services
  const saveService = async (service: ServiceItem) => {
    const id = service.id || `srv-${Date.now()}`;
    unmarkItemIdDeleted(id);
    const cleanItem: ServiceItem = { 
      ...service, 
      id,
      name: service.name || service.title,
      title: service.title || service.name || 'Service',
      featured: service.featured ?? service.isFeatured ?? false,
      isFeatured: service.featured ?? service.isFeatured ?? false,
      available: service.available ?? service.isAvailable ?? true,
      isAvailable: service.available ?? service.isAvailable ?? true,
      createdAt: service.createdAt || new Date().toISOString()
    };
    setServices((prev) => {
      const next = prev.some((s) => s.id === id)
        ? prev.map((s) => (s.id === id ? cleanItem : s))
        : [...prev, cleanItem];
      setStored('kamala_services', next);
      return next;
    });
    try {
      const { id: _, ...data } = cleanItem;
      await setDoc(doc(db, 'services', id), data, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `services/${id}`);
    }
  };

  const deleteService = async (id: string) => {
    markItemIdDeleted(id);
    setServices((prev) => {
      const next = prev.filter((s) => s.id !== id);
      setStored('kamala_services', next);
      return next;
    });
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
    }
  };

  // CRUD for Courses
  const saveCourse = async (course: CourseItem) => {
    const id = course.id || `course-${Date.now()}`;
    unmarkItemIdDeleted(id);
    const cleanItem: CourseItem = { 
      ...course, 
      id,
      whatYouLearn: course.whatYouLearn || course.topics || [],
      topics: course.topics || course.whatYouLearn || [],
      visible: course.visible ?? true,
      createdAt: course.createdAt || new Date().toISOString()
    };
    setCourses((prev) => {
      const next = prev.some((c) => c.id === id)
        ? prev.map((c) => (c.id === id ? cleanItem : c))
        : [...prev, cleanItem];
      setStored('kamala_courses', next);
      return next;
    });
    try {
      const { id: _, ...data } = cleanItem;
      await setDoc(doc(db, 'courses', id), data, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `courses/${id}`);
    }
  };

  const deleteCourse = async (id: string) => {
    markItemIdDeleted(id);
    setCourses((prev) => {
      const next = prev.filter((c) => c.id !== id);
      setStored('kamala_courses', next);
      return next;
    });
    try {
      await deleteDoc(doc(db, 'courses', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `courses/${id}`);
    }
  };

  // CRUD for Sections
  const saveSection = async (section: PageSection) => {
    const id = section.id || `sec-${Date.now()}`;
    unmarkItemIdDeleted(id);
    const cleanItem: PageSection = { 
      ...section, 
      id,
      page: section.page || 'home',
      body: section.body || section.content || '',
      content: section.content || section.body || '',
      createdAt: section.createdAt || new Date().toISOString()
    };
    setSections((prev) => {
      const next = prev.some((sec) => sec.id === id)
        ? prev.map((sec) => (sec.id === id ? cleanItem : sec))
        : [...prev, cleanItem];
      setStored('kamala_sections', next);
      return next;
    });
    try {
      const { id: _, ...data } = cleanItem;
      await setDoc(doc(db, 'sections', id), data, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `sections/${id}`);
    }
  };

  const deleteSection = async (id: string) => {
    markItemIdDeleted(id);
    setSections((prev) => {
      const next = prev.filter((sec) => sec.id !== id);
      setStored('kamala_sections', next);
      return next;
    });
    try {
      await deleteDoc(doc(db, 'sections', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `sections/${id}`);
    }
  };

  // CRUD for Gallery
  const saveGalleryItem = async (item: GalleryItem) => {
    const id = item.id || `gal-${Date.now()}`;
    unmarkItemIdDeleted(id);
    const cleanItem: GalleryItem = { 
      ...item, 
      id,
      caption: item.caption || item.title || '',
      title: item.title || item.caption || '',
      visible: item.visible ?? true,
      createdAt: item.createdAt || new Date().toISOString()
    };
    setGallery((prev) => {
      const next = prev.some((g) => g.id === id)
        ? prev.map((g) => (g.id === id ? cleanItem : g))
        : [...prev, cleanItem];
      setStored('kamala_gallery', next);
      return next;
    });
    try {
      const { id: _, ...data } = cleanItem;
      await setDoc(doc(db, 'gallery', id), data, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `gallery/${id}`);
    }
  };

  const deleteGalleryItem = async (id: string) => {
    markItemIdDeleted(id);
    setGallery((prev) => {
      const next = prev.filter((g) => g.id !== id);
      setStored('kamala_gallery', next);
      return next;
    });
    try {
      await deleteDoc(doc(db, 'gallery', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `gallery/${id}`);
    }
  };

  // CRUD for Testimonials
  const saveTestimonial = async (item: TestimonialItem) => {
    const id = item.id || `test-${Date.now()}`;
    unmarkItemIdDeleted(id);
    const cleanItem: TestimonialItem = { 
      ...item, 
      id,
      name: item.name || item.clientName || 'Client',
      clientName: item.clientName || item.name || 'Client',
      text: item.text || item.reviewText || '',
      reviewText: item.reviewText || item.text || '',
      visible: item.visible ?? true,
      createdAt: item.createdAt || new Date().toISOString()
    };
    setTestimonials((prev) => {
      const next = prev.some((t) => t.id === id)
        ? prev.map((t) => (t.id === id ? cleanItem : t))
        : [...prev, cleanItem];
      setStored('kamala_testimonials', next);
      return next;
    });
    try {
      const { id: _, ...data } = cleanItem;
      await setDoc(doc(db, 'testimonials', id), data, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `testimonials/${id}`);
    }
  };

  const deleteTestimonial = async (id: string) => {
    markItemIdDeleted(id);
    setTestimonials((prev) => {
      const next = prev.filter((t) => t.id !== id);
      setStored('kamala_testimonials', next);
      return next;
    });
    try {
      await deleteDoc(doc(db, 'testimonials', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `testimonials/${id}`);
    }
  };

  // Settings
  const saveSettings = async (newSettings: SiteSettings) => {
    const updated = { ...newSettings, updatedAt: new Date().toISOString() };
    setSettings(updated);
    setStored('kamala_settings', updated);
    try {
      await setDoc(doc(db, 'settings', 'site'), updated, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/site');
    }
  };

  // Bookings CRUD
  const saveBooking = async (booking: Booking) => {
    const id = booking.id || `bk-${Date.now()}`;
    const cleanItem: Booking = {
      ...booking,
      id,
      customerName: booking.customerName || booking.userName || 'Client',
      userName: booking.userName || booking.customerName || 'Client',
      customerPhone: booking.customerPhone || booking.phone || '',
      phone: booking.phone || booking.customerPhone || '',
      customerEmail: booking.customerEmail || booking.email || '',
      email: booking.email || booking.customerEmail || '',
      timeSlot: booking.timeSlot || booking.time || '',
      time: booking.time || booking.timeSlot || '',
      updatedAt: new Date().toISOString()
    };
    saveLocalBooking(cleanItem);
    setBookings((prev) => {
      const exists = prev.some((b) => b.id === id);
      return exists ? prev.map((b) => (b.id === id ? cleanItem : b)) : [cleanItem, ...prev];
    });
    try {
      const { id: _, ...data } = cleanItem;
      await setDoc(doc(db, 'bookings', id), data, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `bookings/${id}`);
    }
  };

  const updateBookingStatus = async (id: string, status: Booking['status'], notes?: string) => {
    updateLocalBookingStatus(id, status, notes);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status, ...(notes !== undefined ? { notes } : {}) } : b))
    );
    try {
      await updateDoc(doc(db, 'bookings', id), {
        status,
        ...(notes !== undefined ? { notes } : {}),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const deleteBooking = async (id: string) => {
    deleteLocalBooking(id);
    setBookings((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteDoc(doc(db, 'bookings', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `bookings/${id}`);
    }
  };

  // Reviews from clients
  const addCustomerReview = async (review: Omit<TestimonialItem, 'id'>) => {
    const id = `test-${Date.now()}`;
    const cleanItem: TestimonialItem = {
      ...review,
      id,
      name: review.name || review.clientName,
      text: review.text || review.reviewText,
      visible: true,
      createdAt: new Date().toISOString()
    };
    setTestimonials((prev) => [cleanItem, ...prev]);
    try {
      await setDoc(doc(db, 'testimonials', id), cleanItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `testimonials/${id}`);
    }
  };

  // Messages
  const sendCustomerMessage = async (msg: Omit<ContactMessage, 'id'>) => {
    const id = `msg-${Date.now()}`;
    const cleanMsg: ContactMessage = { 
      ...msg, 
      id,
      createdAt: msg.createdAt || new Date().toISOString()
    };
    setMessages((prev) => [cleanMsg, ...prev]);
    const stored = getStored<ContactMessage[]>('kamala_messages', []);
    setStored('kamala_messages', [cleanMsg, ...stored]);
    try {
      await setDoc(doc(db, 'messages', id), cleanMsg);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `messages/${id}`);
    }
  };

  const markMessageRead = async (id: string, read: boolean) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));
    const stored = getStored<ContactMessage[]>('kamala_messages', []);
    setStored(
      'kamala_messages',
      stored.map((m) => (m.id === id ? { ...m, read } : m))
    );
    try {
      await updateDoc(doc(db, 'messages', id), { read });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `messages/${id}`);
    }
  };

  const deleteMessage = async (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    const stored = getStored<ContactMessage[]>('kamala_messages', []);
    setStored('kamala_messages', stored.filter((m) => m.id !== id));
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `messages/${id}`);
    }
  };

  return (
    <SiteContext.Provider
      value={{
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
        saveTestimonial,
        deleteTestimonial,
        saveSettings,
        saveBooking,
        updateBookingStatus,
        deleteBooking,
        addCustomerReview,
        sendCustomerMessage,
        markMessageRead,
        deleteMessage
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};
