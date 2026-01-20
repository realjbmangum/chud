# [SITE_NAME]

> [SITE_TAGLINE]

**Live:** https://[DOMAIN]
**Type:** [business|place] directory
**Launched:** [DATE]

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro |
| Styling | Tailwind CSS |
| Database | Supabase |
| Hosting | Cloudflare Pages |
| Forms | Web3Forms + Supabase |
| Email | Resend (outreach) |
| Analytics | Google Analytics |
| DNS/CDN | Cloudflare |

## Quick Reference

| Resource | Link |
|----------|------|
| Cloudflare Dashboard | https://dash.cloudflare.com |
| Supabase Dashboard | https://supabase.com/dashboard |
| Google Search Console | https://search.google.com/search-console |
| Google Analytics | https://analytics.google.com |
| Directory Factory | https://directory-factory.pages.dev |

---

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Stored in **Cloudflare Pages** (not local .env files):

| Variable | Description |
|----------|-------------|
| `PUBLIC_SUPABASE_URL` | Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `PUBLIC_WEB3FORMS_KEY` | Web3Forms access key |
| `PUBLIC_MAPBOX_TOKEN` | Mapbox token (if maps enabled) |

---

## Supabase Tables

This site uses the following tables (prefix: `[PREFIX]`):

| Table | Purpose |
|-------|---------|
| `[PREFIX]_[vendors/locations]` | Main listings data |
| `[PREFIX]_submissions` | User-submitted listings (pending review) |
| `[PREFIX]_contact_messages` | Contact form messages |

Registered in the central `sites` table with ID: `[PREFIX]`

---

## Deployment

### Automatic
Push to `main` branch → Cloudflare Pages auto-deploys

### Manual
Cloudflare Dashboard → Pages → [SITE] → Deployments → "Retry deployment"

### Deploy Hook
Can be triggered from Directory Factory or via:
```bash
curl -X POST "[DEPLOY_HOOK_URL]"
```

---

## DNS Configuration (Cloudflare)

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | @ | [cf-pages-subdomain].pages.dev | Proxied |
| CNAME | www | [DOMAIN] | Proxied |

**Redirect Rule:** www → root (301)

---

## Forms

### Submit Listing (`/submit`)
- Web3Forms → Email notification
- Supabase → `[PREFIX]_submissions` table
- Review in Directory Factory → Approve → Goes live

### Contact (`/contact`)
- Web3Forms → Email notification
- Supabase → `[PREFIX]_contact_messages` table

---

## SEO Checklist

See full checklist in [DIRECTORY-SITE-PLAYBOOK.md](./site-directory-factory/DIRECTORY-SITE-PLAYBOOK.md#seo-checklist)

### Completed
- [ ] Google Search Console verified
- [ ] Sitemap submitted
- [ ] Bing Webmaster Tools
- [ ] robots.txt configured
- [ ] www → root redirect
- [ ] Schema markup (LocalBusiness/TouristAttraction)

### Monitoring
- [ ] Weekly Search Console check
- [ ] Monthly Core Web Vitals review

---

## Content Structure

```
src/
├── components/          # Reusable UI components
├── data/
│   ├── site-config.json # Site settings, colors, contact
│   ├── categories.json  # Category definitions
│   └── states.json      # US states list
├── layouts/
│   └── BaseLayout.astro # Main HTML wrapper
├── lib/
│   └── supabase.ts      # Database client & queries
├── pages/
│   ├── index.astro      # Homepage
│   ├── [state]/         # State pages
│   │   ├── index.astro  # State listing
│   │   └── [city].astro # City/listing detail
│   ├── about.astro
│   ├── contact.astro
│   ├── submit.astro
│   ├── privacy.astro
│   ├── terms.astro
│   └── 404.astro
└── styles/
    └── global.css
```

---

## Playbook Reference

This site follows the standards in:
**[DIRECTORY-SITE-PLAYBOOK.md](./site-directory-factory/DIRECTORY-SITE-PLAYBOOK.md)**

Key sections:
- Architecture Decisions (per-site tables)
- Naming Conventions
- Form Handling Standards (Web3Forms)
- SEO Checklist
- Supabase Schema Standards

---

## Site-Specific Notes

<!-- Add any unique notes about this site -->

---

## Changelog

| Date | Change |
|------|--------|
| [DATE] | Initial launch |

---

*Built with the Directory Site Playbook • Managed via Directory Factory*
