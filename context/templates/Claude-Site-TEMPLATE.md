# Claude Instructions - [SITE_NAME]

## Site Overview

- **Domain:** [DOMAIN]
- **Type:** [business|place] directory
- **Prefix:** [PREFIX] (used for Supabase tables)
- **Site ID:** [PREFIX] (in `sites` table)

---

## Before Making Changes

1. **Read the playbook:** `~/new-project/site-directory-factory/DIRECTORY-SITE-PLAYBOOK.md`
2. **Verify architecture decisions** - especially per-site tables pattern
3. **Never assume** - verify before recommending

---

## Tech Stack (DO NOT CHANGE)

| Component | Technology | Notes |
|-----------|------------|-------|
| Framework | Astro | Static-first |
| Styling | Tailwind CSS | |
| Database | Supabase | Per-site tables |
| Hosting | Cloudflare Pages | Auto-deploy on push |
| Forms | Web3Forms | Dual-write to Supabase |
| DNS | Cloudflare | Proxied |

---

## Supabase Tables

This site uses:
- `[PREFIX]_[vendors/locations]` - Main data
- `[PREFIX]_submissions` - Form submissions
- `[PREFIX]_contact_messages` - Contact form

**DO NOT** create shared tables or use `site_id` columns.

---

## Environment Variables

All env vars are in **Cloudflare Pages**, not local `.env` files:
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `PUBLIC_WEB3FORMS_KEY`
- `PUBLIC_MAPBOX_TOKEN` (if maps)

---

## Form Handling

All forms use Web3Forms + Supabase dual-write pattern:
1. POST to Web3Forms (email notification)
2. INSERT to Supabase `[PREFIX]_submissions` or `[PREFIX]_contact_messages`

See playbook for implementation pattern.

---

## Deployment

- Push to `main` → Cloudflare Pages auto-deploys
- Deploy hook available in Directory Factory
- Verify www → root redirect is configured

---

## Common Tasks

### Add a new page
1. Create in `src/pages/`
2. Use `BaseLayout.astro`
3. Include SEOHead component with unique title/description

### Modify listings display
1. Check `src/lib/supabase.ts` for queries
2. Components in `src/components/`

### Update site config
1. Edit `src/data/site-config.json`
2. Colors, contact info, monetization IDs

---

## Site-Specific Context

<!-- Add any unique context about this site that Claude should know -->

---

## DO NOT

- Change the tech stack
- Use shared tables with site_id
- Hardcode API keys in source (use CF env vars)
- Skip the playbook when making architecture decisions
- Create .env files (all env vars in Cloudflare)

---

## Reference

- Playbook: `~/new-project/site-directory-factory/DIRECTORY-SITE-PLAYBOOK.md`
- Directory Factory: https://directory-factory.pages.dev
- Site repo: `~/new-project/site-[sitename]/` or `~/site-[sitename]/`
