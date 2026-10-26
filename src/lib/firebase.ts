import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  setDoc, 
  collection, 
  getDocs, 
  writeBatch 
} from 'firebase/firestore';
import type { 
  SiteSettings, 
  ServiceCategory,
  ServiceItem, 
  CourseItem, 
  GalleryItem, 
  TestimonialItem, 
  PageSection 
} from '../types';

export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, resource: string) {
  console.warn(`Firestore ${operationType} warning on ${resource}:`, error);
}

export const ADMIN_EMAIL = 'kamalaparlor@gmail.com';

// Load real configuration from firebase-applet-config.json provisioned for this applet
import appletConfig from '../../firebase-applet-config.json';
export const firebaseConfig = appletConfig;

// Initialize Firebase with provisioned config
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const DEFAULT_SETTINGS: SiteSettings = {
  businessName: 'Kamala Beauty Parlor',
  tagline: 'Look Good • Feel Beautiful • Be You',
  phone: '9851259277',
  whatsapp: '9779851259277',
  email: 'kamalaparlor@gmail.com',
  address: 'Swayambhu, Panchdhara, Kathmandu, Nepal',
  tiktokUrl: 'https://www.tiktok.com/@makeup.kamala?_r=1&_t=ZS-9AoSGiBBk6G',
  instagramUrl: 'https://www.instagram.com/makeupkamala?obrf=MW5ld2k3eWt3cXRlZg==',
  mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.0620894080187!2d85.286782!3d27.715367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1889a7122823%3A0x6b5a794939cb9588!2sSwayambhu%20Panchadhara%2C%20Kathmandu!5e0!3m2!1sen!2snp!4v1700000000000!5m2!1sen!2snp',
  mapsLink: 'https://maps.app.goo.gl/xNSJy7WHWs1UiWbV7',
  openingHours: 'Sun–Fri: 8:00 AM – 7:00 PM | Saturday: 9:00 AM – 5:00 PM',
  closedDays: 'Open all days (Special holidays notified)',
  slotCapacity: 3,
  timeSlots: [
    '08:30 AM', '09:30 AM', '10:30 AM', '11:30 AM',
    '12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM',
    '04:30 PM', '05:30 PM', '06:00 PM'
  ],
  heroTitle: 'Radiant Beauty & Expert Care in Kathmandu',
  heroSubtitle: 'Step into luxury and self-care at Swayambhu, Panchdhara. We specialize in bridal artistry, premium hair transformations, rejuvenating facials, and certified beautician masterclasses.',
  heroCtaText: 'Book Appointment'
};

