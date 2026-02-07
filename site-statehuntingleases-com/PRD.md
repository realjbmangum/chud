# PRD: State Hunting Leases Directory

> A directory and marketplace connecting hunters with hunting lease providers and private landowners across the Southeast US.

---

## 1. Problem

Finding hunting leases is fragmented and frustrating. Hunters currently rely on Craigslist, Facebook groups, word of mouth, and a handful of ugly, outdated lease sites. Landowners with leasable acreage have no centralized way to reach hunters. Lease management companies exist but are hard to discover by region.

The Southeast US has some of the strongest hunting culture in the country (deer, turkey, duck, hog) and no dominant, well-designed directory serving this market.

## 2. Target Users

| Persona | Need |
|---------|------|
| **Hunter (lessee)** | Find affordable hunting leases near them, filtered by game type, acreage, price, and amenities |
| **Landowner** | List their property to generate passive income from hunting leases |
| **Lease management company** | Get discovered by hunters and landowners in their service area |
| **Hunting club** | Find new properties or advertise open membership spots |

## 3. Scope

### In Scope (MVP)
- **Southeast US:** NC, SC, GA, VA, TN, AL, MS, FL (8 states — top hunting states in the region)
- Two listing types: **Properties** (landowner/company listings) and **Providers** (lease management companies)
- Browse by state, county, game type, price range, acreage
- Individual listing pages with photos, map, amenities, pricing, contact
- SEO-optimized state + county + game type landing pages
- Free basic listings, paid premium listings
- AdSense display ads
- "Submit Your Property" and "List Your Company" flows

### Out of Scope (v1)
- Online booking / payment processing
- User accounts / saved searches
- Reviews / ratings system
- Messaging between hunters and landowners
- Nationwide expansion (future)
- Mobile app

## 4. Data Model

### Listing Types

**Property Listings** (landowner or company-managed)
- Property name / title
- Location: state, county, city, lat/lng
- Acreage
- Game types available (deer, turkey, duck, hog, dove, quail, bear, etc.)
- Lease type: annual, seasonal, daily, weekend
- Price (annual lease price, or daily rate)
- Amenities: cabin, electricity, water, food plots, stands/blinds, ATV trails, camping
- Photos (up to 10)
- Description
- Contact info (phone, email, website)
- Availability status: available, leased, waitlist

**Provider Listings** (lease management companies)
- Company name
- Service area (states/counties)
- Services offered: lease management, property management, guided hunts
- Contact info, website
- Description
- Rating / review count (from Google Places if available)

### Database: Cloudflare D1

```sql
CREATE TABLE properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  listing_type TEXT DEFAULT 'property',  -- 'property' or 'provider'

  -- Location
  state TEXT NOT NULL,
  county TEXT,
  city TEXT,
  latitude REAL,
  longitude REAL,

  -- Property details
  acreage INTEGER,
  game_types_json TEXT,          -- ["deer", "turkey", "hog"]
  lease_type TEXT,               -- annual, seasonal, daily
  price_annual INTEGER,          -- annual lease price in cents
  price_daily INTEGER,           -- daily rate in cents
  amenities_json TEXT,           -- ["cabin", "food_plots", "stands"]

  -- Media & content
  description TEXT,
  photos_json TEXT,              -- array of photo URLs

  -- Contact
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,

  -- Status
  availability TEXT DEFAULT 'available',  -- available, leased, waitlist
  is_premium INTEGER DEFAULT 0,
  is_verified INTEGER DEFAULT 0,

  -- Tracking
  views INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,

  -- Location & coverage
  service_states_json TEXT,      -- ["NC", "SC", "GA"]
  service_counties_json TEXT,
  city TEXT,
  state TEXT,
  latitude REAL,
  longitude REAL,

  -- Business info
  services_json TEXT,            -- ["lease_management", "guided_hunts"]
  description TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  photos_json TEXT,

  -- Google data
  google_place_id TEXT,
  rating REAL,
  review_count INTEGER DEFAULT 0,

  -- Status
  is_premium INTEGER DEFAULT 0,
  is_verified INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_properties_state ON properties(state);
CREATE INDEX idx_properties_county ON properties(state, county);
CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_providers_state ON providers(state);
CREATE INDEX idx_providers_slug ON providers(slug);
```

## 5. Pages & SEO Strategy

### Programmatic SEO Pages

