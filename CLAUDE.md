# Monorepo — Brian Mangum / LIGHTHOUSE 27 LLC

This is a monorepo containing all projects. Each project has its own `CLAUDE.md` and `progress.txt`.

When starting a session at this root, ask which project we're working on.

## Dashboard Sync Rule (MANDATORY)

**The dashboard (`context/00-Dashboard.md`) is Brian's single source of truth in Obsidian. If it's not in the dashboard, it doesn't exist to him. No exceptions.**

### When to update the dashboard:
- New/renamed/deleted files Brian would need to know about
- New analysis docs, reports, plans, marketing assets
- **Any significant code work** — commits, feature builds, refactors,
  migrations, content changes
- **At the end of every session** — add a session log entry summarizing
  what was done, even if working inside a sub-project folder
- Project status changes (deployed, blocked, new blocker, etc.)
- New links, key files, or decision records

### When starting any session (even in a sub-project):
- **Always read `context/00-Dashboard.md`** alongside the project's own
  CLAUDE.md and progress.txt
- This ensures continuity across sessions and projects

### Formatting rules:
- Use Obsidian callouts (`> [!info]`, `> [!success]`, `> [!warning]`)
- Use wiki-links (`[[path/to/file|Display Name]]`)
- Wrap long lines for readability in Obsidian's editor
- Never delete existing content — only add or update

---

## Portfolio Summary (Updated Feb 6, 2026 — cleaned up)

### LIVE & ACCEPTING PAYMENTS (2)

| Project | URL | Revenue Model | Status |
|---------|-----|---------------|--------|
| **site-scdmv-alerts** | scdmvappointments.com | Free / Pro $5.99 / CDL $19.99 | Stable. 3-day monitoring test Feb 5-8. Marketing plan + press kit ready. |
| **app-lovenotes** | sendmylove.app | $5/mo subscription | Live. 2,515 messages. Stripe working. SMS pending Twilio verification. |

### LIVE & GENERATING TRAFFIC (5)

| Project | URL | Revenue Model | Status |
|---------|-----|---------------|--------|
| **site-recordstore-directory** | recordstops.com | Premium listings + affiliate | 296 stores, 5 states, 683 GA users/month. 16 city guides. Newsletter worker. Podcast lead (Patrick Foster). Social active. |
| **site-pottydirectory** | pottydirectory.com | AdSense + premium listings | 1,400+ listings. ~190 real organic sessions (96% of 18K sessions are bots). Check AdSense revenue. |
| **site-nationalparks-directory** | bestusnationalparks.com | Affiliate + display ads | 63 parks. NPS API integration. Needs affiliate links. |
| **site-waterfall-directory** | bestwaterfalls.com | Affiliate + display ads | 10k+ pageviews. Only 17 NC waterfalls seeded — needs content + monetization. |
| **site-camping-native** | campingnative.com | Affiliate | 80 gear posts migrated from WP. Blog active. |

### DEPLOYED BUT NOT MONETIZED (1)

| Project | URL | Status |
|---------|-----|--------|
| **site-pet-health-decoder** | — | 12 health articles. No revenue model. No traffic. |

### IN PROGRESS (2)

| Project | Status | Links |
|---------|--------|-------|
| **app-heirloom** | Building with partner (Oliver) | Landing page done, MVP in progress |
| **app-plancompass** | Unblocked — API key acquired, ready to build | Target: Nov 2026 OEP |

### PRDs READY — NOT YET BUILT (2)

| Project | Concept | PRD |
|---------|---------|-----|
| **site-church-directory** | NC church finder, 15-20k listings via Google Places, programmatic SEO | `site-church-directory/PRD.md` |
| **site-statehuntingleases-com** | SE US hunting lease marketplace, landowners + providers | `site-statehuntingleases-com/PRD.md` |

### INTERNAL TOOLS (5)

| Tool | What It Does |
|------|-------------|
| **app-jgen** | Internal tool (live) |
| **app-tacoma-tracker** | Internal tool (live) |
| **app-subscription-admin** | Internal admin tool |
| **chud/** | Electron overlay — Claude Code session stats (tokens, cost). MVP complete. |
| **site-directory-factory** | BUILD wizard + MANAGE pipeline for directory sites. Deployed. |
| **mcp-cloudflare-domains** | MCP server for domain availability checks via Cloudflare. |

### DELETED (Feb 6, 2026)

Removed from repo — recoverable from git history:

app-action-chess · app-kalshi-edge · app-phonebot · app-eos-people-analyzer · site-carnivorerestaurants-com · app-investment-advisor

---

## Priority Stack (Feb 6, 2026 — reviewed by 3-agent team)

**FOCUS NOW (Feb 6-14):**
1. **LoveNotes** — Valentine's Day sprint. Create social accounts TODAY. Post pre-written content daily through Feb 14. Product Hunt launch Feb 12-13.
2. **SCDMV Alerts** — Send 3 press pitch emails after 3-day test passes (Feb 8). Emails already written in press kit.
3. **RecordStops** — Respond to podcast lead (Patrick Foster). Continue social media. Most complete product in portfolio.

**QUICK WINS (Feb 15+):**
4. Waterfall Directory — Add AdSense + affiliate links to existing 10k pageviews (2 hours)
5. National Parks — Add affiliate links to 63 park pages (1 hour)
6. Potty Directory — Check AdSense dashboard. If earning, optimize. If not, leave it.

**IN PROGRESS:**
- Heirloom (building with Oliver)
- PlanCompass (unblocked — has API key, target Nov 2026 OEP)

**DON'T DO:**
- New directory sites
- New features on existing products
- Any building before the top 3 are marketed

**Key Insight: Stop building, start selling. 10 deployed products, 0 marketing campaigns running. Valentine's Day is Feb 14 — 8 days away.**

---

## Infrastructure

- **Hosting:** Cloudflare Pages (all sites) + Cloudflare Workers (crons/scrapers)
- **Databases:** Cloudflare D1 (8 of 50,000 limit) — upgraded to paid plan Feb 2026
- **Email:** SendGrid (50k/month)
- **Payments:** Stripe
- **SMS:** Twilio (toll-free verification rejected — not working)
- **Maps:** Mapbox
- **Admin:** Cloudflare Access for protected routes
- **Monthly cost:** ~$6 (Kalshi Edge deleted, no more Claude API burn)

---

*Each project has its own CLAUDE.md with stack details, env vars, and session history.*
