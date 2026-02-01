# IndependentRx - Site Structure

## Page Hierarchy

```
Homepage (/)
│
├── Browse by State (/browse)
│   │
│   └── State Page (/state/[state])
│       │   Example: /state/co
│       │
│       └── City Page (/state/[state]/[city])
│           │   Example: /state/co/denver
│           │
│           └── Pharmacy Detail (/state/[state]/[slug])
│               Example: /state/co/smiths-family-pharmacy
│
├── Search Results (/search?q=denver)
│   └── Filtered Results (same pharmacy cards as browse)
│
├── Why Independent? (/why-independent)
│   Educational content about:
│   - Pharmacy-insurance conflicts (CVS-Aetna)
│   - Benefits of independent pharmacies
│   - How to choose a pharmacy
│
├── Submit Your Pharmacy (/submit)
│   Form with sections:
│   - Business Information
│   - Location
│   - Ownership Verification
│   - Services Offered
│   └── API: POST /api/submit
│
├── Services Filter Pages (future)
│   ├── /services/compounding
│   ├── /services/24-hour
│   └── /services/delivery
│
├── About (/about) - future
├── FAQ (/faq) - future
├── Contact (/contact) - future
├── Privacy Policy (/privacy) - future
└── Terms of Service (/terms) - future
```

## User Flows

### Flow 1: Find Pharmacy by State

```
Homepage
  → Click "Browse by State" or state link
  → State Page (e.g., /state/co)
  → See all pharmacies in Colorado
  → Click pharmacy card
  → Pharmacy Detail Page
  → Click "Call" or "Website" or "Get Directions"
```

### Flow 2: Search by City/ZIP

```
Homepage
  → Enter "Denver, CO" in search bar
  → Click "Search Pharmacies"
  → Search Results (/search?q=denver)
  → Filter by services (compounding, 24-hour, etc.)
  → Click pharmacy card
  → Pharmacy Detail Page
```

### Flow 3: Pharmacy Owner Submits Listing

```
Homepage
  → Click "Add Your Pharmacy" (header or hero CTA)
  → Submit Form (/submit)
  → Fill out business info, location, ownership, services
  → Click "Submit for Review"
  → POST /api/submit → Stores in pharmacy_submissions table
  → Success message: "We'll review within 3 business days"
  → Email confirmation sent (future)
```

### Flow 4: Learn About Independence

```
Homepage
  → Click "Why Independent?" in nav
  → Educational Page (/why-independent)
  → Read about CVS-Aetna conflicts
  → Scroll to "Find an Independent Pharmacy"
  → Click "Browse Pharmacies by State"
  → Back to browse flow
```

## Page Components

### Homepage (/)

**Hero Section:**
- H1: "Find Independent Pharmacies Free from Corporate Conflicts"
- Search bar (city, state, or ZIP)
- Popular state links (CA, TX, FL, NY)

**Stats Section:**
- 21,683 Independent Pharmacies
- 50 States Covered
- 4,521 Verified Listings

**Why Independent Section:**
- 3 benefit cards (Personal Service, No Conflicts, Local Focus)
- Link to /why-independent

**Featured Pharmacies:**
- 3 pharmacy cards (featured listings)
- "Browse All Pharmacies" button

**CTA Section:**
- "Are You an Independent Pharmacy Owner?"
- "Add Your Pharmacy" button

### State Page (/state/[state])

**Header:**
- Breadcrumb: Home > Browse > Colorado
- H1: "Independent Pharmacies in Colorado"
- Count: "378 pharmacies"

**Filters Sidebar:**
- Services checkboxes (Compounding, 24-Hour, Delivery, etc.)
- "Apply Filters" button

**Results Grid:**
- Pharmacy cards (3-column grid on desktop)
- Pagination (if >50 results)

### Pharmacy Detail Page (/state/[state]/[slug])

**Header:**
- Breadcrumb: Home > Browse > Colorado > Denver > Smith's Family Pharmacy
- H1: Business Name
- "Verified Independent" badge (if ownership_verified = 1)

**Info Card:**
- Address with map (future: Mapbox embed)
- Phone (click to call)
- Website (link)
- Hours (if available)

**Services:**
- List of services offered (compounding, delivery, etc.)

**About:**
- Description text
- AI-generated description (if no custom description)

**CTA:**
- "Get Directions" (Google Maps link)
- "Call Now" (tel: link)
- "Visit Website" (external link)

### Submit Form (/submit)

**Sections:**
1. Business Information (name, contact name, email, phone, website)
2. Location (address, city, state, ZIP)
3. Ownership & Independence (radio buttons + conditional chain name field)
4. Services Offered (checkboxes)
5. Description (textarea)
6. Submit button

**Form Handling:**
- Client-side: Show/hide chain name field based on ownership type
- Server-side: POST to /api/submit → Insert into pharmacy_submissions table
- Success: Show confirmation message
- Error: Show error message with retry option

## Mobile Responsiveness

All pages are mobile-first:
- Search bar stacks vertically on mobile
- State grid: 1 column (mobile) → 2 (tablet) → 4 (desktop)
- Pharmacy cards: 1 column (mobile) → 2 (tablet) → 3 (desktop)
- Nav: Hamburger menu on mobile (future)

## Color Scheme

**Primary Blue:**
- 500: #0ea5e9 (buttons, links, badges)
- 50: #f0f9ff (light backgrounds)
- 600: #0284c7 (hover states)

**Accent Purple:**
- 500: #d946ef (featured badges)

**Grays:**
- 50: #f9fafb (page backgrounds)
- 900: #111827 (headings)
- 600: #4b5563 (body text)

## Icons

- Building icon for pharmacies
- Checkmark for verified badges
- Phone, globe, map icons for contact actions
- Arrow icons for links and navigation

---

**Status:** Mockup Complete ✅

**Next:** Install dependencies and test locally