export const SEED_SERVICES: Omit<ServiceItem, 'id'>[] = [
  // Hair
  { title: 'Haircut (women)', category: 'Hair', price: 500, duration: '40 min', description: 'Precision styling tailored to your face shape with wash guidance.', isFeatured: true, isAvailable: true, order: 1 },
  { title: 'Haircut (kids)', category: 'Hair', price: 300, duration: '30 min', description: 'Gentle and stylish haircut for children.', isFeatured: false, isAvailable: true, order: 2 },
  { title: 'Hair wash + blow dry', category: 'Hair', price: 500, duration: '35 min', description: 'Deep cleansing shampoo with voluminous salon blow dry.', isFeatured: false, isAvailable: true, order: 3 },
  { title: 'Hair spa', category: 'Hair', price: 2000, duration: '60 min', description: 'Nourishing cream massage, steam, and intense hydration for silky hair.', isFeatured: true, isAvailable: true, order: 4 },
  { title: 'Hair color (global)', category: 'Hair', price: 3500, duration: '90 min', description: 'Rich, even color application with ammonia-free premium products.', isFeatured: true, isAvailable: true, order: 5 },
  { title: 'Highlights', category: 'Hair', price: 4000, duration: '120 min', description: 'Balayage or streak highlights for stunning dimension.', isFeatured: false, isAvailable: true, order: 6 },
  { title: 'Rebonding / Smoothening', category: 'Hair', price: 6000, duration: '180 min', description: 'Permanent straightening for sleek, frizz-free, manageable hair.', isFeatured: true, isAvailable: true, order: 7 },
  { title: 'Keratin treatment', category: 'Hair', price: 7000, duration: '150 min', description: 'Intensive protein infusion restoring shine and strength to damaged hair.', isFeatured: true, isAvailable: true, order: 8 },

  // Facial & Skin
  { title: 'Basic facial', category: 'Facial & Skin', price: 1200, duration: '45 min', description: 'Cleansing, gentle exfoliation, steam, massage, and fresh pack.', isFeatured: false, isAvailable: true, order: 9 },
  { title: 'Fruit / gold facial', category: 'Facial & Skin', price: 2000, duration: '60 min', description: 'Nutrient-rich fruit extracts or glowing gold micro-foil rejuvenation.', isFeatured: true, isAvailable: true, order: 10 },
  { title: 'Hydra / glow facial', category: 'Facial & Skin', price: 3000, duration: '75 min', description: 'Deep pore vacuum infusion, ultra hydration, and glass skin glow.', isFeatured: true, isAvailable: true, order: 11 },
  { title: 'Clean-up', category: 'Facial & Skin', price: 800, duration: '30 min', description: 'Quick refreshing clean-up removing blackheads and dull skin.', isFeatured: false, isAvailable: true, order: 12 },
  { title: 'De-tan treatment', category: 'Facial & Skin', price: 1200, duration: '40 min', description: 'Sun-damage reversal pack restoring natural skin tone and radiance.', isFeatured: false, isAvailable: true, order: 13 },

  // Makeup
  { title: 'Party makeup', category: 'Makeup', price: 3500, duration: '60 min', description: 'Flawless glam makeup with eye contouring and lashes for celebrations.', isFeatured: true, isAvailable: true, order: 14 },
  { title: 'Engagement / reception makeup', category: 'Makeup', price: 8000, duration: '90 min', description: 'Long-lasting signature look curated with high-definition pigments.', isFeatured: true, isAvailable: true, order: 15 },
  { title: 'Bridal makeup', category: 'Makeup', price: 20000, duration: '150 min', description: 'Complete traditional Nepali bridal look including jewelry & dupatta setting.', isFeatured: true, isAvailable: true, order: 16 },
  { title: 'HD / Airbrush bridal makeup', category: 'Makeup', price: 30000, duration: '180 min', description: 'Ultra-luxurious waterproof airbrush finish that looks flawless under camera 4K.', isFeatured: true, isAvailable: true, order: 17 },
  { title: 'Saree / hair styling', category: 'Makeup', price: 1000, duration: '30 min', description: 'Traditional or modern saree draping and elegant hair updos.', isFeatured: false, isAvailable: true, order: 18 },

  // Nails
  { title: 'Manicure', category: 'Nails', price: 800, duration: '40 min', description: 'Cuticle care, gentle scrub, hand massage, and polish.', isFeatured: false, isAvailable: true, order: 19 },
  { title: 'Pedicure', category: 'Nails', price: 1000, duration: '45 min', description: 'Foot soak, callus smoothing, revitalizing massage, and neat shaping.', isFeatured: false, isAvailable: true, order: 20 },
  { title: 'Gel nail polish', category: 'Nails', price: 1200, duration: '45 min', description: 'Chip-free, glossy UV gel polish lasting up to 3-4 weeks.', isFeatured: true, isAvailable: true, order: 21 },
  { title: 'Nail extension', category: 'Nails', price: 2500, duration: '90 min', description: 'Acrylic or soft gel extensions with custom art and length.', isFeatured: true, isAvailable: true, order: 22 },

  // Threading & Waxing
  { title: 'Eyebrow threading', category: 'Threading & Waxing', price: 80, duration: '10 min', description: 'Precise eyebrow shaping with organic cotton thread.', isFeatured: false, isAvailable: true, order: 23 },
  { title: 'Upper lip / forehead threading', category: 'Threading & Waxing', price: 50, duration: '10 min', description: 'Quick and clean facial hair removal.', isFeatured: false, isAvailable: true, order: 24 },
  { title: 'Full face threading', category: 'Threading & Waxing', price: 300, duration: '25 min', description: 'Smooth, fuzz-free face prep for glowing makeup application.', isFeatured: false, isAvailable: true, order: 25 },
  { title: 'Underarm wax', category: 'Threading & Waxing', price: 200, duration: '15 min', description: 'Gentle Rica wax for sensitive underarm skin.', isFeatured: false, isAvailable: true, order: 26 },
  { title: 'Half arms / half legs wax', category: 'Threading & Waxing', price: 500, duration: '30 min', description: 'Silky hair-free finish using skin-calming wax.', isFeatured: false, isAvailable: true, order: 27 },
  { title: 'Full arms + legs wax', category: 'Threading & Waxing', price: 1500, duration: '60 min', description: 'Complete full body waxing package for soft, smooth skin.', isFeatured: true, isAvailable: true, order: 28 },

  // Mehendi
  { title: 'Hand mehendi (one side)', category: 'Mehendi', price: 700, duration: '40 min', description: 'Intricate Arabic or traditional mandala design with natural dark henna.', isFeatured: false, isAvailable: true, order: 29 },
  { title: 'Bridal mehendi', category: 'Mehendi', price: 3000, duration: '180 min', description: 'Detailed full hands & feet bridal henna storytelling artwork.', isFeatured: true, isAvailable: true, order: 30 }
];

