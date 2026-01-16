# PRD: SC DMV Appointment Alerts

## Overview
A freemium service that monitors South Carolina's DMV website 24/7 and alerts users when earlier appointments become available. We're targeting SC as a first-mover opportunity while a competitor (ncdmvappointments.com at $20/mo) is focused on NC with "other states coming soon." By launching fast with a freemium model and better design, we capture the market before they expand.

## Goals
1. Capture SC market before competitor expands
2. Convert free users to paid with superior alert speed/frequency
3. Validate the business model cheaply before scaling to other states
4. **Success metric:** 100 paid subscribers within 60 days of launch

## Non-Goals (Critical - what we are NOT building)
- Multi-state support (SC only for MVP)
- Mobile app (web + SMS/email only)
- CDL appointments (stick to standard DMV for now)
- User accounts/dashboard (keep it simple - just email collection + Stripe)
- Real-time availability display (we're alerts only, not a booking system)
- Admin dashboard (manage via Supabase directly for MVP)

## Competitive Advantages
| Us | Competitor |
|-----|------------|
| Freemium (free tier available) | $20/mo only |
| SC first (no competition) | NC only, SC "coming soon" |
| SMS + Email | SMS only |
| Modern, clean design | Dated design |
| Lower paid tier ($5-8/mo) | $20/mo |

## User Stories

### Story 1: Landing Page
**As a** SC resident frustrated with long DMV wait times
**I want to** understand what this service offers and sign up quickly
**So that** I can get alerts when better appointments open up

**Acceptance Criteria:**
- [ ] Clear value prop above the fold: "Get instant alerts when SC DMV appointments open up"
- [ ] Social proof section (testimonials, media mentions - can be placeholder for now)
- [ ] How it works: 3-step visual (Subscribe → We Monitor → You Book)
- [ ] Pricing section showing Free vs Paid tiers clearly
- [ ] Email capture form for free tier
- [ ] Stripe checkout button for paid tier
- [ ] Mobile responsive
- [ ] Verify in browser: page loads fast, CTA buttons work

**Technical Notes:**
- Astro static site on Cloudflare Pages
- Tailwind CSS for styling
- Simple, fast, SEO-optimized

### Story 2: Free Tier Signup
**As a** budget-conscious user
**I want to** sign up for free alerts
**So that** I can try the service before paying

**Acceptance Criteria:**
- [ ] Email input with validation
- [ ] Optional phone number for SMS (with note: "SMS alerts are faster")
- [ ] Dropdown to select appointment type (License Renewal, Real ID, Road Test, etc.)
- [ ] Dropdown to select preferred region/office (or "Any")
- [ ] Clear explanation of free tier limits: "Up to 3 alerts per day"
- [ ] Confirmation page/email after signup
- [ ] Data saved to Supabase `subscribers` table
- [ ] Verify in browser: complete signup flow, check data in Supabase

**Technical Notes:**
- Use Astro API routes or Cloudflare Functions
- Supabase for subscriber storage
- Send welcome email via Resend or SendGrid

### Story 3: Paid Tier Checkout
**As a** user who wants unlimited alerts
**I want to** upgrade to paid tier
**So that** I never miss an appointment opening

**Acceptance Criteria:**
- [ ] Stripe Checkout integration (redirect flow, not embedded)
- [ ] Single price point for MVP ($5.99 or $7.99/mo)
- [ ] After successful payment, subscriber marked as `tier: 'paid'` in Supabase
- [ ] Stripe webhook handles subscription events (created, cancelled, failed)
- [ ] Cancel anytime messaging
- [ ] Verify in browser: complete checkout with Stripe test mode

**Technical Notes:**
- Stripe Checkout (simplest integration)
- Webhook endpoint for subscription lifecycle
- Store Stripe customer ID in subscribers table

### Story 4: DMV Scraper/Monitor
**As the** system
**I need to** check SC DMV website for appointment availability
**So that** I can detect when new slots open up

**Acceptance Criteria:**
- [ ] Script that checks SC DMV appointment page(s)
- [ ] Runs every 5-10 minutes via cron/scheduled function
- [ ] Detects available appointment slots
- [ ] Compares against last known state to find NEW openings
- [ ] Logs results to Supabase `availability_checks` table
- [ ] Triggers notification job when new slots found
- [ ] Handles errors gracefully (site down, rate limited, changed HTML)

**Technical Notes:**
- Research SC DMV website structure first
- Likely Puppeteer/Playwright if dynamic, or simple fetch if static
- Run on Cloudflare Workers (if simple) or separate cron job service
- May need to rotate user agents / add delays to avoid blocks

### Story 5: Notification Sender
**As a** subscriber
**I want to** receive instant alerts when appointments open
**So that** I can book before slots fill up

**Acceptance Criteria:**
- [ ] Matches new openings to subscriber preferences (type, region)
- [ ] Sends email to all matching subscribers
- [ ] Sends SMS to paid subscribers (or free users who provided phone)
- [ ] Email includes: appointment type, location, date/time, direct booking link
- [ ] SMS is concise: "SC DMV: [Type] appt available [Date] at [Location]. Book now: [link]"
- [ ] Respects free tier limit (3 alerts/day per user)
- [ ] Logs all notifications sent
- [ ] Verify: receive test email and SMS

**Technical Notes:**
- Twilio for SMS
- Resend or SendGrid for email
- Track daily alert count per subscriber in Supabase

### Story 6: Unsubscribe Flow
**As a** subscriber
**I want to** unsubscribe easily
**So that** I stop receiving alerts when I no longer need them

**Acceptance Criteria:**
- [ ] Unsubscribe link in every email
- [ ] One-click unsubscribe (no login required)
- [ ] Confirmation page: "You've been unsubscribed"
- [ ] Subscriber marked as `status: 'unsubscribed'` in Supabase
- [ ] Paid users: link to Stripe customer portal to cancel subscription
- [ ] Verify in browser: unsubscribe flow works

**Technical Notes:**
- Use signed/tokenized unsubscribe links
- Stripe Customer Portal for subscription management

## Technical Considerations

### Stack
- **Frontend:** Astro, Tailwind CSS, Cloudflare Pages
- **Backend:** Cloudflare Functions (API routes) or separate worker
- **Database:** Supabase (subscribers, availability_checks, notifications)
- **Payments:** Stripe Checkout + Webhooks
- **SMS:** Twilio
- **Email:** Resend (or SendGrid)
- **Scraper:** Puppeteer/Playwright, hosted on Railway/Render or Cloudflare (if simple enough)

### Data Model (Supabase)

```sql
-- subscribers table
id uuid primary key
email text not null unique
phone text
tier text default 'free' -- 'free' | 'paid'
status text default 'active' -- 'active' | 'unsubscribed'
appointment_type text -- 'license_renewal' | 'real_id' | 'road_test' | etc.
preferred_region text -- 'any' | specific office
stripe_customer_id text
alerts_sent_today int default 0
last_alert_date date
created_at timestamp
updated_at timestamp

-- availability_checks table
id uuid primary key
checked_at timestamp
appointments_found jsonb -- array of available slots
new_since_last jsonb -- slots that are new
raw_response text -- for debugging

-- notifications table
id uuid primary key
subscriber_id uuid references subscribers
channel text -- 'email' | 'sms'
appointment_data jsonb
sent_at timestamp
status text -- 'sent' | 'failed'
```

### Dependencies
- SC DMV website structure (need to research)
- Twilio account + phone number (~$1/mo + $0.0079/SMS)
- Resend account (free tier: 3k emails/mo)
- Stripe account
- Supabase project (free tier sufficient for MVP)
- Domain name

### Risks
- SC DMV website may block scraping (mitigation: respectful rate limits, rotating IPs if needed)
- SC DMV website structure may change (mitigation: monitoring, alerts on scraper failures)
- Low conversion from free to paid (mitigation: good free tier limits, clear value prop)
- Twilio costs if many SMS (mitigation: push email first, SMS as premium feature)

## Research Findings

**SC DMV Appointment System:**
- Official scheduler: `https://public.scscheduler.com/`
- JavaScript-based SPA (requires Puppeteer/Playwright to scrape)
- Services: Road tests (regular, motorcycle, CDL), REAL ID, vehicle titling, plate renewals
- CDL road tests REQUIRE appointments (high demand = good target)
- Walk-ins available for regular tests until 1:30pm, appointments needed 2-4pm
- **No existing SC DMV scrapers on GitHub - we'd be first to market**

**NC DMV (Competitor's Target) Analysis:**
- NC uses: `https://skiptheline.ncdot.gov/`
- Has direct API endpoint: `https://skiptheline.ncdot.gov/Webapp/_/_/_/en/WizardAppt/SlotsTime`
- Uses ASP.NET session management (cookie-based auth)
- Multiple open-source scrapers exist (Selenium-based and requests-based)
- Appointments released daily after midnight, booked 90 days out

**Technical Implications:**
- SC scheduler vendor unknown (scscheduler.com WHOIS likely privacy-protected)
- Must use Puppeteer/Playwright initially to:
  1. Automate the booking flow
  2. Intercept network requests to discover underlying API
  3. Potentially switch to direct API calls if found
- Existing DMV scrapers use Chrome/Firefox automation with 5-10 min polling
- Common pattern: Selenium + Discord/Slack/SMS notifications

## Open Questions
- Can we intercept the API calls behind the scheduler instead of full browser automation?
- How often do appointments actually become available?
- What appointment types are most in-demand in SC?
- Should free tier get SMS at all, or email-only?

## Task Checklist
- [ ] Research SC DMV website structure
- [ ] Story 1: Landing Page
- [ ] Story 2: Free Tier Signup
- [ ] Story 3: Paid Tier Checkout
- [ ] Story 4: DMV Scraper/Monitor
- [ ] Story 5: Notification Sender
- [ ] Story 6: Unsubscribe Flow
- [ ] Final review and testing
- [ ] Launch and monitor

## Revenue Projections (Rough)

**Costs (Monthly):**
- Hosting: $0 (Cloudflare free tier)
- Supabase: $0 (free tier)
- Twilio: ~$1 base + $0.0079/SMS
- Resend: $0 (free tier up to 3k emails)
- Domain: ~$1/mo amortized

**Break-even:** ~10-15 paid subscribers at $5.99/mo

**Target:** 100 paid subscribers = ~$600/mo revenue, ~$550/mo profit

---

*Generated: January 2026*
