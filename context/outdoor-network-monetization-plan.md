# Outdoor Network Cross-Promotion & Monetization Plan

> **Created:** Feb 7, 2026
> **Sites:** campingnative.com, bestwaterfalls.com, bestusnationalparks.com
> **Status:** Plan approved, waiting on Brian's accounts/IDs

---

## Architecture Summary

| Site | Rendering | DB | Head Pattern | Ad Component | Monetization Config |
|------|-----------|-----|-------------|-------------|-------------------|
| campingnative.com | Static | Supabase | Inline in BaseLayout | None | None |
| bestwaterfalls.com | SSR/Cloudflare | D1 | SEOHead.astro | AdSlot.astro (ready) | `monetization` obj in site-config (empty) |
| bestusnationalparks.com | SSR/Cloudflare | D1 | SEOHead.astro | None | None |

---

## Phase 1: Analytics Foundation (Do First)

**Why first:** You need baseline traffic data before changing anything. GA4 + Search Console tell you which pages actually get traffic, so you can prioritize ad/affiliate placement.

### 1A. Add GA4 to all three sites

**Brian provides:** Three GA4 measurement IDs (one per property, e.g. `G-XXXXXXXXXX`)

#### bestwaterfalls.com
**File:** `site-waterfall-directory/src/data/site-config.json`
- Add `"ga4Id": "G-XXXXXXXXXX"` inside the existing `monetization` object

**File:** `site-waterfall-directory/src/components/SEOHead.astro`
- After the closing `</title>` block, add the GA4 gtag.js snippet
- Conditionally render only when `siteConfig.monetization.ga4Id` is truthy
- Use `is:inline` on the script tag (Astro requirement for third-party scripts)
- Place the `<link rel="preconnect" href="https://www.googletagmanager.com">` with existing preconnects

#### bestusnationalparks.com
**File:** `site-nationalparks-directory/src/data/site-config.json`
- Add new `"monetization"` object: `{ "ga4Id": "G-XXXXXXXXXX", "adsenseId": "", "amazonTag": "" }`

**File:** `site-nationalparks-directory/src/components/SEOHead.astro`
- Same GA4 snippet pattern as waterfalls (import site-config, conditional render)

#### campingnative.com
**File:** `site-camping-native/src/data/site-config.json`
- Add new `"monetization"` object: `{ "ga4Id": "G-XXXXXXXXXX", "adsenseId": "", "amazonTag": "" }`

**File:** `site-camping-native/src/layouts/BaseLayout.astro`
- Add GA4 snippet directly in the `<head>` section (this site has no SEOHead component)
- Place after the `<meta name="theme-color">` tag, before `</head>`
- Same conditional logic: only render when config value is truthy

### 1B. Search Console verification

All three sites already have `<link rel="canonical">` and sitemaps. Steps:
1. Add each domain in Search Console (Brian already has account)
2. Use the "URL prefix" method with `https://` for each domain
3. Verify via HTML meta tag in same head locations as GA4
4. Submit sitemap URLs:
   - campingnative.com/sitemap-index.xml
   - bestwaterfalls.com/sitemap-index.xml
   - bestusnationalparks.com/sitemap-index.xml

### Phase 1 Verification
- Deploy all three sites
- Visit each site, open DevTools > Network tab, confirm `gtag/js` request fires
- Check GA4 Realtime report shows your visit
- Confirm Search Console shows "verified" for all three properties

---

## Phase 2: Cross-Promotion (Free Traffic)

Three tiers of cross-linking, from least to most invasive:
1. **Footer network badge** -- every page, every site
2. **Contextual inline links** -- only on relevant content pages
3. **"Related from our network" cards** -- on high-traffic page types

### 2A. Footer Network Section (all three sites)

Add a small "Our Outdoor Network" section above the copyright bar in each footer. Consistent across all three sites, linking to the other two.

#### campingnative.com
**File:** `site-camping-native/src/components/Footer.astro`
- Add a new `<div>` between the main footer grid and the `<!-- Bottom Bar -->` section
- Content: "Explore Our Outdoor Network" heading, two links:
  - "Best Waterfalls" -> bestwaterfalls.com (with brief tagline)
  - "National Parks Guide" -> bestusnationalparks.com (with brief tagline)