export const SEED_COURSES: Omit<CourseItem, 'id'>[] = [
  {
    title: 'Basic Makeup Course',
    duration: '1 month',
    fee: 15000,
    description: 'Perfect for beginners wanting to master everyday self-makeup, party glam, and fundamental skin preparation techniques.',
    topics: ['Skin Types & Prepping', 'Foundation & Concealer Matching', 'Eyebrow Sculpting & Eye Makeup', 'Day-to-Night Glam Transformation', 'Hygienic Brush Care'],
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    order: 1
  },
  {
    title: 'Professional Makeup Artist Course',
    duration: '3 months',
    fee: 35000,
    description: 'Comprehensive professional certification covering studio, fashion, engagement, and portfolio-building skills for aspiring makeup artists in Nepal.',
    topics: ['Color Theory & Lighting', 'HD Contouring & Highlighting', 'Smokey & Cut-Crease Eyes', 'Saree & Dupatta Draping', 'Bridal & Party Artistry', 'Client Consultation & Social Media Marketing'],
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    order: 2
  },
  {
    title: 'Bridal Makeup Masterclass',
    duration: '2 weeks',
    fee: 20000,
    description: 'Intensive high-level masterclass focused exclusively on traditional and modern Nepali brides, water-resistant base, and luxury jewel setting.',
    topics: ['Long-wear Bridal Base Formulation', 'Traditional Nepali & Western Fusion', 'Airbrush Equipment & Technique', 'Crown, Dupatta & Jewelry Fixing', 'Pre-wedding Skin Glow Regime'],
    imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80',
    order: 3
  },
  {
    title: 'Hair Styling Course',
    duration: '1 month',
    fee: 12000,
    description: 'Hands-on practical training covering trendy hair cuts, blowouts, curling, bridal buns, French braids, and chemical treatments.',
    topics: ['Sectioning & Ergonomics', 'Thermal Styling (Curlers & Straighteners)', 'Bridal & Reception Updos', 'Braids, Twists & Extensions', 'Hair Texturizing & Product Guide'],
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    order: 4
  },
  {
    title: 'Beautician Full Course',
    duration: '6 months',
    fee: 50000,
    description: 'Our flagship diploma covering every aspect of salon operations: skin, hair, makeup, nails, mehendi, and salon management.',
    topics: ['Skin Anatomy & Advanced Facials', 'Chemical Hair Straightening & Keratin', 'Full Waxing & Threading Mastery', 'Nail Art & Gel Extensions', 'Complete Bridal Package', 'Salon Hygiene & Business Setup'],
    imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    order: 5
  }
];