| Pattern | Example | Target Keyword |
|---------|---------|----------------|
| `/[state]` | /north-carolina | "hunting leases in North Carolina" |
| `/[state]/[county]` | /north-carolina/wake-county | "hunting leases in Wake County NC" |
| `/[state]/[game-type]` | /georgia/deer-hunting | "deer hunting leases in Georgia" |
| `/game/[type]` | /game/turkey | "turkey hunting leases Southeast" |
| `/property/[slug]` | /property/500-acre-deer-lease-wake-county | individual listing |
| `/provider/[slug]` | /provider/southeast-lease-management | provider profile |

### Static / Editorial Pages
- `/` — Homepage: search, featured listings, state browse, game type browse
- `/states` — All 8 states grid
- `/about` — About the directory
- `/list-property` — Landowner submission form
- `/list-company` — Provider submission form
- `/premium` — Premium listing sales page
- `/resources/hunting-lease-guide` — "Complete Guide to Hunting Leases" (link bait / SEO pillar)
- `/resources/landowner-guide` — "How to Lease Your Land for Hunting" (attracts supply side)
- `/blog` — Seasonal content: "Best [Season] Hunting in [State]", regulations, tips

### Estimated Page Count
- ~8 state pages
- ~800 county pages (across 8 states)
- ~64 state+game type combos (8 states x 8 game types)
- ~8 game type hub pages
- ~500-2,000 property listing pages (growth over time)
- ~200 provider pages
- **Total: ~1,600-3,100 indexed pages at launch, growing to 5,000+**

## 6. Revenue Model

### Stream 1: Premium Property Listings ($14.99/month or $149/year)
- Featured placement in state/county pages
- Up to 10 photos (free = 3)
- "Featured" badge
- Analytics: views, contact clicks
- Priority in search/browse results
- Direct contact info shown (free listings show contact form only)

### Stream 2: Premium Provider Listings ($19.99/month or $199/year)
- Same benefits as above
- "Verified Provider" badge
- Service area highlighted on state maps
- Logo displayed in browse results

### Stream 3: Display Ads (AdSense)
- Sidebar and in-feed ads on browse pages
- No ads on premium listings (perk)
- Hunting-related affiliate opportunities (gear, licenses, etc.)

### Revenue Projections (Conservative)
| Metric | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| Property listings | 100 | 500 | 1,500 |
| Provider listings | 50 | 150 | 300 |
| Premium properties | 3 | 15 | 50 |
| Premium providers | 2 | 8 | 20 |
| Premium MRR | $85 | $385 | $1,150 |
| AdSense/month | $10 | $50 | $200 |
| **Total MRR** | **$95** | **$435** | **$1,350** |

## 7. Data Seeding Strategy

### Phase 1: Providers (Google Places API)
- Search: "hunting lease company", "hunting land management", "hunting outfitter" in each state
- Estimated: 200-500 providers across 8 states
- Cost: ~$20-30 for Places API calls

### Phase 2: Properties (Manual + Scraping)
- Seed initial properties from public sources:
  - State wildlife agency lease programs (NC WRC, GA DNR, etc.)
  - Craigslist hunting lease posts (public data)
  - Existing lease sites (HuntingLease.com, HLRBO, BaseCamp Leasing)
- Goal: 50-100 seed properties per state to look credible at launch

### Phase 3: Organic Submissions
- "List Your Property Free" prominently featured
- Outreach to hunting Facebook groups and forums
- Hunting season timing: peak listing activity Aug-Oct (deer season prep)

## 8. Domain Options

Need to check availability. Candidates:
- `statehuntingleases.com` (original plan — check if available)
- `southeasthuntingleases.com`
- `huntleasese.com` (SE = Southeast)
- `dixiehuntingleases.com`
- `southernhuntingleases.com`
- `huntingsoutheast.com`
- `leasetohunt.com`

Priority: memorable, .com, ideally contains "hunting lease" for SEO.

## 9. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 4.x (rebuild from scratch — current code is potty directory template) |
| Styling | Tailwind CSS |
| Database | Cloudflare D1 |
| Hosting | Cloudflare Pages |
| Maps | Mapbox (property locations + service areas) |
| Payments | Stripe (premium listings) |
| Email | SendGrid (listing alerts, onboarding) |
| Ads | Google AdSense |
| Data seed | Google Places API (providers) + manual (properties) |
| Images | Cloudflare R2 or Images (user-uploaded property photos) |