- Style: subtle, `text-forest-400` color, small text, horizontal layout on desktop

#### bestwaterfalls.com
**File:** `site-waterfall-directory/src/components/Footer.astro`
- Same pattern, positioned above the copyright/bottom bar
- Links to campingnative.com and bestusnationalparks.com

#### bestusnationalparks.com
**File:** `site-nationalparks-directory/src/components/Footer.astro`
- Same pattern, positioned above the copyright
- Links to campingnative.com and bestwaterfalls.com
- Note: this footer already has an affiliate disclosure link -- keep that, add network section above it

### 2B. Contextual Cross-Links (content pages only)

#### bestusnationalparks.com -> bestwaterfalls.com
**File:** `site-nationalparks-directory/src/pages/parks/[slug].astro`
- On parks that have waterfalls in their activities/features, add a callout: "This park has waterfalls. See detailed waterfall guides on Best Waterfalls ->"
- Place after the "Things to Do" section

#### bestwaterfalls.com -> bestusnationalparks.com
**File:** `site-waterfall-directory/src/pages/[state]/waterfall/[waterfall].astro`
- For waterfalls near national parks, add a callout in the sidebar after "Get Directions"

#### bestwaterfalls.com -> campingnative.com
**File:** `site-waterfall-directory/src/pages/guides/camping-near-waterfalls.astro`
- Link to campingnative.com's gear section: "Need camping gear? See our complete gear guide at Camping Native ->"

#### campingnative.com -> both sites
**File:** `site-camping-native/src/pages/blog/[slug].astro`
- In the "Related Posts" section, add a "Related from our network" row with static links

### 2C. Cross-Link Component

Create `src/components/NetworkLink.astro` in each site:
- Props: `site`, `text`, `context`
- Renders styled anchor with `rel="noopener"` and `target="_blank"`
- No `rel="nofollow"` -- own sites, want link equity to flow

### Phase 2 Verification
- Visit each footer -- confirm two external links appear
- Click each cross-link -- confirm no 404s
- Check GA4 after 2 weeks for cross-domain referral traffic

---

## Phase 3: AdSense

**Brian provides:** AdSense publisher ID (format: `ca-pub-XXXXXXXXXX`)

### 3A. AdSense Auto-Ads Script (all three sites)

Add AdSense script to `<head>` of each site, conditional on config value.

- **bestwaterfalls.com:** `SEOHead.astro` + set `monetization.adsenseId` in site-config
- **bestusnationalparks.com:** `SEOHead.astro` + add `monetization.adsenseId` to site-config
- **campingnative.com:** `BaseLayout.astro` + add `monetization.adsenseId` to site-config

### 3B. Manual Ad Placements

#### bestwaterfalls.com (AdSlot.astro already exists)
Update `AdSlot.astro` to render real AdSense units instead of gray placeholders.

| Page | Ad Slots | Where |
|------|----------|-------|
| Waterfall detail | 1 inline + 1 sidebar | Inline after trail info. Sidebar below weather. |
| State listing | 1 inline | Between waterfall cards (after every 6) |
| Guide pages | 1 inline | After 2nd major heading |
| Homepage | None | Keep clean |

#### bestusnationalparks.com (new AdSlot component needed)
**New file:** `src/components/AdSlot.astro`

| Page | Ad Slots | Where |
|------|----------|-------|
| Park detail | 1 sidebar + 1 inline | Sidebar below events. Inline after "Things to Do". |
| Gear page | 1 inline | Between categories (after category 3) |
| Guide pages | 1 inline | Mid-content |
| Homepage | None | Keep clean |

#### campingnative.com (new AdSlot component needed)
**New file:** `src/components/AdSlot.astro`

| Page | Ad Slots | Where |
|------|----------|-------|
| Blog post | 1 inline | After first 3 paragraphs |
| Gear category | 1 inline | Between product cards (after every 4) |
| Homepage | None | Keep clean |

### 3C. Mobile Rules
- All ads use responsive format (`data-ad-format="auto"`, `data-full-width-responsive="true"`)
- Sidebar ads only render on desktop (handled by existing breakpoints)
- Maximum 3 ad units per page