export const SEED_GALLERY: Omit<GalleryItem, 'id'>[] = [
  {
    title: 'Traditional Nepali Bridal Makeup',
    category: 'Bridal',
    imageUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=800&q=80',
    order: 1
  },
  {
    title: 'Dewy Party Glam Look',
    category: 'Party',
    imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
    order: 2
  },
  {
    title: 'Smoothening & Glossy Hair Spa',
    category: 'Hair',
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    order: 3
  },
  {
    title: 'Bridal Henna & Mehendi Art',
    category: 'Mehendi',
    imageUrl: 'https://images.unsplash.com/photo-1610444583713-34e2c0500e57?auto=format&fit=crop&w=800&q=80',
    order: 4
  },
  {
    title: 'Luxury Acrylic Gel Extensions',
    category: 'Nails',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    order: 5
  },
  {
    title: 'Hydra Glow Facial Therapy',
    category: 'Facial',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    order: 6
  }
];

export const SEED_CATEGORIES: ServiceCategory[] = [
  { id: 'cat-hair', name: 'Hair', order: 1, visible: true },
  { id: 'cat-facial', name: 'Facial & Skin', order: 2, visible: true },
  { id: 'cat-makeup', name: 'Makeup', order: 3, visible: true },
  { id: 'cat-nails', name: 'Nails', order: 4, visible: true },
  { id: 'cat-waxing', name: 'Threading & Waxing', order: 5, visible: true },
  { id: 'cat-mehendi', name: 'Mehendi', order: 6, visible: true }
];

export const SEED_TESTIMONIALS: Omit<TestimonialItem, 'id'>[] = [
  {
    name: 'Pooja Shrestha',
    clientName: 'Pooja Shrestha',
    serviceName: 'HD Bridal Makeup',
    rating: 5,
    text: 'Kamala did my wedding makeup in Kathmandu and I was blown away! It stayed intact from morning till midnight during the bidaai without creasing. Everyone praised my look!',
    reviewText: 'Kamala did my wedding makeup in Kathmandu and I was blown away! It stayed intact from morning till midnight during the bidaai without creasing. Everyone praised my look!',
    visible: true,
    order: 1
  },
  {
    name: 'Smriti Thapa',
    clientName: 'Smriti Thapa',
    serviceName: 'Keratin & Hair Spa',
    rating: 5,
    text: 'My rough and frizzy hair became so soft and silky after the keratin treatment. Kamala Parlor is definitely the cleanest and most hospitable salon in the Swayambhu area.',
    reviewText: 'My rough and frizzy hair became so soft and silky after the keratin treatment. Kamala Parlor is definitely the cleanest and most hospitable salon in the Swayambhu area.',
    visible: true,
    order: 2
  },
  {
    name: 'Alisha Maharjan',
    clientName: 'Alisha Maharjan',
    serviceName: 'Professional Makeup Course',
    rating: 5,
    text: 'I completed the 3-month makeup course here. Kamala Ma’am teaches with so much patience and hands-on practice. I am now confident taking freelance bridal bookings!',
    reviewText: 'I completed the 3-month makeup course here. Kamala Ma’am teaches with so much patience and hands-on practice. I am now confident taking freelance bridal bookings!',
    visible: true,
    order: 3
  }
];

