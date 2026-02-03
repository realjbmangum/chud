# Heirloom Session Summary - December 1, 2025

## What We Accomplished

### Planning & Documentation
- Converted wireframes (App + Landing Page) from PDF to markdown
- Created `planning/MVP-FEATURES.md` - feature tiers, user stories, success metrics
- Created `planning/TECH-STACK.md` - architecture decisions (React Native + Supabase)
- Created `planning/SECURITY-ARCHITECTURE.md` - zero-knowledge encryption design

### Landing Page (Next.js)
- Built full landing page at `apps/web/`
- Sections: Header, Hero, Features, How It Works, Pricing, Testimonials, CTA, Footer
- Applied brand styling:
  - Colors: Heritage Green (#0C3B2E), Heirloom Gold (#C4A464), Ivory Linen (#F8F5EE)
  - Typography: Great Vibes (cursive logo), Cormorant Garamond (serif), Inter (sans)
- Added demo video in hero section
- Mobile responsive

### Email Capture
- Set up Supabase project
- Created `waitlist` table with RLS policies
- Integrated waitlist API route with Supabase
- Emails now save to database on form submission

### Deployment
- Deployed to Vercel
- Connected custom domain: **theheirloom.site**
- Environment variables configured

### Design Assets
- Created HTML mockups for AI video generation reference:
  - `designs/mockups/app-screen-mockup.html` (home screen)
  - `designs/mockups/app-screen-recording.html` (recording screen)
- Generated detailed technical prompt for AI video creation

---

## Tech Stack Decisions

| Layer | Choice |
|-------|--------|
| Mobile App | React Native + Expo |
| Web/Landing | Next.js |
| Backend | Supabase |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Hosting | Vercel |

---

## Live URLs

- **Landing Page:** https://theheirloom.site
- **GitHub Repo:** https://github.com/realjbmangum/heirloom
- **Supabase Project:** https://pjdjtfeztvtewpgkdnhl.supabase.co

---

## Next Steps

### For Oliver (Business)
- [ ] Review landing page copy and provide feedback
- [ ] Define pricing model (Free / Premium / Family)
- [ ] Draft go-to-market strategy
- [ ] Create product roadmap

### For Brian (Tech)
- [ ] Design database schema (users, stories, vaults, families)
- [ ] Scaffold React Native app
- [ ] Set up authentication flow
- [ ] Build recording experience

---

## Files Created/Modified

```
heirloom/
├── apps/web/                    # NEW - Next.js landing page
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── globals.css
│   │   │   └── api/waitlist/route.ts
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── CTA.tsx
│   │   │   └── Footer.tsx
│   │   └── lib/
│   │       └── supabase.ts
│   ├── public/
│   │   ├── heirloom1.mp4
│   │   └── heirloom2.mp4
│   └── tailwind.config.ts
├── designs/
│   ├── wireframes/
│   │   ├── app-wireframe.md
│   │   └── landing-page-wireframe.md
│   └── mockups/
│       ├── app-screen-mockup.html
│       └── app-screen-recording.html
├── planning/
│   ├── MVP-FEATURES.md
│   ├── TECH-STACK.md
│   └── SECURITY-ARCHITECTURE.md
└── docs/
    ├── Heirloom App Wireframe.pdf
    └── Heirloom Wireframe Landing Page.pdf
```

---

## Session Stats

- **Duration:** ~3 hours
- **Commits:** 4
- **Files created:** 25+
- **Lines of code:** ~4,000+

---

*Good session. Site is live. Waitlist is collecting emails. Foundation is set.*
