# Directory → SaaS Three-Layer Monetization Model

> Strategy document for layering SaaS revenue on top of existing directory sites using GoHighLevel (GHL)

## The Business Model

```
Layer 1: AdSense         → $500/mo per site (traffic)
Layer 2: Featured Listings → $500/mo per site (businesses pay to rank higher)
Layer 3: SaaS CRM         → $X/mo per site (businesses pay for software to run their shop)
Layer 4: Template Website  → one-time setup or bundled (they get a pro site instantly)
```

**20 directories × 4 layers = serious revenue**

---

## How It Works

Each directory has its own branded "pro" portal. White-labeled GHL. They see:

| Directory | SaaS Brand | What It Does | Price |
|-----------|-----------|--------------|-------|
| RecordStops.com | **RecordStops Pro** | CRM, email marketing, event promotion, review management, pro website | $97-197/mo |
| PottyDirectory.com | **PottyPro** | CRM, quote requests, job scheduling, invoice/payments, review management, pro website | $97-197/mo |
| PharmacyDirectory | **PharmacyHub** | CRM, prescription reminders, patient communications, review management, pro website | $97-147/mo |

### The Pitch
"You're already listed on our directory. Upgrade to Pro and get a professional website AND the tools to actually convert those visitors into customers."

---

## Pricing Tiers

| Tier | Monthly | What They Get |
|------|---------|---------------|
| Featured Listing | $29-99/mo | Badge + top placement on directory |
| Pro (SaaS only) | $97/mo | CRM + automations + review management |
| Pro + Website | $197/mo | Everything above + professional template website |
| Pro + Custom Website | $497 setup + $197/mo | Custom-designed site |

---

## Technical Architecture

### What stays the same
- Directory sites remain Astro + Cloudflare + D1/Supabase
- SEO, content, listings — no change
- AdSense, featured listings — no change
- GHL does NOT touch directory websites

### What GHL handles (new layer)
- CRM for each business
- Email/SMS marketing automation
- Review request automation
- Appointment/booking
- Invoicing/payments
- Reporting dashboard

### Connection Point
```
PottyDirectory.com/vendor/joes-porta-potties
  → "Manage your business with PottyPro" button
  → Links to GHL signup page (white-labeled)
  → Joe signs up, gets his own PottyPro sub-account
  → You collect $147/mo via GHL's built-in billing
```

---

## GHL Internal Structure

```
YOUR GHL AGENCY ACCOUNT
├── Snapshots (Templates)
│   ├── RecordStops Pro Template
│   ├── PottyPro Template
│   └── PharmacyHub Template
├── Sub-Accounts (Live Customers)
│   ├── Bob's Vinyl Emporium — $197/mo
│   ├── Joe's Porta Potties — $147/mo
│   └── Main Street Pharmacy — $97/mo
```

---

## Per-Directory SaaS Breakdown

### PottyPro ($147-197/mo) — LAUNCH FIRST
- 4,588 businesses in DB
- Pipeline: Quote Request → Quoted → Booked → Delivered → Picked Up
- Automated follow-ups, job scheduling, invoice/payments, review requests

### RecordStops Pro ($97-197/mo)
- 296 businesses in DB
- Customer CRM, email campaigns, event promotion, review management

### PharmacyHub ($97-147/mo)
- 21,000 independent pharmacies nationally
- Patient communication, refill reminders, onboarding forms, review management

---

## Revenue Model (Conservative)

### Per Directory (at maturity)
| Layer | Revenue |
|-------|---------|
| AdSense | $500/mo |
| Featured Listings | $500/mo |
| SaaS (GHL) | $500-2,000/mo |
| Website setups | $0-500/mo |
| **Total** | **$1,500-3,500/mo** |

### Portfolio (20 directories)
- Conservative (5 SaaS/site): $30,000/mo
- Moderate (10 SaaS/site): $40,000/mo
- Aggressive (15 SaaS/site): $50,000/mo

### Costs: ~$600/mo total overhead

---

## Key Principles

- Directories are the moat — organic SEO delivers business owners to your doorstep
- No new customer acquisition needed — same businesses, more revenue per business
- 80% of each GHL template is reusable across niches
- Never move directories to GHL's website builder — Astro sites are better for SEO

---

*Created: January 2026*
