# Independent Pharmacy Directory - Claude Code Context

## Project Overview

**Mission:** Help consumers find independent pharmacies not owned by CVS, Walgreens, or corporate chains that have conflicts of interest through insurance company ownership.

**Tech Stack:**
- **Framework:** Astro 4.x (hybrid SSR + static)
- **Database:** Cloudflare D1 (SQLite)
- **Styling:** Tailwind CSS
- **Hosting:** Cloudflare Pages
- **Forms:** Cloudflare Pages Functions

**Domain:** TBD (check availability in Directory Factory)

---

## Database (D1 - SQLite)

### Key Differences from PostgreSQL

| PostgreSQL | SQLite (D1) | Notes |
|------------|-------------|-------|
| `UUID PRIMARY KEY` | `INTEGER PRIMARY KEY AUTOINCREMENT` | SQLite auto-increment |
| `VARCHAR(n)` | `TEXT` | SQLite only has TEXT |
| `TEXT[]` (arrays) | `TEXT` (JSON string) | Store as JSON, parse in app |
| `JSONB` | `TEXT` | Store JSON as string |
| `BOOLEAN` | `INTEGER` (0/1) | SQLite has no boolean type |
| `TIMESTAMPTZ` | `TEXT` (ISO 8601) | Store as datetime string |

### Tables

**Main Tables:**
- `pharmacies` - Main pharmacy listings
- `pharmacy_submissions` - User-submitted pharmacies (pending review)
- `contact_messages` - Contact form submissions
- `states` - US states reference (for state pages)

**Schema Location:** `migrations/0001_init_schema.sql`

### D1 Commands

```bash
# Create database
npm run db:create

# Apply migrations locally
npm run db:migrate:local

# Apply migrations to production
npm run db:migrate:remote

# Query local DB
npx wrangler d1 execute pharmacy-db --local --command "SELECT * FROM pharmacies LIMIT 10"

# Query remote DB
npx wrangler d1 execute pharmacy-db --remote --command "SELECT * FROM pharmacies LIMIT 10"
```

---

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Run dev server (with D1 local binding)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Important:** Always test D1 queries locally before deploying to production.

### Accessing D1 in Pages Functions

```typescript
// functions/api/pharmacies.ts
export const onRequest: PagesFunction<Env> = async (context) => {
  const db = context.env.DB; // D1 binding

  const result = await db
    .prepare('SELECT * FROM pharmacies WHERE state = ?')
    .bind('CO')
    .all();

  return new Response(JSON.stringify(result.results), {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### Accessing D1 in Astro Pages

```astro
---
// src/pages/state/[state].astro
export const prerender = false; // Must be server-rendered to access D1

const runtime = Astro.locals.runtime as { env: Env };
const db = runtime.env.DB;

const { state } = Astro.params;

const result = await db
  .prepare('SELECT * FROM pharmacies WHERE state = ? ORDER BY city, business_name')
  .bind(state.toUpperCase())
  .all();

