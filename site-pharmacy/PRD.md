# PRD: Independent Pharmacy Directory

**Status:** Research & Viability Analysis
**Created:** January 29, 2026
**Type:** Directory Site - Business (Pharmacies)
**Scope:** National (United States)

---

## Executive Summary

Build a national directory helping consumers find and verify truly independent pharmacies—those not owned by CVS, Walgreens, or other chains, and ideally not participating in corporate-owned health plans like CVS Caremark.

**Market Opportunity:** Growing consumer awareness of conflicts of interest in the pharmacy-insurance complex (e.g., CVS owning both pharmacies and Aetna insurance, creating incentives to steer patients to their own pharmacies regardless of price/service quality).

**Key Insight:** People increasingly want to support local businesses and avoid companies with vertically-integrated conflicts of interest, but no easy way exists to identify truly independent pharmacies.

---

## Goals

1. **Launch MVP** - Directory of verified independent pharmacies across all 50 states with basic search/filter
2. **Help consumers make informed choices** - Clear criteria showing what makes a pharmacy "independent"
3. **Build monetizable traffic** - 10k+ monthly visitors within 6 months via SEO + word-of-mouth
4. **Generate revenue** - $500/month within 12 months via premium listings, affiliates, or ads
5. **Validate data model** - Prove we can reliably identify and verify pharmacy independence

---

## Non-Goals

**MVP will NOT include:**
- Live price comparison (requires pharmacy partnerships or scraping - too complex for MVP)
- User reviews/ratings (adds moderation burden)
- Prescription transfer tools (requires HIPAA compliance)
- Mobile app (web-first)
- International pharmacies (US-only for now)
- Compounding pharmacy specialization (future niche expansion)

---

## Problem Statement

**For consumers:**
- No easy way to find pharmacies that aren't owned by CVS, Walgreens, Rite Aid, Walmart, or Kroger
- Confusion about which pharmacies participate in corporate health plans (CVS Caremark, Express Scripts, OptumRx)
- Desire to support local businesses but lack of visibility into ownership
- Distrust of vertically-integrated pharmacy-insurance companies

**For independent pharmacies:**
- Harder to compete with chains' marketing budgets
- No centralized listing platform highlighting their independence
- Difficulty reaching consumers who actively seek independent alternatives

---

## User Personas

### Primary: Health-Conscious Consumer (Sarah)
- **Age:** 35-55
- **Pain:** Frustrated with CVS/Walgreens service, distrusts corporate pharmacy-insurance conflicts
- **Goal:** Find a local independent pharmacy with good service and fair prices
- **Behavior:** Googles "independent pharmacy near me", reads health news about corporate conflicts
- **Value:** Transparency, local ownership, avoiding corporate conflicts of interest

### Secondary: Senior Citizen (Robert)
- **Age:** 65+
- **Pain:** Multiple prescriptions, wants personal service, confused by insurance networks
- **Goal:** Find a pharmacy that accepts his insurance but isn't owned by the insurance company
- **Behavior:** Asks doctor for recommendations, searches online, reads reviews
- **Value:** Personal relationships, trust, fair pricing

### Tertiary: Independent Pharmacy Owner (Lisa)
- **Age:** 40-60
- **Pain:** Can't compete with chain marketing, wants to reach customers who value independence
- **Goal:** Get discovered by consumers actively seeking independent pharmacies
- **Behavior:** Joins local business associations, limited digital marketing budget
- **Value:** Visibility, verification badge, ability to showcase specialties

---

## Technical Considerations

### Data Sourcing (Critical for Viability)

**PUBLIC DATA SOURCES:**

| Source | Data Available | Coverage | Access Method | Cost |
|--------|---------------|----------|---------------|------|
| **NCPDP (National Council for Prescription Drug Programs)** | Pharmacy name, address, NPI, NCPDP ID | ~70,000 US pharmacies | API or data purchase | $$$? |
| **NPI Registry (CMS)** | Provider name, address, taxonomy codes | All registered pharmacies | Free bulk download or API | FREE |
| **State Pharmacy Boards** | Licensed pharmacies, ownership (varies by state) | State-level | 50 different websites/APIs | FREE (tedious) |
| **DEA Registration** | DEA numbers, addresses | Federal controlled substance licensees | FOIA request or scraper | FREE (slow) |
| **Google Maps / Outscraper** | Business names, locations, phones, categories | Most pharmacies | Scraping API | ~$0.002/record |