**Note:** The existing codebase is a Potty Directory clone and needs to be rebuilt from scratch for hunting leases. The directory factory components can be referenced for patterns but the content/schema is completely different.

## 10. Build Phases

### Phase 1: Clean Slate + Database (1 day)
- [ ] Delete all potty directory content from the project
- [ ] Purchase domain
- [ ] Set up D1 database with new schema
- [ ] Create seed scripts for Google Places API (providers)
- [ ] Manual seed of 50+ initial property listings

### Phase 2: Core Pages (2-3 days)
- [ ] Homepage with search, state browse, game type browse, featured listings
- [ ] State pages with county list + listings
- [ ] County pages with property + provider listings
- [ ] Game type pages
- [ ] Individual property listing pages (with photo gallery, map, amenities)
- [ ] Individual provider profile pages
- [ ] Search/filter functionality (state, county, game type, price, acreage)

### Phase 3: Submission + Monetization (1-2 days)
- [ ] "List Your Property" submission form
- [ ] "List Your Company" submission form
- [ ] Premium listing Stripe checkout
- [ ] Enhanced features for premium (more photos, featured badge, analytics)
- [ ] AdSense integration
- [ ] Premium sales/comparison page

### Phase 4: SEO & Content (1 day)
- [ ] Sitemap generation
- [ ] Schema.org markup (Product, LocalBusiness, Place)
- [ ] Meta titles/descriptions for all programmatic pages
- [ ] "Complete Guide to Hunting Leases" pillar content
- [ ] "How to Lease Your Land" landowner guide
- [ ] 3-5 blog posts for initial content
- [ ] robots.txt, canonical URLs

### Phase 5: Launch (1 day)
- [ ] Deploy to Cloudflare Pages
- [ ] Google Search Console + Bing Webmaster
- [ ] Post in hunting Facebook groups (NC Deer Hunters, etc.)
- [ ] Outreach to 20 hunting lease companies for free listings
- [ ] Schedule blog content for hunting season buildup

## 11. Competitive Landscape

| Competitor | Strengths | Weaknesses |
|-----------|-----------|------------|
| **HLRBO.com** | Large inventory, transaction processing | Ugly UI, complicated, takes commission |
| **HuntingLease.com** | Established brand, nationwide | Dated design, poor mobile, expensive for landowners |
| **BaseCampLeasing** | Modern UI, good UX | Focused on managed leases only, high fees |
| **Craigslist / FB Groups** | Free, lots of listings | No filtering, scam risk, no photos/maps |

**Our edge:** Modern design, Southeast focus (deeper coverage), free listings to build supply, SEO-first programmatic pages, no transaction fees.

## 12. Seasonal Timing

Hunting is highly seasonal — this affects both marketing and listing activity:

| Month | Activity | Marketing Focus |
|-------|----------|----------------|
| Jan-Mar | Off-season (except turkey prep) | Content marketing, SEO building |
| Apr-May | Turkey season | Turkey lease listings |
| Jun-Aug | **Peak listing season** — leases posted for fall | Heavy outreach to landowners |
| Sep-Nov | **Peak hunting season** — deer, duck, dove | Ads, social media, hunter acquisition |
| Dec | Late season, renewals | Retention, renewal reminders |

**Ideal launch: May-June** to catch the peak listing season ahead of fall hunting.

## 13. Success Metrics

| Metric | Target (90 days) |
|--------|-------------------|
| Property listings | 200+ |
| Provider listings | 100+ |
| Pages indexed | 1,000+ |
| Monthly organic sessions | 500+ |
| Premium subscribers | 5+ |
| States with 10+ listings | 5 of 8 |

## 14. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Cold start — no listings = no hunters | Seed 50+ properties per state before launch. Free listings to reduce friction. |
| Seasonal demand | Launch before peak season (Jun-Aug). Use off-season for content/SEO. |
| Competition from HLRBO/BaseCamp | Free listings, better UX, Southeast focus vs. their thin national coverage. |
| Landowner trust | Verified badges, no transaction fees, professional design builds credibility. |
| Photo hosting costs | Cloudflare R2 is cheap ($0.015/GB/month). Limit free tier to 3 photos. |

---

*PRD created: February 6, 2026*
*Status: Ready for review*
*Note: Current codebase is a Potty Directory template — needs full rebuild.*