export const SEED_SECTIONS: Omit<PageSection, 'id'>[] = [
  // Home Page Sections
  {
    page: 'home',
    sectionKey: 'hero',
    title: 'Radiant Beauty & Expert Care in Kathmandu',
    subtitle: 'Kamala Beauty Parlor • Swayambhu, Panchdhara',
    content: 'Experience bespoke beauty rituals crafted with love, hygiene, and premium products. From dream bridal looks to rejuvenating facials and expert beautician academy courses.',
    body: 'Experience bespoke beauty rituals crafted with love, hygiene, and premium products. From dream bridal looks to rejuvenating facials and expert beautician academy courses.',
    buttonText: 'Book Appointment',
    buttonLink: '/booking',
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    type: 'hero',
    visible: true,
    order: 1
  },
  {
    page: 'home',
    sectionKey: 'about_home',
    title: 'Crafted with Passion, Rooted in Kathmandu',
    subtitle: 'Welcome to Kamala Beauty Parlor',
    content: 'Located near the serene heights of Swayambhu, Panchdhara, Kamala Beauty Parlor was founded with a singular commitment: helping every woman discover her unique radiance with warm, personalized hospitality.',
    body: 'Located near the serene heights of Swayambhu, Panchdhara, Kamala Beauty Parlor was founded with a singular commitment: helping every woman discover her unique radiance with warm, personalized hospitality.',
    buttonText: 'Learn More About Us',
    buttonLink: '/about',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    type: 'imageText',
    visible: true,
    order: 2
  },
  {
    page: 'home',
    sectionKey: 'services_highlight',
    title: 'Signature Salon Treatments',
    subtitle: 'Transparent Pricing in Nepalese Rupees',
    content: 'We take pride in clear, upfront pricing with top-grade sterilized tools, international cosmetic brands, and customized care for all skin and hair types.',
    body: 'We take pride in clear, upfront pricing with top-grade sterilized tools, international cosmetic brands, and customized care for all skin and hair types.',
    buttonText: 'View All Services & Prices',
    buttonLink: '/services',
    type: 'cards',
    visible: true,
    order: 3
  },
  {
    page: 'home',
    sectionKey: 'bridal_packages',
    title: 'Bridal & Occasion Glamour',
    subtitle: 'Kamala Signature Artistry',
    content: 'Specializing in traditional Nepali bridal looks, water-resistant HD airbrush makeup, elegant saree draping, and customized pre-wedding skin therapies.',
    body: 'Specializing in traditional Nepali bridal looks, water-resistant HD airbrush makeup, elegant saree draping, and customized pre-wedding skin therapies.',
    buttonText: 'Book Bridal Consultation',
    buttonLink: '/booking',
    imageUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=800&q=80',
    type: 'imageText',
    visible: true,
    order: 4
  },
  {
    page: 'home',
    sectionKey: 'why_choose_us',
    title: 'Why Kathmandu Chooses Us',
    subtitle: 'The Kamala Difference',
    content: 'Sterilized Instruments • Certified Cosmetics • Custom Shade Blending • Warm Hospitality • Accessible Location in Swayambhu with Dedicated Parking Guidance.',
    body: 'Sterilized Instruments • Certified Cosmetics • Custom Shade Blending • Warm Hospitality • Accessible Location in Swayambhu with Dedicated Parking Guidance.',
    type: 'cards',
    visible: true,
    order: 5
  },
  {
    page: 'home',
    sectionKey: 'contact_banner',
    title: 'Ready for Your Glow Up?',
    subtitle: 'We Are Open Sun–Fri 8 AM to 7 PM',
    content: 'Call or WhatsApp us directly at 9851259277 or reserve your slot online in minutes. Walk-ins are always welcomed warmly!',
    body: 'Call or WhatsApp us directly at 9851259277 or reserve your slot online in minutes. Walk-ins are always welcomed warmly!',
    buttonText: 'Reserve Slot Now',
    buttonLink: '/booking',
    type: 'banner',
    visible: true,
    order: 6
  },

  // About Page Sections
  {
    page: 'about',
    sectionKey: 'about_story',
    title: 'Our Heritage & Philosophy',
    subtitle: 'Over 8 Years of Excellence in Swayambhu',
    content: 'Kamala Beauty Parlor began as a humble sanctuary dedicated to genuine Nepali beauty, hygiene, and craftsmanship. Today, our certified team continues to innovate with modern salon aesthetics while honoring traditional Nepali warmth.',
    body: 'Kamala Beauty Parlor began as a humble sanctuary dedicated to genuine Nepali beauty, hygiene, and craftsmanship. Today, our certified team continues to innovate with modern salon aesthetics while honoring traditional Nepali warmth.',
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    type: 'imageText',
    visible: true,
    order: 1
  },

  // Services Page Section
  {
    page: 'services',
    sectionKey: 'services_intro',
    title: 'Comprehensive Beauty & Hair Services',
    subtitle: 'Pristine Hygiene & Genuine Professional Products',
    content: 'Browse our full catalog of hair styling, organic skin facials, luxury manicures, and bridal packages with clear, transparent NPR pricing.',
    body: 'Browse our full catalog of hair styling, organic skin facials, luxury manicures, and bridal packages with clear, transparent NPR pricing.',
    type: 'text',
    visible: true,
    order: 1
  },

  // Training Page Section
  {
    page: 'training',
    sectionKey: 'training_hero',
    title: 'Certified Beautician Masterclasses',
    subtitle: 'Launch Your Professional Salon Career in Nepal',
    content: 'Gain certified, hands-on training under Kamala Ma’am with real models, premium toolkits, and client consultation coaching.',
    body: 'Gain certified, hands-on training under Kamala Ma’am with real models, premium toolkits, and client consultation coaching.',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    type: 'hero',
    visible: true,
    order: 1
  },

  // Contact Page Section
  {
    page: 'contact',
    sectionKey: 'contact_info_sec',
    title: 'Visit Us in Swayambhu, Kathmandu',
    subtitle: 'Easy Access from Ring Road with Parking',
    content: 'We are situated in Swayambhu Panchdhara. We welcome scheduled appointments and walk-in consultations with a welcoming cup of tea.',
    body: 'We are situated in Swayambhu Panchdhara. We welcome scheduled appointments and walk-in consultations with a welcoming cup of tea.',
    type: 'text',
    visible: true,
    order: 1
  }
];

