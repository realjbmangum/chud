# Camping Native - Claude Context

## Project Overview

Camping Native (campingnative.com) is an outdoor/camping directory and blog site. The mascot is **Sasquatch Sam**, a friendly Bigfoot who guides users through gear reviews, campsite discoveries, and outdoor adventures.

## Owner

Brian - tech entrepreneur approaching 50, preparing for a lifelong dream of thru-hiking the Appalachian Trail. Completed large portion of the Mountains-to-Sea Trail in NC. Values unplugging and stoic philosophy.

## Tech Stack

- **Framework**: Astro (static site generation)
- **Styling**: Tailwind CSS with custom camping theme
- **Database**: Supabase (camping_posts table)
- **Hosting**: Cloudflare Pages (auto-deploy on push to main)
- **Forms**: Web3Forms + Supabase dual-write
- **Domain**: campingnative.com (Cloudflare DNS)

## Key Files

| File | Purpose |
|------|---------|
| `site/src/data/site-config.json` | Site configuration, nav, categories |
| `site/src/lib/supabase.ts` | Database queries with postType filter |
| `site/src/layouts/BaseLayout.astro` | Main layout with SEO meta |
| `site/src/components/ProductCard.astro` | Card component for posts |

## Database

**Table: camping_posts**
- `post_type`: 'gear_review' or 'blog'
- `/gear` pages filter by `post_type = 'gear_review'`
- `/blog` pages filter by `post_type = 'blog'`

## Content Structure

- **/gear** - 80 gear review posts (migrated from WordPress)
- **/blog** - Personal blog posts (1 post so far)
- **/campsites** - Directory listings (coming soon)
- **/challenges** - Gamification system (planned)

## Design Notes

- Colors: forest greens, campfire oranges, cream backgrounds
- Voice: Friendly, authentic, outdoorsy
- No emojis in prose unless requested
- Avoid litotes and em-dashes in Brian's writing

## Current Weekly Goals

See README.md for the weekly checklist (Dec 20-27, 2024).
