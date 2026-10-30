export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'user' | 'customer' | 'admin';
  createdAt?: string;
}

export interface BookingServiceItem {
  serviceId?: string;
  name: string;
  price: number;
}

export interface Booking {
  id?: string;
  userId: string;
  customerName?: string;
  userName?: string;
  customerPhone?: string;
  phone?: string;
  customerEmail?: string;
  email?: string;
  services: Array<BookingServiceItem | string>;
  totalPrice: number;
  date: string;
  timeSlot?: string;
  time?: string;
  notes?: string;
  source?: 'website' | 'whatsapp';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
  adminNote?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  order: number;
  visible: boolean;
}

export interface ServiceItem {
  id?: string;
  name?: string;
  title: string;
  categoryId?: string;
  category: string;
  price: number;
  priceNote?: string;
  duration?: string | number;
  description?: string;
  imageUrl?: string;
  featured?: boolean;
  isFeatured?: boolean;
  available?: boolean;
  isAvailable?: boolean;
  order: number;
  createdAt?: string;
}

export interface CourseItem {
  id?: string;
  title: string;
  fee: number;
  duration: string;
  description: string;
  whatYouLearn?: string[];
  topics?: string[];
  imageUrl?: string;
  visible?: boolean;
  order: number;
  createdAt?: string;
}

export interface GalleryItem {
  id?: string;
  imageUrl: string;
  caption?: string;
  title?: string;
  category: 'Bridal' | 'Party' | 'Hair' | 'Nails' | 'Skin' | 'Other' | string;
  visible?: boolean;
  order: number;
  createdAt?: string;
}

export interface PageSection {
  id?: string;
  page?: 'home' | 'about' | 'services' | 'training' | 'contact' | string;
  sectionKey?: string;
  type: 'hero' | 'text' | 'imageText' | 'cards' | 'gallery' | 'banner' | 'testimonials' | 'cta' | 'image_text';
  title: string;
  subtitle?: string;
  body?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  items?: any[];
  visible: boolean;
  order: number;
  createdAt?: string;
}

export interface TestimonialItem {
  id?: string;
  name?: string;
  clientName: string;
  serviceName?: string;
  text?: string;
  reviewText: string;
  rating: number;
  photoUrl?: string;
  visible?: boolean;
  order?: number;
  createdAt?: string;
}

export interface ContactMessage {
  id?: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  message: string;
  read: boolean;
  sender?: 'client' | 'admin';
  replyTo?: string;
  replyText?: string;
  createdAt: string;
}

export interface OpeningHourDay {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface SiteSettings {
  id?: string;
  businessName: string;
  tagline: string;
  phone: string;
  whatsappNumber?: string;
  whatsapp: string;
  email: string;
  address: string;
  googleMapsLink?: string;
  mapsLink: string;
  googleMapsEmbedUrl?: string;
  mapsEmbedUrl: string;
  tiktokUrl: string;
  instagramUrl: string;
  openingHours: string | OpeningHourDay[];
  closedDays?: string;
  closedDates?: string[];
  slotCapacity: number;
  timeSlots: string[];
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  updatedAt?: string;

  // Salon Experience & Stats
  experienceYears?: string;
  experienceLabel?: string;
  cosmeticsQuality?: string;
  cosmeticsLabel?: string;

  // Opening Hours & Walk-In Policy
  walkInPolicy?: string;
  weekdayLabel?: string;
  weekdayHours?: string;
  weekendLabel?: string;
  weekendHours?: string;

  // Founder & Story
  founderName?: string;
  founderRole?: string;
  founderQuote?: string;
  aboutStoryText?: string;
  aboutMissionText?: string;
  sanctuaryDescription?: string;
}