**OWNERSHIP VERIFICATION (Hardest Part):**

| Method | Accuracy | Effort | Notes |
|--------|----------|--------|-------|
| Chain name matching | 80% | Low | "CVS", "Walgreens" in name → easy to filter |
| Secretary of State business records | 90% | High | 50 states × manual lookups per pharmacy |
| Manual review + pharmacy confirmation | 95% | Very High | Outreach campaign asking pharmacies to verify |
| Community reporting | 70% | Medium | Let users flag incorrect listings |

**CORPORATE HEALTH PLAN PARTICIPATION (Even Harder):**

This is the **biggest challenge**. Determining if an independent pharmacy accepts CVS Caremark, Express Scripts, or OptumRx prescriptions is:
- Not publicly available data
- Changes frequently (contracts expire/renew)
- Requires pharmacy to self-report or users to confirm

**RECOMMENDATION:** Start without this filter in MVP. Add as Phase 2 feature via:
1. Pharmacy self-reporting during verification
2. User-contributed data ("Does this pharmacy accept your insurance?")
3. Partnerships with pharmacy associations (NCPA - National Community Pharmacists Association)

### Tech Stack (Per Site Factory Playbook)

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Astro | Static-first, SEO-optimized, fast builds |
| **Database** | Supabase | Free tier, per-site tables (`pharmacy_locations`, `pharmacy_submissions`) |
| **Styling** | Tailwind CSS | Rapid card layouts, mobile-first responsive |
| **Hosting** | Cloudflare Pages | Unlimited bandwidth, global CDN |
| **Forms** | Web3Forms + Supabase | Pharmacy submissions, contact forms |
| **Search** | Client-side filtering | State, city, services, ownership type |
| **Maps** | Mapbox (optional) | Location-based search |

### Database Schema

**Table:** `pharmacy_locations`

```sql
CREATE TABLE pharmacy_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic Info
    business_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    npi VARCHAR(10),
    ncpdp_id VARCHAR(7),

    -- Location
    street_address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code VARCHAR(10),
    county TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Contact
    phone TEXT,
    website TEXT,
    email TEXT,

    -- Independence Verification
    ownership_type TEXT, -- 'independent', 'small_chain', 'franchise', 'corporate'
    ownership_verified BOOLEAN DEFAULT FALSE,
    chain_affiliation TEXT, -- NULL if truly independent
    participates_in_corporate_plans BOOLEAN, -- NULL = unknown
    corporate_plans JSONB, -- ['CVS Caremark', 'Express Scripts', etc.]

    -- Services
    services_offered TEXT[], -- ['compounding', '24-hour', 'delivery', 'immunizations', 'DME']
    specialties TEXT[], -- ['pediatric', 'fertility', 'HIV/AIDS', 'oncology']
    accepts_goodrx BOOLEAN,

    -- Business Details
    hours JSONB, -- {"Monday": "9AM-6PM", ...}
    parking_available BOOLEAN,
    wheelchair_accessible BOOLEAN,
    languages_spoken TEXT[], -- ['Spanish', 'Mandarin', etc.]

    -- Content
    description TEXT,
    ai_description TEXT,
    photo_url TEXT,

    -- Metadata
    source TEXT, -- 'npi_registry', 'state_board', 'outscraper', 'manual', 'submission'
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    featured BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pharmacy_state_city ON pharmacy_locations(state, city);
CREATE INDEX idx_pharmacy_ownership ON pharmacy_locations(ownership_type);
CREATE INDEX idx_pharmacy_slug ON pharmacy_locations(slug);
CREATE INDEX idx_pharmacy_services ON pharmacy_locations USING GIN(services_offered);

-- RLS
ALTER TABLE pharmacy_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON pharmacy_locations FOR SELECT USING (true);
```

