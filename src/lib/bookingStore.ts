import { Booking } from '../types';
import { collection, setDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

const LOCAL_STORAGE_KEY = 'kamala_parlor_bookings';

/**
 * Read bookings stored in localStorage
 */
export function getLocalBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to read local bookings:', e);
    return [];
  }
}

/**
 * Save booking into localStorage and broadcast update
 */
export function saveLocalBooking(booking: Booking): Booking {
  try {
    const current = getLocalBookings();
    const updated = [booking, ...current.filter((b) => b.id !== booking.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kamala_bookings_updated'));
  } catch (e) {
    console.warn('Failed to save local booking:', e);
  }
  return booking;
}

/**
 * Update a booking status in local storage
 */
export function updateLocalBookingStatus(
  bookingId: string,
  status: Booking['status'],
  notes?: string
): void {
  try {
    const current = getLocalBookings();
    const updated = current.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          status,
          ...(notes !== undefined ? { notes } : {})
        };
      }
      return b;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kamala_bookings_updated'));
  } catch (e) {
    console.warn('Failed to update local booking:', e);
  }
}

/**
 * Delete a booking in local storage
 */
export function deleteLocalBooking(bookingId: string): void {
  try {
    const current = getLocalBookings();
    const updated = current.filter((b) => b.id !== bookingId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kamala_bookings_updated'));
  } catch (e) {
    console.warn('Failed to delete local booking:', e);
  }
}

/**
 * Get booked slot count for a specific date immediately from local storage,
 * and asynchronously enhance with any Firestore counts with a fast 1s timeout.
 */
export async function getBookedSlotsForDate(date: string): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  // 1. Instant local count
  const localList = getLocalBookings();
  localList.forEach((b) => {
    const slot = b.timeSlot || b.time;
    if (slot && b.date === date && (b.status === 'pending' || b.status === 'confirmed')) {
      counts[slot] = (counts[slot] || 0) + 1;
    }
  });

  // 2. Race with Firestore with a 1.2s timeout so the UI never blocks
  try {
    const firestorePromise = (async () => {
      const q = query(collection(db, 'bookings'), where('date', '==', date));
      const snap = await getDocs(q);
      snap.forEach((d) => {
        const data = d.data();
        const slot = data.timeSlot || data.time;
        if (slot && (data.status === 'pending' || data.status === 'confirmed')) {
          // If the doc is already accounted for locally, don't double count
          if (!localList.some((l) => l.id === d.id)) {
            counts[slot] = (counts[slot] || 0) + 1;
          }
        }
      });
      return counts;
    })();

    const timeoutPromise = new Promise<Record<string, number>>((resolve) =>
      setTimeout(() => resolve(counts), 1000)
    );

    return await Promise.race([firestorePromise, timeoutPromise]);
  } catch (e) {
    return counts;
  }
}

/**
 * Place a booking immediately: Saves to localStorage and writes directly to Firestore bookings
 * and guarantees the customer profile is registered in Firestore users so the Admin sees it.
 */
export async function placeBookingFast(newBooking: Omit<Booking, 'id'>): Promise<Booking> {
  const generatedId = `KP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const bookingWithId: Booking = { ...newBooking, id: generatedId };

  // 1. Immediately persist locally
  saveLocalBooking(bookingWithId);

  // 2. Write directly to Firestore
  try {
    const bookingDocData = {
      ...newBooking,
      id: generatedId,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'bookings', generatedId), bookingDocData, { merge: true });

    // Also guarantee user profile document exists in Firestore users collection
    if (newBooking.userId) {
      await setDoc(
        doc(db, 'users', newBooking.userId),
        {
          id: newBooking.userId,
          fullName: newBooking.customerName || newBooking.userName || 'Client',
          phone: newBooking.customerPhone || newBooking.phone || '',
          email: newBooking.customerEmail || newBooking.email || '',
          role: 'user',
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('Firestore booking sync notice (local copy saved):', err);
  }

  return bookingWithId;
}