### Phase 3 Verification
- Visit each site on desktop + mobile
- Confirm ads render (may take 24-48 hours for new sites)
- Mobile test: no horizontal scroll, no layout shift

---

## Phase 4: Affiliate Links (Amazon Associates)

**Brian provides:** Amazon Associates tag (e.g. `jbmangum27-20`)

### 4B. National Parks Gear Page (Highest Priority -- 36 products, zero links)

**File:** `site-nationalparks-directory/src/pages/gear.astro`

For each of 36 products:
- Add Amazon search URL: `https://www.amazon.com/s?k=PRODUCT+NAME&tag=yourtag-20`
- Format: "Check Price on Amazon ->" button below each product
- Style: small, muted button
- Add `rel="nofollow sponsored"` and `target="_blank"`

**Also update:** Affiliate disclosure text at bottom of gear.astro -- change from "we do not currently have affiliate partnerships" to present tense.

**File:** `site-nationalparks-directory/src/pages/affiliate-disclosure.astro`
- Update Amazon Associates from future tense to present tense

### 4C. Camping Native Gear Posts (80 posts via Supabase)

**New file:** `site-camping-native/src/lib/affiliate.ts`
- Export: `getAmazonLink(productName: string, tag: string): string`
- Generates: `https://www.amazon.com/s?k=${encodeURIComponent(productName)}&tag=${tag}`

**File:** `site-camping-native/src/pages/blog/[slug].astro`
- For `post_type === 'gear_review'` posts, render "Check Price on Amazon ->" button

**File:** `site-camping-native/src/components/ProductCard.astro`
- Add "View on Amazon ->" link at bottom of each card

**New file:** `site-camping-native/src/pages/affiliate-disclosure.astro`
**File:** `site-camping-native/src/components/Footer.astro` -- add disclosure link

### 4D. Waterfalls Site (Lower Priority -- no gear content)

Manual affiliate links in relevant guide pages:
- `guides/camping-near-waterfalls.astro` -- tent/sleeping bag links
- `guides/waterfall-photography-tips.astro` -- camera/tripod links
- `guides/planning-your-trip.astro` -- hiking boots/backpack links

**New file:** `site-waterfall-directory/src/pages/affiliate-disclosure.astro`
**File:** `site-waterfall-directory/src/components/Footer.astro` -- add disclosure link

### Phase 4 Verification
- Click every affiliate link -- confirm Amazon opens with correct tag
- Use Amazon Associates link checker to verify tag tracking
- Confirm `rel="nofollow sponsored"` on all affiliate links
- Confirm disclosure page linked from footer

---

## Implementation Order

| Phase | What | Sites | Files Changed |
|-------|------|-------|---------------|
| **1A** | GA4 scripts | All 3 | 6 files (3 configs + 3 head templates) |
| **1B** | Search Console | All 3 | Same 3 head templates |
| **2A** | Footer cross-links | All 3 | 3 Footer.astro files |
| **2B** | Contextual cross-links | All 3 | ~5-6 content page files |
| **3A** | AdSense head script | All 3 | Same 3 head templates from Phase 1 |
| **3B** | Ad placements | All 3 | 2 new AdSlot components + ~8 page files |
| **4B** | NatParks affiliate links | Parks | 2 files (gear.astro + disclosure) |
| **4C** | CampingNative affiliates | Camping | 4 files |
| **4D** | Waterfalls affiliates | Waterfalls | 3-4 guide files + new disclosure page |

**Total files touched:** ~30 files across 3 projects
**New files created:** 5 (2 AdSlot components, 2 affiliate disclosure pages, 1 affiliate helper)

---

## Brian's Action Items (before Claude can implement)

- [ ] Create 3 GA4 properties (one per site) and get measurement IDs
- [ ] Add all 3 sites to Google Search Console and get verification codes
- [ ] Get AdSense publisher ID (one shared across all sites)
- [ ] Confirm Amazon Associates tag to use
- [ ] Submit sitemaps in Search Console after verification

---

#monetization #outdoor-network #plan