**Table:** `pharmacy_submissions` (same as other directory sites)

```sql
CREATE TABLE pharmacy_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    street_address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code VARCHAR(10),

    -- Ownership verification questions
    ownership_type TEXT,
    chain_name TEXT, -- if part of small chain
    corporate_plans TEXT[], -- which corporate plans accepted

    services_offered TEXT[],
    description TEXT,

    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Feature Matrix

**MVP (Phase 1 - 4 weeks):**

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Search by state/city | P0 | Low | Standard directory feature |
| Filter by ownership type | P0 | Medium | Requires ownership data verification |
| Basic pharmacy info (name, address, phone, hours) | P0 | Low | Standard fields |
| "Independent" badge | P0 | Low | Visual indicator of verified independence |
| Pharmacy submission form | P0 | Low | Let pharmacies add themselves |
| SEO-optimized listing pages | P0 | Medium | `/state/city/pharmacy-name` |
| Educational content ("Why Choose Independent?") | P1 | Low | Landing page copy |

**Phase 2 (Months 2-3):**

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Services filter (compounding, 24-hour, delivery) | P1 | Low | Checkbox filters |
| Corporate health plan filter | P1 | High | Requires pharmacy self-reporting |
| Map view | P2 | Medium | Mapbox integration |
| GoodRx affiliate links | P1 | Low | Revenue stream |
| Premium pharmacy listings | P1 | Medium | Stripe integration |

**Phase 3 (Months 4-6):**

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Price comparison (limited scope) | P2 | Very High | Requires partnerships or scraping |
| User reviews | P2 | Medium | Moderation required |
| Pharmacy verification badges | P1 | Medium | Email/phone verification |
| Affiliate partnerships with NCPA | P1 | Medium | Business development |

---

## User Stories (MVP - Completable in One Session Each)

### Story 1: Browse Pharmacies by State
**As a** consumer
**I want to** browse pharmacies by state
**So that** I can find independent pharmacies in my area

**Acceptance Criteria:**
- [ ] Homepage shows dropdown or map with all 50 states
- [ ] Clicking a state shows list of all pharmacies in that state
- [ ] Each pharmacy card shows: name, city, "Independent" badge (if verified), phone, website link
- [ ] State page has count: "142 independent pharmacies in Colorado"
- [ ] State page is SEO-optimized with title: "Independent Pharmacies in [State]"

**Technical Notes:**
- Use Astro's getStaticPaths for state pages: `/[state]/index.astro`
- Query: `SELECT * FROM pharmacy_locations WHERE state = $1 ORDER BY city, business_name`
- Supabase pagination (1000 row limit) if state has >1000 pharmacies

---

### Story 2: Search by City
**As a** consumer
**I want to** search for pharmacies in my city
**So that** I can find nearby options quickly

**Acceptance Criteria:**
- [ ] Search bar on homepage: "City, State" or ZIP code
- [ ] Search returns all pharmacies in that city
- [ ] Results show distance from ZIP code centroid (if ZIP entered)
- [ ] "No results" message suggests nearby cities if none found
- [ ] Each result links to pharmacy detail page

**Technical Notes:**
- Client-side search (no backend needed for MVP)
- Use browser geolocation API (optional) to pre-fill user's location
- For distance calculation: use Haversine formula or Mapbox Geocoding API

---

### Story 3: View Pharmacy Details
**As a** consumer
**I want to** see detailed information about a pharmacy
**So that** I can decide if it meets my needs

**Acceptance Criteria:**
- [ ] Detail page shows: name, address, phone, website, hours, services
- [ ] Shows "Independent" badge with explanation tooltip
- [ ] Shows ownership type: "Locally Owned" / "Small Chain (3 locations)" / etc.
- [ ] If `chain_affiliation` is NULL, shows "No corporate affiliation"
- [ ] Map showing location (Mapbox or Google Maps embed)
- [ ] "Get Directions" link (opens Google Maps)
- [ ] Schema.org LocalBusiness markup for SEO

**Technical Notes:**
- Dynamic route: `/[state]/[city]/[slug].astro`
- Generate pages at build time (getStaticPaths) for all pharmacies
- Include OpenGraph tags for social sharing

---

### Story 4: Filter by Services
**As a** consumer
**I want to** filter pharmacies by services they offer
**So that** I can find one that meets my specific needs (e.g., compounding, 24-hour, delivery)

**Acceptance Criteria:**
- [ ] Filter sidebar with checkboxes: Compounding, 24-Hour, Delivery, Immunizations, DME
- [ ] Checking a box filters results in real-time (client-side)
- [ ] Multiple filters use AND logic (must have ALL checked services)
- [ ] Filter state persists in URL query params (`?services=compounding,delivery`)
- [ ] Shows count: "23 pharmacies match your filters"

**Technical Notes:**
- Use Svelte/Alpine.js for client-side filtering (Astro island)
- Query pharmacies with services array: `services_offered @> ARRAY['compounding', 'delivery']`

---

### Story 5: Pharmacy Submission Form
**As an** independent pharmacy owner
**I want to** submit my pharmacy for listing
**So that** I can be discovered by customers seeking independent pharmacies

**Acceptance Criteria:**
- [ ] Form on `/submit` page with fields: business name, address, city, state, ZIP, phone, website, email
- [ ] Ownership verification: "Are you independently owned?" (Yes/No)
- [ ] If No: "What chain/franchise are you part of?" (text field)
- [ ] Services checkboxes: Compounding, 24-Hour, Delivery, Immunizations, DME, Other (text field)
- [ ] Corporate health plans question: "Which corporate health plans do you accept?" (optional)
- [ ] Submits to Web3Forms (email notification) + Supabase `pharmacy_submissions` table
- [ ] Success message: "Thank you! We'll review your submission within 3 business days."
- [ ] Email to pharmacy with verification link (future: auto-verify via email click)

**Technical Notes:**
- Use Web3Forms API for email notifications
- Store in `pharmacy_submissions` table with `status = 'pending'`
- Manual review workflow in Directory Factory (Submissions page)

---

### Story 6: Educational Landing Page
**As a** consumer
**I want to** understand why I should choose an independent pharmacy
**So that** I can make an informed decision

**Acceptance Criteria:**
- [ ] `/why-independent` page with sections:
  - "The Problem: Pharmacy-Insurance Conflicts of Interest"
  - "What Makes a Pharmacy Independent?"
  - "Benefits of Independent Pharmacies" (personal service, local ownership, community focus)
  - "What to Ask When Choosing a Pharmacy"
- [ ] Include statistics (with citations):
  - "CVS owns Aetna insurance and 9,900+ pharmacies"
  - "Independent pharmacies make up 34% of all US pharmacies but are declining"
- [ ] CTA: "Find an Independent Pharmacy Near You" (links to search)
- [ ] Schema.org Article markup

**Technical Notes:**
- Static markdown content (`src/content/pages/why-independent.md`)
- Research citations from:
  - NCPA (National Community Pharmacists Association)
  - FTC filings on CVS-Aetna merger
  - Academic studies on pharmacy vertical integration

---

### Story 7: Admin Review Workflow (Directory Factory)
**As a** site admin
**I want to** review and approve pharmacy submissions
**So that** I can verify listings before publishing

**Acceptance Criteria:**
- [ ] Directory Factory `/submissions` page shows pending pharmacy submissions
- [ ] Each submission card shows: business name, city, state, ownership type, contact email
- [ ] "Approve" button:
  - Inserts into `pharmacy_locations` table
  - Sets `ownership_verified = false` (requires manual verification)
  - Sends email to pharmacy: "Your listing is live! Click here to verify ownership."
- [ ] "Reject" button with reason (sends email to pharmacy)
- [ ] Bulk actions: "Approve All" / "Reject All"

**Technical Notes:**
- Reuse existing Directory Factory Submissions page
- Add site_type = 'pharmacy' to Sites table
- Email template: pharmacy-listing-approved.txt

---

## Viability Analysis

### ✅ **Strengths**

1. **Timely Market Opportunity**
   - CVS-Aetna merger concerns growing
   - Consumer distrust of corporate healthcare
   - "Shop local" movement strong post-pandemic

2. **Clear Value Proposition**
   - Easy to explain: "Find pharmacies not owned by CVS/Walgreens"
   - Appeals to multiple demographics (health-conscious, seniors, local-first)

3. **Existing Data Sources**
   - NPI Registry (free bulk download)
   - State pharmacy boards (public data)
   - Outscraper for Google Maps data

4. **Multiple Revenue Streams**
   - Premium pharmacy listings ($29-49/month × 1000 pharmacies = $29-49k/month potential)
   - GoodRx affiliate (earn commission on price comparisons)
   - Display ads (AdSense → Mediavine at scale)
   - Pharmacy association partnerships (NCPA sponsorship/ads)

5. **SEO Potential**
   - Low-competition long-tail keywords: "independent pharmacy [city]"
   - Local search intent (high conversion)
   - 21,000+ pharmacy listing pages (indexable content)

### ⚠️ **Challenges**

1. **Ownership Verification is Hard**
   - No single source of truth for "independent" status
   - Requires manual research or pharmacy self-reporting
   - Secretary of State lookups tedious (50 states × different systems)
   - **MITIGATION:** Start with name-based filtering (exclude known chains), add manual verification over time, crowdsource corrections

2. **Corporate Health Plan Data Unavailable**
   - Pharmacies don't publicly list which PBMs they accept
   - Contracts change frequently
   - **MITIGATION:** Make this optional/self-reported, label as "Pharmacy Reported" data, focus on ownership first

3. **Price Comparison Requires Partnerships**
   - Can't scrape pharmacy prices (blocked, terms of service)
   - Would need API access or pharmacy partnerships
   - **MITIGATION:** Skip price comparison in MVP, link to GoodRx (affiliate), add in Phase 2 if traction

4. **Scale Challenge**
   - 21,000+ independent pharmacies nationwide
   - Manual verification doesn't scale
   - **MITIGATION:** Automate where possible (NPI data, name matching), prioritize high-traffic cities, use pharmacy submissions to offload verification

5. **Competition from Established Directories**
   - Google Maps already has all pharmacies
   - Healthgrades, Zocdoc for healthcare providers
   - GoodRx for price comparison
   - **MITIGATION:** Differentiate on "independence verification" - no one else doing this, niche appeal

### 💰 **Revenue Potential (12-Month Projection)**

**Assumptions:**
- Launch with 5,000 pharmacies (focus on top 100 cities)
- SEO ramp: 1k visitors/month (M1) → 10k/month (M6) → 25k/month (M12)
- Conversion: 2% of pharmacies pay for premium listing

| Revenue Stream | Month 1 | Month 6 | Month 12 | Notes |
|---------------|---------|---------|----------|-------|
| Premium Listings | $0 | $300 | $1,000 | 100 pharmacies × $29/mo (2% conversion) |
| GoodRx Affiliate | $0 | $50 | $200 | 5% of visitors click, 2% convert |
| Display Ads | $0 | $100 | $300 | Mediavine at 10k+ sessions |
| **TOTAL** | **$0** | **$450** | **$1,500** | |

**Cost to Build:**
- Developer time: 40 hours × $0 (your time)
- Hosting: $0 (Cloudflare Pages free tier)
- Database: $0 (Supabase free tier)
- Data sourcing: $50 (Outscraper for top cities)
- Domain: $12/year
- **Total: $62**

**ROI:** If hits $1,500/month by M12 = $18,000/year revenue on $62 investment = 290x ROI

### 🎯 **Go/No-Go Recommendation**

**RECOMMENDATION: GO (with scoped MVP)**

**Rationale:**
- Low cost, high potential upside
- Timely market opportunity (pharmacy-insurance conflicts in news)
- Clear differentiation vs existing directories
- Multiple proven revenue streams (premium listings work for other directories)
- Ownership verification challenge is real but solvable incrementally

**MVP Scope (De-Risk):**
- Start with top 20 metro areas (not all 50 states)
- Focus on ownership verification (not corporate health plan data)
- Skip price comparison (link to GoodRx instead)
- Use name-based chain filtering + manual review
- Launch in 4 weeks, validate traffic/interest before scaling

**Success Metrics (6 months):**
- 5,000 pharmacy listings
- 5,000 monthly organic visitors
- 10+ premium listing customers
- $500/month revenue

If these hit, scale to all 50 states. If not, pivot or sunset.

---

## Data Acquisition Plan

### Phase 1: Foundation (Week 1)

**Step 1: Download NPI Registry**
- Source: https://download.cms.gov/nppes/NPI_Files.html
- File: NPPES Data Dissemination (monthly CSV, ~7GB)
- Filter for: Taxonomy Code = `3336C0003X` (Community/Retail Pharmacy)
- Extract: NPI, Business Name, Address, City, State, ZIP, Phone
- Expected: ~65,000 pharmacies (includes chains + independents)

**Step 2: Filter Out Known Chains**
- Create exclusion list (regex patterns):
  - CVS, Walgreens, Rite Aid, Walmart, Kroger, Safeway, Albertsons, Target, Costco, Sam's Club
  - Check business name: `WHERE business_name NOT ILIKE '%CVS%' AND ...`
- Expected remaining: ~21,000 independent pharmacies

**Step 3: Geocode Addresses**
- Use free geocoding API (Nominatim or Google Geocoding)
- Add lat/long for map functionality
- Batch process: 100 addresses/min (rate limit)
- Cost: $0 (Nominatim) or $200 (Google at $5/1000 addresses)

### Phase 2: Enrichment (Week 2)

**Step 1: Scrape Google Maps Data**
- Use Outscraper to enrich top 1000 pharmacies
- Get: website, hours, phone (verified), photo
- Cost: ~$2 (1000 × $0.002)

**Step 2: Email/Phone Scraping**
- Use Directory Factory's enrichment tools
- Scrape websites for contact info
- Validate emails (Hunter.io or RapidEmailVerifier)

**Step 3: Manual Verification (Sample)**
- Manually verify 100 pharmacies (different states)
- Check Secretary of State for ownership
- Call pharmacy: "Are you independently owned or part of a chain?"
- Measure accuracy of NPI filter

### Phase 3: Ongoing Submissions

**Pharmacy Outreach:**
- Email campaign to enriched pharmacies:
  - "Your pharmacy is listed on IndependentPharmacyFinder.com"
  - "Verify your listing and add details (free)"
  - "Upgrade to premium for homepage placement ($29/mo)"
- Expected: 10% open rate, 2% click, 0.5% upgrade = 5 premium customers from 1000 emails

**Community Contributions:**
- Add "Is this listing accurate?" link on each pharmacy page
- Let users suggest corrections
- Flag pharmacies for re-verification

---

## Domain Ideas

**Primary Candidates:**
- IndependentPharmacies.com (check availability)
- LocalPharmacyFinder.com
- TruePharmacy.com
- MyLocalPharmacy.com

**Backup Options:**
- IndependentRx.com
- PharmacyFinder.com
- LocalRxFinder.com
- NonChainPharmacy.com

**Check Availability:** Use `/research/domains` tool in Directory Factory

---

## Marketing Strategy

### SEO (Primary Channel)

**Target Keywords:**
- "independent pharmacy [city]"
- "local pharmacy [city]"
- "non-chain pharmacy near me"
- "pharmacy not owned by CVS"
- "compounding pharmacy [city]" (high-intent niche)

**Content Strategy:**
- State pages: "Independent Pharmacies in [State]" (50 pages)
- City pages: "Independent Pharmacies in [City], [State]" (top 200 cities)
- Service pages: "Compounding Pharmacies in [State]" (specialty niches)
- Educational: "Why Choose an Independent Pharmacy?" (link magnet)

### Partnerships

**National Community Pharmacists Association (NCPA):**
- Reach out for partnership/sponsorship
- Get listed in their "Find a Pharmacy" tool
- Cross-promotion to 19,000+ independent pharmacy members

**State Pharmacy Associations:**
- 50 state associations (e.g., California Pharmacists Association)
- Offer free listings to their members
- Ask for link from their website

### Social Proof

**Reddit:**
- r/pharmacy (150k members) - "I made a tool to find independent pharmacies"
- r/healthcare, r/insurance, r/personalfinance
- Focus on CVS-Aetna conflict angle

**Twitter/X:**
- Healthcare journalists covering pharmacy consolidation
- Consumer advocacy groups
- Reply to threads about pharmacy frustrations

### Press Outreach

**Angle:** "New Tool Helps Consumers Avoid Pharmacy-Insurance Conflicts"

**Pitch to:**
- Healthcare policy reporters (KHN, STAT News, Modern Healthcare)
- Consumer advocacy publications (Consumer Reports)
- Local news (tie to city launch: "New tool lists 47 independent pharmacies in Denver")

---

## Next Steps (If Go Decision)

### Week 1: Data & Setup
- [ ] Check domain availability (use /research/domains)
- [ ] Download NPI Registry CSV
- [ ] Filter for independent pharmacies (exclude chains)
- [ ] Set up Supabase database (pharmacy_locations table)
- [ ] Import initial 5,000 pharmacies (top 20 metros)

### Week 2: Site Build
- [ ] Clone site-directory-factory template
- [ ] Customize branding (colors, logo, copy)
- [ ] Build state/city pages (Astro getStaticPaths)
- [ ] Build pharmacy detail pages
- [ ] Add search/filter UI
- [ ] Add submission form

### Week 3: Content & SEO
- [ ] Write "Why Independent?" page
- [ ] Add schema.org markup (LocalBusiness)
- [ ] Generate sitemap
- [ ] Set up Google Search Console
- [ ] Create OG images for social sharing

### Week 4: Launch & Promote
- [ ] Deploy to Cloudflare Pages
- [ ] Submit to Google/Bing
- [ ] Post to Reddit (r/pharmacy)
- [ ] Email NCPA for partnership
- [ ] Reach out to 10 state pharmacy associations
- [ ] Monitor analytics and submissions

---

## Open Questions

1. **Domain Selection:** Which domain should we register? (Check availability first)
2. **Initial Geography:** Start with top 20 metros or go national from day 1?
3. **Ownership Verification:** Manual review all listings, or trust NPI filter + allow corrections?
4. **Corporate Health Plan Data:** Skip entirely for MVP, or add as optional self-reported field?
5. **Price Comparison:** Link to GoodRx (affiliate), or build our own limited tool?
6. **Pharmacy Outreach:** Verify listings first, or let pharmacies opt-in via submission form?

---

## Appendix: Research Links

**Data Sources:**
- NPI Registry: https://download.cms.gov/nppes/NPI_Files.html
- NCPA (Independent Pharmacy Association): https://ncpa.org
- State Pharmacy Boards: https://nabp.pharmacy/boards-of-pharmacy/

**Market Research:**
- CVS-Aetna Merger: https://www.ftc.gov/news-events/news/press-releases/2018/10/ftc-requires-CVS-health-divest-aetna-medicare-part-d-prescription-drug-plan-businesses-29-states
- Independent Pharmacy Statistics: https://ncpa.org/newsroom/news-releases (21,683 independent pharmacies as of 2023)

**Competitors:**
- Google Maps (all pharmacies, no independence filter)
- GoodRx (price comparison, no ownership data)
- Healthgrades (doctors, not pharmacies)

---

**Total Estimated Time to MVP:** 4 weeks (160 hours)

**Build Complexity:** Medium (data sourcing hardest part, site build is standard directory)

**Revenue Potential:** $500-1,500/month within 12 months

**Viability Grade:** **B+** (Go ahead with scoped MVP, high upside if executed well)
