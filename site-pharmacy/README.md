# Independent Pharmacy Directory

> Find independent pharmacies not owned by CVS, Walgreens, or corporate chains with insurance conflicts of interest.

## 🎯 Mission

Help consumers discover truly independent pharmacies that prioritize patient care over corporate profits. Support local businesses and avoid pharmacy-insurance conflicts of interest (like CVS owning Aetna).

## 🚀 Tech Stack

- **Framework:** Astro 4.x (hybrid SSR + static)
- **Database:** Cloudflare D1 (SQLite)
- **Styling:** Tailwind CSS
- **Hosting:** Cloudflare Pages
- **Forms:** Cloudflare Pages Functions

## 📦 Quick Start

```bash
# Install dependencies
npm install

# Create D1 database (first time only)
npm run db:create

# Apply database migrations
npm run db:migrate:local

# Start development server
npm run dev
```

Visit `http://localhost:4321`

## 🗄️ Database Setup

### Create D1 Database

```bash
# Create the database
npx wrangler d1 create pharmacy-db

# Copy the database_id to wrangler.toml
# Update wrangler.toml [[d1_databases]] section with the ID
```

### Run Migrations

```bash
# Local (for development)
npm run db:migrate:local

# Remote (for production)
npm run db:migrate:remote
```

### Verify Database

```bash
# Query local database
npx wrangler d1 execute pharmacy-db --local --command "SELECT COUNT(*) FROM pharmacies"

# Query remote database
npx wrangler d1 execute pharmacy-db --remote --command "SELECT COUNT(*) FROM pharmacies"
```

## 📁 Project Structure

```
site-pharmacy/
├── migrations/           # D1 database migrations
│   └── 0001_init_schema.sql
├── public/              # Static assets
├── src/
│   ├── components/      # Astro components
│   │   ├── PharmacyCard.astro
│   │   └── SearchBar.astro
│   ├── layouts/         # Page layouts
│   │   └── BaseLayout.astro
│   ├── pages/           # Routes
│   │   ├── index.astro
│   │   ├── browse.astro
│   │   ├── why-independent.astro
│   │   ├── submit.astro
│   │   └── api/         # Cloudflare Pages Functions
│   └── styles/
├── PRD.md               # Product Requirements Document
├── progress.txt         # Development progress log
└── CLAUDE.md            # Claude Code context
```

## 🎨 Key Features

### MVP (Phase 1)

- ✅ Browse pharmacies by state
- ✅ Search by city/ZIP
- ✅ Filter by services (compounding, 24-hour, delivery, etc.)
- ✅ Pharmacy detail pages with contact info
- ✅ "Verified Independent" badges
- ✅ Submission form for pharmacy owners
- ✅ Educational content ("Why Independent?")

### Phase 2 (Planned)

- ⬜ Map view with Mapbox
- ⬜ Premium pharmacy listings
- ⬜ GoodRx affiliate integration
- ⬜ User reviews
- ⬜ Price comparison

## 📊 Data Sources

1. **NPI Registry** (free) - National Provider Identifier database
   - Taxonomy code: `3336C0003X` (Community/Retail Pharmacy)
   - Download: https://download.cms.gov/nppes/NPI_Files.html

2. **Outscraper** (paid) - Google Maps data enrichment
   - Website, phone, hours, photos
   - Cost: ~$0.002/record

3. **User Submissions** - Pharmacy owners can submit/verify listings

4. **Manual Verification** - Sample checks via Secretary of State business records

## 🚢 Deployment

### Cloudflare Pages

1. Connect GitHub repo to Cloudflare Pages
2. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
   - Root directory: `/`

3. Add D1 binding:
   - Go to Pages Settings → Functions → Bindings
   - Add D1 binding named `DB`
   - Select `pharmacy-db` database

4. Deploy!

### Post-Deploy

```bash
# Apply migrations to production
npm run db:migrate:remote

# Import data (TBD - see data import scripts)
```

## 📈 SEO Strategy

**Target Keywords:**
- "independent pharmacy [city]"
- "local pharmacy [city]"
- "pharmacy not owned by CVS"
- "compounding pharmacy [state]"

**Content Pages:**
- 50 state pages: `/state/[state]`
- 100+ city pages: `/state/[state]/[city]`
- 20,000+ pharmacy detail pages
- Educational content: `/why-independent`

**Schema Markup:**
- LocalBusiness + Pharmacy schema on all detail pages
- Structured data for address, phone, hours

## 💰 Monetization Plan

| Revenue Stream | Timeline | Estimate |
|----------------|----------|----------|
| Premium Listings | Month 3 | $1,500/month |
| GoodRx Affiliate | Month 6 | $200/month |
| Display Ads | Month 12 | $300/month |
| **Total** | **Year 1** | **$2,000/month** |

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Database
npm run db:create        # Create D1 database
npm run db:migrate:local # Apply migrations locally
npm run db:migrate:remote # Apply migrations to production

# Deployment
git push                 # Auto-deploys to Cloudflare Pages
```

## 📝 Environment Variables

None required for MVP (all data is public).

Future (if adding admin features):
- `ADMIN_PASSWORD` - Simple password protection for admin pages

## 🤝 Contributing

This is a personal project, but suggestions are welcome! Open an issue or PR.

## 📄 License

MIT

---

**Status:** MVP in development

**Next Steps:** See `progress.txt` for current status and next actions.
