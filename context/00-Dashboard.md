# Dashboard

> [!info] Last updated: Feb 7, 2026 (evening)
> **Revenue:** $0/mo | **Costs:** ~$6/mo (Kalshi killed) | **Deployed products:** 10 | **Marketing campaigns running:** 0

---

## Focus Projects (Feb 2026)

### 1. LoveNotes (sendmylove.app)
> [!danger] Valentine's Day is Feb 14 — 7 days away

#### V2 Pivot — Prompt-Based Message Builder (Feb 7)

> [!success] Major product rework shipped. 4,018 lines changed across 23 files.

**What changed:** Pivoted from pre-written message library to
personalized prompt-based message builder. Users now get daily
fill-in-the-blank prompts personalized to their relationship, with
optional AI polish.

**New features built:**
- 4-step relationship profile onboarding (wife's name, how you met,
  love language, inside jokes, etc.)
- Dashboard rewritten as fill-in-the-blank message builder
- "Help me say it better" AI polish (Anthropic API)
- 12 new v2 API endpoints (profile, prompts, compose, polish, logs,
  history, favorites)
- 90 prompt templates across 6 themes (romantic, funny, flirty,
  appreciative, encouraging, spicy)
- Updated cron: sends daily prompt emails instead of pre-written
  messages
- Free tier: 1 prompt/week | Paid: daily + AI polish + daily log
- Landing page rewritten with v2 positioning and interactive demo
- 5 new database tables + indexes + migration scripts

**Brian's deployment steps:**
1. Set Anthropic API key: `wrangler secret put ANTHROPIC_API_KEY --env production`
2. Deploy worker: `cd worker && wrangler deploy --env production`
3. Push frontend: `git push` (Cloudflare Pages auto-deploys)
4. Verify: visit sendmylove.app, test signup > onboarding > dashboard