export async function seedSampleData(overwrite = false) {
  try {
    const settingsRef = doc(db, 'settings', 'site');
    await setDoc(settingsRef, DEFAULT_SETTINGS, { merge: !overwrite });

    // Seed categories
    const catSnap = await getDocs(collection(db, 'serviceCategories'));
    if (catSnap.empty || overwrite) {
      const batch = writeBatch(db);
      SEED_CATEGORIES.forEach((cat) => {
        const ref = doc(db, 'serviceCategories', cat.id);
        batch.set(ref, cat);
      });
      await batch.commit();
    }

    // Seed services if empty or overwrite
    const servicesSnap = await getDocs(collection(db, 'services'));
    if (servicesSnap.empty || overwrite) {
      const batch = writeBatch(db);
      SEED_SERVICES.forEach((s, idx) => {
        const serviceId = `srv-${idx + 1}`;
        const ref = doc(db, 'services', serviceId);
        batch.set(ref, {
          name: s.title,
          title: s.title,
          category: s.category,
          price: s.price,
          duration: s.duration,
          description: s.description,
          featured: s.isFeatured ?? true,
          isFeatured: s.isFeatured ?? true,
          available: s.isAvailable ?? true,
          isAvailable: s.isAvailable ?? true,
          order: s.order,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
    }

    // Seed courses
    const coursesSnap = await getDocs(collection(db, 'courses'));
    if (coursesSnap.empty || overwrite) {
      const batch = writeBatch(db);
      SEED_COURSES.forEach((c, idx) => {
        const courseId = `course-${idx + 1}`;
        const ref = doc(db, 'courses', courseId);
        batch.set(ref, {
          ...c,
          whatYouLearn: c.topics || [],
          visible: true,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
    }

    // Seed gallery
    const gallerySnap = await getDocs(collection(db, 'gallery'));
    if (gallerySnap.empty || overwrite) {
      const batch = writeBatch(db);
      SEED_GALLERY.forEach((g, idx) => {
        const photoId = `gal-${idx + 1}`;
        const ref = doc(db, 'gallery', photoId);
        batch.set(ref, {
          ...g,
          caption: g.title,
          visible: true,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
    }

    // Seed testimonials
    const testSnap = await getDocs(collection(db, 'testimonials'));
    if (testSnap.empty || overwrite) {
      const batch = writeBatch(db);
      SEED_TESTIMONIALS.forEach((t, idx) => {
        const testId = `test-${idx + 1}`;
        const ref = doc(db, 'testimonials', testId);
        batch.set(ref, {
          ...t,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
    }

    // Seed sections
    const secSnap = await getDocs(collection(db, 'sections'));
    if (secSnap.empty || overwrite) {
      const batch = writeBatch(db);
      SEED_SECTIONS.forEach((sec, idx) => {
        const secId = `sec-${sec.page}-${idx + 1}`;
        const ref = doc(db, 'sections', secId);
        batch.set(ref, {
          ...sec,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
    }

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seedSampleData');
  }
}