const pharmacies = result.results;
---
```

---

## Data Sourcing Strategy

### Phase 1: Foundation Data (NPI Registry)

1. Download NPI Registry bulk file (CSV): https://download.cms.gov/nppes/NPI_Files.html
2. Filter for taxonomy code `3336C0003X` (Community/Retail Pharmacy)
3. Exclude known chains by name matching (CVS, Walgreens, Rite Aid, etc.)
4. Import to D1 database

**Expected:** ~21,000 independent pharmacies after filtering

### Phase 2: Enrichment

1. **Geocoding:** Use free API (Nominatim) to add lat/long for addresses
2. **Website/Phone:** Scrape Google Maps data via Outscraper ($0.002/record)
3. **Email Validation:** Use Hunter.io or RapidEmailVerifier
4. **Manual Verification:** Sample 100 pharmacies, verify ownership via Secretary of State

### Phase 3: Community Submissions

1. Launch submission form (`/submit`)
2. Email outreach to pharmacies: "Your pharmacy is listed, please verify/enhance"
3. User-contributed corrections via "Report Incorrect Listing" links

---

## URL Structure

| Page | URL Pattern | Example |
|------|-------------|---------|
| Homepage | `/` | - |
| Browse States | `/browse` | - |
| State Listings | `/state/[state]` | `/state/co` |
| City Listings | `/state/[state]/[city]` | `/state/co/denver` |
| Pharmacy Detail | `/state/[state]/[slug]` | `/state/co/smiths-family-pharmacy` |
| Submit Form | `/submit` | - |
| Why Independent | `/why-independent` | - |
| Search Results | `/search?q=denver` | - |

---

## SEO Strategy

### Target Keywords

- "independent pharmacy [city]"
- "local pharmacy [city]"
- "pharmacy not owned by CVS [city]"
- "compounding pharmacy [state]" (high-intent specialty)
- "24 hour pharmacy [city]"

### Schema Markup

All pharmacy detail pages include:
- `LocalBusiness` schema
- `Pharmacy` schema (subtype of LocalBusiness)
- Structured data for address, phone, hours

### Content Plan

- State pages: "Independent Pharmacies in [State]" (50 pages)
- City pages: "Independent Pharmacies in [City], [State]" (top 100 cities)
- Service pages: "Compounding Pharmacies in [State]" (specialty filter)
- Educational: "Why Choose an Independent Pharmacy?" (link magnet)

---

## Deployment

### Cloudflare Pages Setup

1. Connect GitHub repo to Cloudflare Pages
2. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
3. Environment variables: (none needed for MVP - all public data)
4. D1 binding: Add `DB` binding in Pages settings → Functions → Bindings

### DNS Configuration

Once domain is registered:
1. Add domain in Cloudflare Pages
2. Point DNS records (A/CNAME) to Cloudflare Pages

### Post-Deploy Checklist

- [ ] Apply D1 migrations to remote: `npm run db:migrate:remote`
- [ ] Import initial pharmacy data
- [ ] Test submission form
- [ ] Submit sitemap to Google Search Console
- [ ] Verify schema markup with Google Rich Results Test

---

## Monetization Plan

### Phase 1: Free Listings (MVP)

- All pharmacies listed for free
- No premium tiers yet
- Focus on traffic and validation

### Phase 2: Premium Listings (Month 3)

- **Basic:** Free (name, address, phone, basic info)
- **Featured:** $29/month (badge, homepage placement, enhanced listing)
- **Premium:** $49/month (all features + photo, hours, services, description)

**Revenue Target:** 50 premium customers = $1,450-2,450/month

### Phase 3: Affiliate Revenue

- **GoodRx Affiliate:** Link to price comparison (earn commission on prescriptions filled)
- **Pharmacy Association Sponsorships:** NCPA ads/partnerships
- **Display Ads:** AdSense → Mediavine at 50k sessions/month

---

## Key Decisions

### Why D1 instead of Supabase?

1. **All-in on Cloudflare:** Simpler deployment, fewer services to manage
2. **No auth needed:** All data is public, no need for RLS (Row-Level Security)
3. **Easier local dev:** Wrangler handles local DB, no Docker required
4. **Cost:** D1 free tier is generous (5GB + 5M reads/day)

**Trade-off:** No real-time subscriptions, but we don't need that for a directory.

### MVP Scope: Top 20 Metros, Not National

**Why:** Validate market before scaling
- Easier to manually verify ownership
- Faster to launch
- Less data to import
- Can still rank for "[city] independent pharmacy" keywords

**Target Cities:**
- New York, Los Angeles, Chicago, Houston, Phoenix
- Philadelphia, San Antonio, San Diego, Dallas, San Jose
- Austin, Jacksonville, Fort Worth, Columbus, Charlotte
- San Francisco, Indianapolis, Seattle, Denver, Washington DC

**Expansion:** If MVP hits traffic/revenue goals, expand to all 50 states.

---

## Open Questions

1. **Domain Name:** Which domain to register?
   - IndependentPharmacies.com (check availability)
   - LocalPharmacyFinder.com
   - TruePharmacy.com
   - IndependentRx.com (current mockup uses this)

2. **Corporate Health Plan Data:** Skip for MVP or add as self-reported field?
   - **Decision:** Skip for MVP (too hard to verify)
   - **Future:** Add as optional self-reported field with "Pharmacy Reported" label

3. **Price Comparison:** Build our own or link to GoodRx?
   - **Decision:** Link to GoodRx (affiliate) for MVP
   - **Future:** Explore pharmacy partnerships for price data

---

## Next Steps

- [ ] Check domain availability (use Directory Factory `/research/domains`)
- [ ] Create D1 database: `npm run db:create`
- [ ] Apply migrations: `npm run db:migrate:local`
- [ ] Download NPI Registry data
- [ ] Process and import top 1,000 pharmacies (20 metros)
- [ ] Deploy to Cloudflare Pages
- [ ] Submit to Google Search Console

---

## Reference Links

**Data Sources:**
- NPI Registry: https://download.cms.gov/nppes/NPI_Files.html
- NCPA (Independent Pharmacy Assoc): https://ncpa.org
- State Pharmacy Boards: https://nabp.pharmacy/boards-of-pharmacy/

**Tools:**
- Cloudflare D1 Docs: https://developers.cloudflare.com/d1/
- Astro Cloudflare Adapter: https://docs.astro.build/en/guides/integrations-guide/cloudflare/

---

*Last updated: January 29, 2026*