**Still needs:**
- [ ] 210 more prompt templates (currently 90 of 300 target)
- [ ] Occasion-specific prompts (anniversary, birthday, V-Day,
  Mother's Day, Christmas)
- [ ] Stripe webhook to set `tier = 'paid'` on checkout completion

#### V-Day Marketing Sprint
- [x] Create social accounts (Twitter, TikTok, Instagram)
- [x] Post launch thread + promo video
- [x] Reddit posts in r/Marriage, r/AskMen with V-Day angle
- [x] Film 1 TikTok using "Not Good With Words" script
- [x] Product Hunt launch (Feb 12 or 13)
- [x] Daily urgency posts Feb 11-13

**Key files:**
- [[app-lovenotes/tasks/prd-sendmylove-v2-pivot|V2 Pivot PRD]] —
  full product requirements for prompt-based builder
- [[app-lovenotes/tasks/content-strategy-v2|V2 Content Strategy]] —
  prompt template plan, themes, and growth roadmap
- [[app-lovenotes/data/v2-deployment-checklist|V2 Deployment Checklist]] —
  step-by-step deploy instructions
- [[app-lovenotes/data/v2-migration|V2 Migration SQL]] —
  database migration scripts (5 new tables)
- [[app-lovenotes/tasks/marketing-plan-sendmylove|Marketing Plan (full)]]
- [[app-lovenotes/tasks/competitive-analysis|Competitive Analysis]] —
  deep dive on Paired, Lasting, Lovewick, DIY + 3 new competitors found
- [[app-lovenotes/tasks/competitor-pages-content|Competitor Comparison Pages]] —
  8 SEO pages ready to build (vs pages, alternative pages, hub)
- [[app-lovenotes/progress|Progress]]
- [[app-lovenotes/CLAUDE|Project CLAUDE.md]]

---

### 2. SCDMV Alerts (scdmvappointments.com)
> [!warning] Send press pitches after 3-day test passes (Feb 8)

- [x] Confirm 3-day monitoring test passed (Feb 8)
- [x] Post to r/southcarolina (launch post ready in marketing plan)
- [x] Post to r/greenville, r/Charleston, r/ColumbiYEAH
- [ ] Join 5 SC Facebook parent/community groups, engage for a few days
- [ ] Post in Facebook groups (after warmup)
- [ ] Send Wave 1 press emails — Columbia stations (WIS, WLTX, WACH, WOLO)
- [ ] Send Wave 2 press emails — Greenville stations (WYFF, WSPA, WHNS)
- [ ] Send Wave 3 press emails — Charleston + Myrtle Beach
- [ ] Send Wave 4 follow-ups (5-7 days after initial pitch)

**Email templates (open in browser, not Obsidian):**
- `site-scdmv-alerts/emails/press-pitch-consumer.html` — family/parent story angle for local TV
- `site-scdmv-alerts/emails/press-pitch-entrepreneur.html` — "dad solves own problem" founder story
- `site-scdmv-alerts/emails/press-followup.html` — short follow-up bump (send 5-7 days after pitch)

**Key files:**
- [[tasks/marketing-plan-scdmv-alerts|Marketing Plan]]
- [[site-scdmv-alerts/PRESS-KIT|Press Kit (16 TV station contacts)]]
- [[site-scdmv-alerts/LAUNCH-CHECKLIST|Launch Checklist]]
- [[site-scdmv-alerts/progress|Progress]]
- [[site-scdmv-alerts/CLAUDE|Project CLAUDE.md]]

---

### 3. RecordStops (recordstops.com)
> [!tip] Most mature product — continue momentum

- [x] Respond to podcast lead (Patrick Foster, Rockin' the Suburbs)
- [x] Continue daily/weekly social media posts
- [ ] Expand to new states (currently 5)
- [ ] Plan newsletter launch ("This Week in Vinyl")

**Key files:**
- [[site-recordstore-directory/marketing/LAUNCH-KIT|Launch Kit]]
- [[site-recordstore-directory/progress|Progress]]
- [[site-recordstore-directory/CLAUDE|Project CLAUDE.md]]

---

## Outdoor Network Monetization (campingnative + bestwaterfalls + bestusnationalparks)

> [!warning] Brian needs to provide AdSense account ID before Claude
> can implement ads.
> **Plan:** [[context/outdoor-network-monetization-plan|Full Implementation Plan]]

**Brian's action items (do these first):**
- [x] Create GA4 property for campingnative.com — `G-BP5876ZTQT`
  (implemented)
- [x] Create GA4 property for bestwaterfalls.com — `G-3NQJV7QML2`
  (implemented)
- [x] Create GA4 property for bestusnationalparks.com — `G-WG2965ESY2`
  (implemented)
- [x] Add all 3 sites to Google Search Console — get verification codes
- [ ] Sign up for AdSense at
  [adsense.google.com](https://adsense.google.com) — submit
  bestwaterfalls.com first (most traffic)
- [ ] After approval, add campingnative.com and bestusnationalparks.com
- [ ] Share publisher ID (`ca-pub-XXXXXXXXXX`) and ad unit slot IDs
  with Claude — see
  [[context/adsense-implementation-plan|Full AdSense Plan]]
- [x] Confirm Amazon Associates tag — `jbmangum27-20` (active across
  all 3 sites)
- [x] Submit sitemaps in Search Console for all 3 sites

**Implementation progress:**
1. ~~GA4 + Search Console tags (all 3 sites)~~ DONE
2. ~~Cross-promotion footer links (free traffic, all 3 sites)~~ DONE
3. ~~Affiliate links on National Parks gear page (36 products)~~ DONE
   (tag: `jbmangum27-20`)
4. AdSense ad placements (all 3 sites) —
   **[[context/adsense-implementation-plan|Full AdSense Plan]]**
5. ~~Affiliate links on Camping Native gear posts (80 posts)~~ DONE
   (tag: `jbmangum27-20`)
6. ~~Affiliate links in Waterfalls guides (5 guides)~~ DONE
   (tag: `jbmangum27-20`)
7. ~~National Parks sitemap cleanup (removed ignored
   changefreq/priority tags)~~ DONE

**GA4 IDs:** Camping Native `G-BP5876ZTQT` · Waterfalls
`G-3NQJV7QML2` · National Parks `G-WG2965ESY2` (all 3 implemented)

### Camping Native — Content Overhaul (Feb 7)

> [!success] All 81 articles rewritten from AI slop to authentic Brian
> voice

- Rewrote 80 gear reviews + 1 blog post — first-person, opinionated,
  experience-based copy
- All Amazon affiliate links preserved (`jbmangum27-20` tag)
- All 81 articles pushed to Supabase and verified live
- Originals backed up in `site-camping-native/content-rewrites/originals/`

**Next steps for Camping Native:**
- [ ] Review a few full articles on campingnative.com to confirm
  quality
- [ ] Trigger site rebuild if content isn't showing (push to main or
  manual Cloudflare Pages rebuild)
- [ ] Decide: commit `content-rewrites/` directory or .gitignore it

---

## Quick Wins

| Project | Action | Time | Status |
|---------|--------|------|--------|
| Potty Directory | Check AdSense dashboard | 30 min | - [ ] Not started |

---

## Key Documents

### Strategy & Research
- [[context/portfolio-review-feb6-2026|Portfolio Review (Feb 6, 2026)]] — 3-agent team analysis
- [[context/market-opportunities|Market Opportunities by Project]]
- [[context/Research/marketing-f5bot-reddit-monitoring|F5Bot Reddit Monitoring Setup]]
- [[context/Research/saas-monetization-strategy|SaaS Monetization Strategy]]

### Monetization Plans
- [[context/outdoor-network-monetization-plan|Outdoor Network Monetization Plan]] — GA4, AdSense, affiliates, cross-promotion for 3 outdoor sites
- [[context/adsense-implementation-plan|AdSense Implementation Plan]] — Per-site ad placement strategy, component architecture, revenue estimates

### Marketing Plans
- [[app-lovenotes/tasks/marketing-plan-sendmylove|LoveNotes Marketing Plan]]
- [[tasks/marketing-plan-scdmv-alerts|SCDMV Marketing Plan]]
- [[site-nationalparks-directory/tasks/marketing-plan-nationalparks|National Parks Marketing Plan]]
- [[site-recordstore-directory/marketing/LAUNCH-KIT|RecordStops Launch Kit]]
- [[site-scdmv-alerts/PRESS-KIT|SCDMV Press Kit]]

### Go High Level
- [[context/Go High Level/ghl-strategy|GHL Strategy]]
- [[context/Go High Level/ghl-award-winners-research|GHL Award Winners Research]]

### Guides & Tools
- [[context/obsidian-quickstart|Obsidian Quick Start]] — how to use Obsidian with this monorepo
- [[context/Tools/competitive-intelligence-tools|Competitive Intelligence Tools]]
- [[context/templates/Claude-SITE-CHECKLIST|Site Checklist Template]]
- [[context/templates/Claude-Site-TEMPLATE|Site Template]]

---

## Project Health (All)

### Live & Accepting Payments
| Project | Revenue | Status | Links |
|---------|---------|--------|-------|
| SCDMV Alerts | $0 | Press outreach pending | [[site-scdmv-alerts/CLAUDE\|CLAUDE]] · [[site-scdmv-alerts/progress\|progress]] |
| LoveNotes | $0 | V2 pivot shipped, needs deploy | [[app-lovenotes/CLAUDE\|CLAUDE]] · [[app-lovenotes/progress\|progress]] |

### Live & Generating Traffic
| Project | Traffic | Status | Links |
|---------|---------|--------|-------|
| RecordStops | 683 users/mo | Active, social running | [[site-recordstore-directory/CLAUDE\|CLAUDE]] · [[site-recordstore-directory/progress\|progress]] |
| Potty Directory | ~190 real sessions | Passive, check AdSense | [[site-pottydirectory/CLAUDE\|CLAUDE]] · [[site-pottydirectory/progress\|progress]] |
| National Parks | New (Jan 27) | GA4 + affiliates + cross-promo live | [[site-nationalparks-directory/CLAUDE\|CLAUDE]] · [[site-nationalparks-directory/progress\|progress]] |
| Waterfall Directory | 10k+ pageviews | GA4 + affiliates live, needs AdSense | [[site-waterfall-directory/CLAUDE\|CLAUDE]] · [[site-waterfall-directory/progress\|progress]] |
| Camping Native | Unknown | 81 articles rewritten, affiliates live | [[site-camping-native/CLAUDE\|CLAUDE]] · [[site-camping-native/progress\|progress]] |

### PRDs Ready (Not Yet Built)
| Project | Concept | PRD | Links |
|---------|---------|-----|-------|
| Church Directory | NC church finder, 15-20k listings, programmatic SEO | [[site-church-directory/PRD\|PRD]] | [[site-church-directory/CLAUDE\|CLAUDE]] |
| Hunting Leases | SE US hunting lease marketplace, landowners + providers | [[site-statehuntingleases-com/PRD\|PRD]] | [[site-statehuntingleases-com/CLAUDE\|CLAUDE]] |

### In Progress
| Project | Status | Links |
|---------|--------|-------|
| Heirloom | Building with partner (Oliver) | [[app-heirloom/CLAUDE\|CLAUDE]] · [[app-heirloom/progress\|progress]] |
| PlanCompass | Animated hero shipped (Feb 7). CMS API key still needed. | [[app-plancompass/CLAUDE\|CLAUDE]] · [[app-plancompass/progress\|progress]] |

### Internal Tools
| Project | What It Does | Links |
|---------|-------------|-------|
| jGen | Internal tool (live) | [[app-jgen/CLAUDE\|CLAUDE]] |
| Tacoma Tracker | Internal tool (live) | [[app-tacoma-tracker/CLAUDE\|CLAUDE]] |
| Subscription Admin | Internal admin tool | [[app-subscription-admin/CLAUDE\|CLAUDE]] |
| chud | Electron overlay — Claude Code session stats | [[chud/CLAUDE\|CLAUDE]] |
| Directory Factory | BUILD wizard + MANAGE pipeline for directory sites | [[site-directory-factory/CLAUDE\|CLAUDE]] |

### Deleted (Feb 6, 2026)
app-action-chess · app-kalshi-edge · app-phonebot · app-eos-people-analyzer · site-carnivorerestaurants-com · app-investment-advisor

---

## PlanCompass — Hero Animation (Feb 7)

> [!success] Animated canvas hero shipped — premium feel, zero
> dependencies

- Pure Canvas API animation: compass rose, map grid, radar sweep,
  drifting waypoints, dashed route lines
- Brand-blue (#2563eb) on dark slate-900 background
- Accessibility: `prefers-reduced-motion` support, `aria-hidden`
  on canvas
- Performance: pauses via Visibility API when tab hidden
- Clean hard edge between dark hero and white value props (no
  gradient)

**Files:** `src/components/HeroAnimation.astro` (new),
`src/pages/index.astro` (modified)

**Still blocked:** CMS Marketplace API key needed for real plan data
(request at
[developer.cms.gov](https://developer.cms.gov/marketplace-api/key-request.html))

---

## Session Log — Feb 7, 2026

> [!abstract] Big day. 6 projects touched, ~5,000 lines changed.

| Project | What Got Done |
|---------|---------------|
| **LoveNotes** | Complete v2 pivot — prompt-based message builder. New landing page, onboarding, dashboard, 12 API endpoints, 90 prompt templates, 5 new DB tables. Committed, needs deploy. |
| **Camping Native** | Rewrote all 81 articles from AI slop to authentic Brian voice. Added Amazon affiliate links to all gear posts. |
| **National Parks** | GA4 analytics, 36 affiliate links on gear page, cross-promo footer, sitemap cleanup. |
| **Waterfalls** | GA4 analytics, affiliate links on 5 guide pages, cross-promo footer. |
| **PlanCompass** | Animated canvas hero — compass/navigator theme, zero deps, a11y. |
| **Monorepo** | Portfolio cleanup — deleted 6 dead projects, added PRDs, updated dashboard. |
| **AdSense Plan** | Created full implementation plan for all 3 outdoor sites (`context/adsense-implementation-plan.md`). |

---

## Infrastructure
- **Hosting:** Cloudflare Pages + Workers
- **Databases:** D1 (8 of 50,000)
- **Email:** SendGrid (50k/month free)
- **Payments:** Stripe
- **Monthly cost:** ~$6 (Kalshi Edge deleted, no more Claude API spend)

---

#dashboard #strategy