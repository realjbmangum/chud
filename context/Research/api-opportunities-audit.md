# API Opportunities Audit

> [!info] Last Updated: Feb 7, 2026
> Audit of free/public APIs we're not leveraging across the portfolio.
> Companion to [[AI/PUBLIC-APIS-REFERENCE|Public APIs Reference Guide]].

---

## Archive.org APIs

[Archive.org](https://archive.org) offers several powerful, completely free APIs that map directly to our existing projects. No API keys required for most endpoints.

### API Endpoints

| API | Endpoint | Auth | Docs |
|-----|----------|------|------|
| **Search API** | `archive.org/advancedsearch.php` | None | [Docs](https://archive.org/advancedsearch.php) |
| **Metadata API** | `archive.org/metadata/{identifier}` | None | [Docs](https://archive.org/developers/metadata.html) |
| **Live Music Archive** | Search with `collection:etree` | None | [Browse](https://archive.org/details/etree) |
| **78rpm Collection** | Search with `collection:78rpm` | None | [Browse](https://archive.org/details/78rpm) |
| **Open Library API** | `openlibrary.org/api/` | None | [Docs](https://openlibrary.org/developers/api) |

### Best Fit: RecordStops (recordstops.com)

This is the strongest match in our portfolio. Archive.org's music collections are a natural complement to a record store directory — and **nobody else in this space is doing it**.

#### Live Music Archive

- **200,000+ free live concert recordings** — Grateful Dead, Phish, jam bands, indie artists
- Add a **"Free Live Recordings"** section to store pages, matched by genre
- Create **"Listen Before You Buy"** features linking free recordings to artists whose vinyl stores carry
- Build SEO content around **"rare recordings"** and **"bootleg history"** topics
- Query example:
  ```
  https://archive.org/advancedsearch.php?q=collection:etree+AND+creator:grateful+dead&output=json&rows=10
  ```

#### 78rpm / Vintage Vinyl Collection

- Thousands of digitized vintage 78rpm records with audio
- Create a **"Vintage Vinyl Spotlight"** content series
- Link to free historical recordings alongside store listings that carry vintage stock
- Perfect for social media content — "This 1942 pressing sounds like this..."

#### Archive.org Search API for Artist Matching

- Search by artist, album, or collection
- Auto-populate **"Related Free Listening"** for any artist a store carries
- Combine with Discogs data for rich, multi-source store pages

### Secondary Fit: Outdoor Sites (Camping Native, National Parks, Waterfalls)

- Historical photos of national parks (public domain)
- Vintage trail guides and camping manuals
- Useful for **"Then vs Now"** content pieces, but this is a content marketing play, not a core feature
- **Priority: Low** — focus Archive.org efforts on RecordStops first

---

## Unleveraged APIs Already in Our Reference

These are listed in [[AI/PUBLIC-APIS-REFERENCE|PUBLIC-APIS-REFERENCE.md]] but not yet integrated into any project.

### High Priority

#### Discogs → RecordStops

> [!tip] Highest ROI integration. Most mature product + best music API = richer pages that rank better.

| Detail | Value |
|--------|-------|
| **API** | [Discogs API](https://www.discogs.com/developers) |
| **Auth** | OAuth |
| **What it gives us** | Store vinyl inventory, release data, marketplace prices, artist info |
| **Use cases** | Auto-populate "what's in stock," "trending vinyl," price comparisons per store |
| **Why it matters** | This is a **product enhancement**, not a new build. Enriches existing pages. |

#### Recreation.gov (RIDB) → Camping Native

| Detail | Value |
|--------|-------|
| **API** | [Recreation.gov RIDB](https://ridb.recreation.gov/docs) |
| **Auth** | API Key (free) |
| **What it gives us** | Official federal campground data — availability, amenities, fees, reservations |
| **Use cases** | Real-time campground availability, amenity filters, fee comparison |
| **Why it matters** | Gold standard for camping data. Free. Would make Camping Native a legit trip-planning tool. |

### Medium Priority

#### Bandsintown → RecordStops

| Detail | Value |
|--------|-------|
| **API** | [Bandsintown API](https://artists.bandsintown.com/support/api-installation) |
| **Auth** | API Key |
| **What it gives us** | Upcoming local concerts/events near any location |
| **Use cases** | "Catch a show, then browse the bins" — show upcoming concerts near each store |
| **Why it matters** | Drives repeat visits. Creates a reason to check RecordStops beyond finding a store. |

#### Open-Meteo → All 3 Outdoor Sites

> [!success] 30-minute integration. No API key. Zero cost. Adds real utility.

| Detail | Value |
|--------|-------|
| **API** | [Open-Meteo](https://open-meteo.com/) |
| **Auth** | None |
| **What it gives us** | Weather forecasts, historical weather, air quality |
| **Use cases** | Weather widget on park/trail/waterfall pages for trip planning |
| **Why it matters** | Waterfalls site has 10k+ pageviews. Visitors are planning trips. Weather = utility. |

#### NPS Alerts API → National Parks

| Detail | Value |
|--------|-------|
| **API** | [NPS API](https://www.nps.gov/subjects/developer/api-documentation.htm) |
| **Auth** | API Key (free) |
| **What it gives us** | Official park alerts — closures, fire warnings, road conditions, events |
| **Use cases** | Real-time alert banners on park pages, "plan your visit" info |
| **Why it matters** | We likely already have the API key from park data. Just need to pull the alerts endpoint. |

### Low Priority (Quick Wins)

#### Sunrise-Sunset → Waterfalls + National Parks

| Detail | Value |
|--------|-------|
| **API** | [Sunrise-Sunset API](https://sunrise-sunset.org/api) |
| **Auth** | None |
| **What it gives us** | Golden hour, sunrise/sunset times for any lat/long |
| **Use cases** | Photography timing on waterfall and park pages |
| **Why it matters** | 15-minute integration. Photographers are a core audience for waterfall content. |

#### REFUGE Restrooms → Potty Directory

| Detail | Value |
|--------|-------|
| **API** | [REFUGE Restrooms](https://www.refugerestrooms.org/api/docs) |
| **Auth** | None |
| **What it gives us** | Public restroom locations and accessibility info |
| **Use cases** | Complement portable rental listings with free public restroom data |
| **Why it matters** | More content = more SEO surface area. Different audience but same domain. |

#### MusicBrainz → RecordStops

| Detail | Value |
|--------|-------|
| **API** | [MusicBrainz API](https://musicbrainz.org/doc/MusicBrainz_API) |
| **Auth** | None |
| **What it gives us** | Artist bios, discographies, relationships, release data |
| **Use cases** | Enrich store pages with artist info without hitting Discogs rate limits |
| **Why it matters** | Free, open, no rate limit issues. Good fallback/supplement to Discogs. |

---

## APIs NOT in Our Reference (New Discoveries)

These are APIs we haven't tracked before that could add value.

### Open Library API (archive.org)

| Detail | Value |
|--------|-------|
| **API** | [Open Library API](https://openlibrary.org/developers/api) |
| **Auth** | None |
| **What it gives us** | Book metadata, cover images, author info, editions |
| **Opportunity** | **"Used Bookstore Directory"** — the book equivalent of RecordStops. Same playbook, different niche. Massive market of independent bookstores. |
| **Priority** | Future build (violates "stop building" rule — park this idea) |

### Overpass / OpenStreetMap API

| Detail | Value |
|--------|-------|
| **API** | [Overpass API](https://overpass-api.de/) |
| **Auth** | None |
| **What it gives us** | Query any POI type from OpenStreetMap — stores, churches, parks, trails |
| **Opportunity** | Bulk-seed any directory with real location data for free. Could populate Church Directory with 15-20k listings without Google Places costs. |
| **Priority** | High when building new directories |

### Google Knowledge Graph API

| Detail | Value |
|--------|-------|
| **API** | [Knowledge Graph Search](https://developers.google.com/knowledge-graph) |
| **Auth** | API Key (free, 100k calls/day) |
| **What it gives us** | Structured entity data — artists, places, organizations |
| **Opportunity** | Enrich RecordStops artist pages and National Parks info with authoritative Google data. |
| **Priority** | Medium |

### Wikimedia REST API

| Detail | Value |
|--------|-------|
| **API** | [Wikimedia API](https://api.wikimedia.org/) |
| **Auth** | None |
| **What it gives us** | Wikipedia text, images, summaries — all CC-licensed |
| **Opportunity** | Add "About this park" / "About this artist" sections to any directory page using free, legally safe content. |
| **Priority** | Medium |

---

## Recommended Action Order

> [!warning] Respect the "stop building, start selling" mandate.
> These are **product enhancements** to existing live sites, not new builds.

### Tier 1 — Do When RecordStops Gets Focus

1. **Discogs integration** — Richer store pages, trending vinyl, price data
2. **Archive.org Live Music** — Unique differentiator nobody else has
3. **Bandsintown** — Local concerts near stores (engagement + repeat visits)

### Tier 2 — Quick Wins (< 1 hour each)

4. **Open-Meteo** on Waterfalls, National Parks, Camping Native (~30 min)
5. **Sunrise-Sunset** on Waterfalls + National Parks (~15 min)
6. **NPS Alerts** on National Parks (~30 min, likely same API key)

### Tier 3 — When Building New Directories

7. **Overpass API** for bulk-seeding Church Directory or future directories
8. **Open Library API** if a Used Bookstore Directory ever gets greenlit

### Tier 4 — Content Enrichment (Anytime)

9. **Wikimedia API** for "About" sections across all directories
10. **Google Knowledge Graph** for structured entity data
11. **MusicBrainz** as free supplement to Discogs

---

## Key Insight

> **RecordStops is where API integrations will have the most impact.**
> It's the most mature product (683 users/mo, active social, podcast lead),
> and the music/vinyl API ecosystem (Discogs + Archive.org + Bandsintown +
> MusicBrainz) is uniquely rich. No other record store directory is combining
> these data sources. That's the moat.

---

*See also: [[AI/PUBLIC-APIS-REFERENCE|Public APIs Reference Guide]] · [[context/market-opportunities|Market Opportunities]]*
