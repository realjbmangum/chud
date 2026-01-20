# SC DMV Alerts

DMV road test appointment alert service for South Carolina. Monitors the SC DMV scheduler API for available appointments and sends email/SMS alerts to subscribers.

**Live site:** https://scdmvappointments.com

## Stack
- Astro + Tailwind CSS (frontend)
- Cloudflare Pages (hosting)
- Cloudflare D1 (SQLite database)
- Cloudflare Workers (scraper cron job)
- SendGrid (email)
- Stripe (payments) - NOT YET CONFIGURED
- Twilio (SMS) - NOT YET CONFIGURED

## Project Structure
```
src/
  layouts/       # Base layout
  components/    # UI components
  pages/         # Routes
    api/         # API endpoints (Astro server endpoints)
  lib/           # Utilities (notifications.ts)
  styles/        # Tailwind global styles
db/
  schema.sql     # D1 database schema
scraper-worker/  # Separate Cloudflare Worker for scraping
```

## How It Works

1. **Scraper Worker** (`scraper-worker/`) runs every 5 minutes via cron
2. Fetches appointments from SC DMV API: `publicwebsiteapi.scscheduler.com/api/AvailableLocation`
3. Posts results to `/api/scraper-results` on the main site
4. Main site filters appointments by subscriber preferences and sends emails

## Appointment Types Monitored

| Type ID | Code | Name |
|---------|------|------|
| 1 | `road_test` | Road Test (Class D) |
| 2 | `motorcycle_test` | Motorcycle Test |
| 3 | `cdl_b` | CDL Class B |
| 4 | `cdl_c` | CDL Class C |
| 5 | `cdl_a` | CDL Class A |
| 6 | `class_e` | Class E (Non-Commercial) |

**Note:** REAL ID, Driver's License renewals, and State ID are walk-in only at SC DMV - not available through the scheduler.

## Regions Monitored
greenville, columbia, charleston, myrtle_beach, spartanburg, florence, rock_hill, aiken

## Database (Cloudflare D1)

Database ID: `a927775f-ed1f-4514-8aa7-5f910f2918b5`

Tables:
- `subscribers` - email, phone, tier, status, appointment_type, preferred_region
- `availability_checks` - tracking what slots we've seen
- `notifications` - log of sent alerts

## Business Model
- **Free tier:** 1 email alert/day
- **Pro tier:** $5.99/mo, 3 alerts/day, SMS + email

## Environment Variables (Cloudflare Pages)

```
# SendGrid Email
SENDGRID_API_KEY=xxx
SENDGRID_FROM_EMAIL=alerts@scdmvappointments.com

# Scraper auth
SCRAPER_API_SECRET=xxx

# Mapbox (for locations map) - set in Cloudflare Pages dashboard
MAPBOX_ACCESS_TOKEN=pk.xxx

# Database (configured in wrangler.jsonc)
DB (binding to D1)

# Not yet configured
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
```

## Scraper Worker Environment Variables

Set in Cloudflare Workers dashboard:
```
API_ENDPOINT=https://scdmv-alerts.pages.dev/api/scraper-results
SCRAPER_API_SECRET=xxx (must match main site)
```

## Key URLs
- Live site: https://scdmvappointments.com
- Cloudflare Pages: https://scdmv-alerts.pages.dev
- Scraper Worker: https://scdmv-scraper.bmangum1.workers.dev
- SC DMV Scheduler: https://public.scscheduler.com/
- SC DMV API: https://publicwebsiteapi.scscheduler.com/api/AvailableLocation

## Testing

Manually trigger scraper:
```
https://scdmv-scraper.bmangum1.workers.dev/run
```

Test email (no subscriber data needed):
```
https://scdmv-scraper.bmangum1.workers.dev/test-email?to=your@email.com
```

Check env vars:
```
https://scdmv-alerts.pages.dev/api/debug-env
```

---

## Session Summary (January 18, 2026 - Evening)

### What's Working
- Email alerts via SendGrid (production ready, 50k/month plan)
- Domain authenticated: scdmvappointments.com verified in SendGrid
- Scraper runs every 5 minutes, finds ~750 appointments
- 6 appointment types across 8 SC regions
- Subscriber signup with preferences
- Daily alert limits (Free: 1/day, Pro: 3/day)
- Unsubscribe links in emails
- Test email endpoint for verifying SendGrid
- **Complete guides section with 6 guides**
- **Interactive Mapbox map on locations page**

### Pending Tasks
1. **Stripe Setup** - Pro tier payments not configured
2. **Twilio SMS Setup** - SMS alerts not configured
3. **Site UI fixes** - Review alert logic and site updates

### Guides Created (All Live)
1. `/guides` - Guide index page
2. `/guides/road-test` - SC road test guide (what to bring, tips, what to expect)
3. `/guides/motorcycle-test` - Motorcycle skills test + MSF course alternative
4. `/guides/real-id` - REAL ID document requirements
5. `/guides/license-renewal` - Online, mail, in-person renewal options
6. `/guides/cdl` - CDL Class A/B/C requirements, ELDT training, skills test, endorsements
7. `/guides/locations` - **Interactive Mapbox map** with all DMV offices

### Locations Map Features
- **65 official DMV offices** (sourced from dmv.sc.gov API)
- **3 SCDMV Express kiosks** (Kroger Columbia, Publix Greer, Publix Summerville)
- Region filter (8 regions)
- Appointment type filter (Road Test, Motorcycle, CDL, Class E/F, Self-Service Kiosk)
- Clickable markers with popup (address, hours, phone, services)
- Pink markers for kiosks, blue/green for offices
- Auto-zoom when filtering
- Service badges on location cards
- Mapbox token configured in Cloudflare env vars (as `PUBLIC_MAPBOX_ACCESS_TOKEN`)

