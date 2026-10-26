# Kamala Beauty Parlor - Swayambhu, Kathmandu

A complete, mobile-first, production-ready web application for **Kamala Beauty Parlor** in Swayambhu, Panchdhara, Kathmandu, Nepal.

---

## 1. Business Details

- **Business Name:** Kamala Beauty Parlor
- **Location:** Swayambhu, Panchdhara, Kathmandu, Nepal
- **Phone / WhatsApp:** 9851259277 ([WhatsApp Chat](https://wa.me/9779851259277))
- **Email:** kamalaparlor@gmail.com
- **TikTok:** [@makeup.kamala](https://www.tiktok.com/@makeup.kamala?_r=1&_t=ZS-9AoSGiBBk6G)
- **Instagram:** [@makeupkamala](https://www.instagram.com/makeupkamala?obrf=MW5ld2k3eWt3cXRlZg==)
- **Google Maps Link:** [https://maps.app.goo.gl/xNSJy7WHWs1UiWbV7](https://maps.app.goo.gl/xNSJy7WHWs1UiWbV7)

---

## 2. Features

- **Public Pages:**
  - **Home:** Hero section, signature services, why Kathmandu chooses us, academy preview, portfolio gallery, authentic testimonials, and location details.
  - **Services & Prices:** All services organized by category with pricing in Nepalese Rupees (NPR), search filtering, duration, and dual "Book Now" / "WhatsApp Book" actions.
  - **Training Academy:** Comprehensive beautician & makeup courses with syllabus topics, duration, fees in NPR, and direct WhatsApp admissions inquiry.
  - **Gallery:** Visual showcase with category filters (Bridal, Party, Hair, Nails, Mehendi, Facial) and interactive lightbox modal.
  - **About Us:** Founder Kamala's journey, mission, zero-counterfeit cosmetic guarantee, and hospital-grade sanitization standards.
  - **Contact:** Address, interactive Google Maps iframe, "Get Directions" button, and direct Firestore message form.
  - **Booking System:** Multi-service selection, auto-calculated NPR total, date picker, real-time slot capacity validation, profile auto-fill, and post-booking "Also Confirm on WhatsApp" link.
  - **My Bookings (Users):** View appointment status (Pending, Confirmed, Completed, Cancelled) with one-click cancellation.
  - **Admin Dashboard (Owner only):**
    - Bookings management with search, filter, status approval, and click-to-WhatsApp.
    - Dynamic Page Builder to add, edit, reorder, and toggle website sections.
    - Services & prices editor (NPR rates, duration, descriptions).
    - Training courses manager.
    - Gallery photo manager with live URL preview.
    - Testimonials manager.
    - Site settings (hours, contact info, slot capacity, booking time slots).
    - Customer message inbox.
    - **One-click "Load Sample Data"** button to populate or reset full Kathmandu catalog.

---

## 3. How to Set Up the Admin Account (Firebase Console)

The only admin email is **`kamalaparlor@gmail.com`**. No admin passwords are hardcoded in the codebase.

To create or configure the admin account:
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your Firebase project.
3. In the left sidebar, navigate to **Build** → **Authentication** → **Users**.
4. Click **Add user**.
5. Enter:
   - **Email:** `kamalaparlor@gmail.com`
   - **Password:** (Choose your private, secure password)
6. Click **Add user**.
7. Now log in from the application's **Sign In** page using `kamalaparlor@gmail.com` and that password. The application will recognize the email and automatically grant access to `/admin`.

---

## 4. Hosting & Deployment Instructions

### Option A: Firebase Hosting (Recommended)
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in and initialize:
   ```bash
   firebase login
   firebase init hosting
   ```
   - Public directory: `dist`
   - Configure as single-page app: `Yes`
3. Build and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

### Option B: Netlify
1. Connect your repository to Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add a redirect rule in `public/_redirects`:
   ```
   /*    /index.html   200
   ```

### Option C: Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Click **Deploy**.
