# New Directory Site Checklist

> Use this checklist when starting a new directory site. Reference the full playbook at `site-directory-factory/DIRECTORY-SITE-PLAYBOOK.md`.

---

## Pre-Build Planning

- [ ] **Define site type:** business or place
- [ ] **Choose prefix:** Short name for tables (e.g., `potty`, `waterfall`, `parks`)
- [ ] **Domain:** Purchase or identify domain
- [ ] **Research:** Create strategy/research docs in site folder

---

## Phase 1: Setup

### GitHub Repo
- [ ] Create repo: `site-[sitename]`
- [ ] Clone to `~/new-project/site-[sitename]/` or `~/site-[sitename]/`
- [ ] Copy from template or existing site

### Supabase Tables
```sql
-- Run in Supabase SQL editor

-- For BUSINESS directories:
CREATE TABLE [prefix]_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    email TEXT,
    services_offered TEXT[],
    rating DECIMAL(2, 1),
    review_count INTEGER DEFAULT 0,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    ai_description TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- For PLACE directories:
CREATE TABLE [prefix]_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    state TEXT NOT NULL,
    county TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    ai_description TEXT,
    difficulty TEXT,
    features JSONB DEFAULT '{}',
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- For ALL sites:
CREATE TABLE [prefix]_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT,
    location_name TEXT,
    contact_name TEXT,
    contact_email TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    city TEXT,
    state TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE [prefix]_contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE [prefix]_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE [prefix]_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE [prefix]_contact_messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read" ON [prefix]_vendors FOR SELECT USING (true);
CREATE POLICY "Public insert" ON [prefix]_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON [prefix]_contact_messages FOR INSERT WITH CHECK (true);
```

- [ ] Tables created in Supabase
- [ ] RLS policies added

### Register in Sites Table
```sql
-- Note: 'slug' is derived from 'id' in Directory Factory code
INSERT INTO sites (id, name, table_name, site_type, domain)
VALUES (
    '[prefix]',
    '[Site Name]',
    '[prefix]_vendors',  -- or [prefix]_locations
    '[business|place]',
    '[domain.com]'
);
```

- [ ] Site registered in `sites` table

---

## Phase 2: Build

### Site Configuration
- [ ] Update `src/data/site-config.json`
  - [ ] name, tagline, description
  - [ ] domain
  - [ ] contact email
  - [ ] colors (primary, secondary, accent)
- [ ] Update `src/data/categories.json` (if applicable)
- [ ] Replace favicon and og-image in `public/`

### Forms Setup
- [ ] Get Web3Forms key at https://web3forms.com
- [ ] Update `submit.astro` with Web3Forms key
- [ ] Update `contact.astro` with Web3Forms key
- [ ] Verify dual-write to Supabase works

### Content
- [ ] Write homepage copy
- [ ] Write about page
- [ ] Create/generate privacy policy
- [ ] Create/generate terms of service
- [ ] Add initial listings/data

### SEO
- [ ] Unique title tags per page
- [ ] Meta descriptions
- [ ] Schema markup (LocalBusiness or TouristAttraction)
- [ ] robots.txt with sitemap reference
- [ ] Custom 404 page

---

## Phase 3: Deploy

### Cloudflare Pages
- [ ] Connect GitHub repo to Cloudflare Pages
- [ ] Build settings:
  - Build command: `npm run build`
  - Output directory: `dist`
- [ ] Add environment variables:
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`
  - `PUBLIC_WEB3FORMS_KEY`
  - `PUBLIC_MAPBOX_TOKEN` (if needed)

### DNS (Cloudflare)
- [ ] Add CNAME: `@` → `[project].pages.dev` (Proxied)
- [ ] Add CNAME: `www` → `[domain]` (Proxied)
- [ ] Add redirect rule: www → root (301)
- [ ] SSL/TLS set to Full or Full (Strict)

### Verify
- [ ] Site loads at https://[domain]
- [ ] www redirects to non-www
- [ ] Forms submit successfully
- [ ] All pages render correctly

---

## Phase 4: Post-Launch

### Google Search Console
1. [ ] Add property: https://[domain]
2. [ ] Verify via DNS TXT record
3. [ ] Submit sitemap
4. [ ] Request indexing for homepage

### Bing Webmaster Tools
1. [ ] Import from Google Search Console
2. [ ] Submit sitemap

### Directory Factory
- [ ] Verify site appears in site dropdown
- [ ] Test submissions flow (if applicable)
- [ ] Add deploy hook URL to sites table

### Monitoring
- [ ] Check Search Console after 1 week
- [ ] Review Core Web Vitals
- [ ] Fix any crawl errors

---

## Documentation

- [ ] Copy `SITE-README-TEMPLATE.md` → `README.md`
- [ ] Fill in site-specific details
- [ ] Copy `SITE-CLAUDE-TEMPLATE.md` → `CLAUDE.md`
- [ ] Fill in site-specific context

---

## Quick Reference

| Resource | URL |
|----------|-----|
| Playbook | `~/new-project/site-directory-factory/DIRECTORY-SITE-PLAYBOOK.md` |
| Directory Factory | https://directory-factory.pages.dev |
| Cloudflare | https://dash.cloudflare.com |
| Supabase | https://supabase.com/dashboard |
| Web3Forms | https://web3forms.com |
| Search Console | https://search.google.com/search-console |

---

*Last updated: December 2024*