### Data Sources
- **DMV Offices:** Official SC DMV API - `https://dmv.sc.gov/scdmv/get-locations`
- **Kiosks:** SCDMV Express - `https://scdmvexpress.com`

---

## Session Summary (January 19, 2026)

### What Was Done

1. **Fixed Mapbox map display**
   - Map was showing "unavailable" due to incorrect env var access
   - Cloudflare Pages SSR requires `Astro.locals.runtime.env` not `import.meta.env`
   - Updated to check both `PUBLIC_MAPBOX_ACCESS_TOKEN` and `MAPBOX_ACCESS_TOKEN`

2. **Rebuilt locations page with official data**
   - Previous location data was inaccurate/hallucinated
   - Fetched all 66 locations from official SC DMV API (`dmv.sc.gov/scdmv/get-locations`)
   - Added 65 active offices with accurate addresses, phone numbers, coordinates
   - Assigned each to one of 8 regions matching the scraper

3. **Added SCDMV Express kiosk locations**
   - 3 self-service kiosks in grocery stores (from scdmvexpress.com):
     - Kroger - Columbia (1028 Roberts Branch Pkwy) - 6am-11pm
     - Publix - Greer (411 The Pkwy) - 7am-10pm
     - Publix - Summerville (1724 State Rd) - 7am-10pm
   - Added "Self-Service Kiosk" filter option
   - Pink markers distinguish kiosks from DMV offices
   - Kiosk cards in dedicated section with hours and services

### Files Changed
- `src/pages/guides/locations.astro` - Complete rebuild with official data + kiosks
- `src/layouts/Layout.astro` - Fixed Mapbox token access for Cloudflare runtime
- `src/pages/api/debug-env.ts` - Added env key listing for debugging

### Commits
- `d1141d0` - feat: Rebuild locations page with official SC DMV data
- `bca8ce1` - feat: Add SCDMV Express kiosk locations to map
- `488e20a` - feat: Improve locations page UX with collapsible regions and search

### UX Improvements (Locations Page)
- **Search box** - Filter offices by city name, auto-expands matching regions
- **Collapsible regions** - All collapsed by default, reduces cognitive overload
- **Office count badges** - Shows count in branded badge on each region header
- **Get Directions links** - Google Maps links on all office and kiosk cards
- **Improved card styling** - Gray backgrounds, rounded corners, visual separation
- **Better kiosk cards** - Pink borders, icons, larger touch targets

### Pending Tasks
1. **Stripe Setup** - Pro tier payments not configured
2. **Twilio SMS Setup** - SMS alerts not configured

---

## Session Summary (January 19, 2026 - Continued)

### What Was Done

1. **Created FAQ page** (`/faq`)
   - Comprehensive FAQ with categories: About the Service, Pricing & Billing, Technical Questions
   - Covers appointment types, regions, pricing tiers, cancellation, email troubleshooting
   - Consistent styling with rest of site

2. **Updated site navigation**
   - Added FAQ and Locations links to header nav across all pages
   - Updated footer navigation on all pages (Guides, Locations, FAQ, Privacy, Terms)
   - Pages updated: index, guides/index, all 6 guide pages, faq

3. **Fixed guide icons**
   - Road Test guide: Changed from generic circles to map/path icon
   - Motorcycle guide: Changed from lightning bolt to actual motorcycle icon

4. **REAL ID Site Discussion**
   - REAL ID, license renewals, State ID are walk-in only - no appointments available
   - Alert service model doesn't work for walk-in services
   - Existing REAL ID guide on this site covers the main use case
   - Standalone REAL ID site would be informational only (no recurring revenue)

### Files Changed
- `src/pages/faq.astro` - New FAQ page
- `src/pages/index.astro` - Updated header/footer nav
- `src/pages/guides/index.astro` - Updated nav + fixed icons
- `src/pages/guides/road-test.astro` - Updated nav
- `src/pages/guides/motorcycle-test.astro` - Updated nav
- `src/pages/guides/cdl.astro` - Updated nav
- `src/pages/guides/real-id.astro` - Updated nav
- `src/pages/guides/license-renewal.astro` - Updated nav
- `src/pages/guides/locations.astro` - Updated nav

### Pending Tasks
1. **Stripe Setup** - Pro tier payments not configured
2. **Twilio SMS Setup** - SMS alerts not configured

---

## Session Summary (January 18, 2026 - Evening)

### Files Changed
- `src/pages/guides/index.astro` - Guide listing page
- `src/pages/guides/road-test.astro` - Road test guide
- `src/pages/guides/motorcycle-test.astro` - Motorcycle guide
- `src/pages/guides/real-id.astro` - REAL ID guide
- `src/pages/guides/license-renewal.astro` - License renewal guide
- `src/pages/guides/cdl.astro` - CDL guide
- `src/pages/guides/locations.astro` - Locations with Mapbox map
- `src/layouts/Layout.astro` - Added Mapbox token meta tag
- `.env.example` - Added MAPBOX_ACCESS_TOKEN

### Key Commits
- `feat: Add SC DMV guides section with road test guide`
- `feat: Add REAL ID guide with comprehensive document requirements`
- `feat: Add license renewal guide with online/mail/in-person options`
- `feat: Add motorcycle test guide with skills test maneuvers and MSF alternative`
- `feat: Add CDL license guide with Class A/B/C requirements and ELDT training`
- `feat: Add SC DMV locations guide with offices, hours, and tips`
- `feat: Add interactive Mapbox map to locations guide with filters`
