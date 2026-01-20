# PRD: ACA Plan Advisor

## Overview
A consumer-facing web app that simplifies ACA Marketplace health insurance decisions by showing real dollar impacts — not jargon. Users enter their ZIP, household info, and income estimate to see plan comparisons with clear savings opportunities. Optional account creation enables proactive alerts for premium changes, renewal deadlines, and money-saving opportunities. The app empowers users to make informed decisions before enrolling on HealthCare.gov.

**Target Launch:** November 2026 Open Enrollment Period (OEP)

## Goals
1. **Primary:** Help users find the best-value Marketplace plan in under 5 minutes with clear dollar comparisons
2. **Secondary:** Reduce "set it and forget it" behavior by alerting users to premium changes and better options
3. **Tertiary:** Generate sustainable revenue through freemium features, affiliate links, and minimal advertising
4. **Success Metrics:**
   - 10,000 plan comparisons in first OEP
   - 25% of users create accounts
   - 15% click-through to HealthCare.gov
   - < 2% unsubscribe rate on notifications

## Non-Goals (What We Are NOT Building)
- **No enrollment functionality** — we inform, HealthCare.gov enrolls
- **No personal health data collection** — no diagnoses, prescriptions, medical history
- **No state-based Marketplace support initially** — federal Marketplace states only (covers 32 states)
- **No broker/agent features** — this is consumer-direct only
- **No account linking to HealthCare.gov** — users manually enter their current plan info
- **No plan recommendations based on health needs** — we compare costs, not coverage adequacy
- **No native mobile apps for MVP** — PWA capabilities may come later

## User Stories

### Story 1: Anonymous Plan Comparison (Core Value)
**As a** Marketplace shopper
**I want to** compare plans by entering my ZIP, age, household size, and estimated income
**So that** I can see which plans save me the most money without creating an account

**Acceptance Criteria:**
- [ ] Landing page has clear CTA: "See Your Options" or "Find Savings"
- [ ] Input form collects: ZIP code, county (if ZIP spans multiple), number of people, ages, estimated annual income
- [ ] Form validates inputs (valid ZIP, reasonable income range, ages 0-64)
- [ ] Loading state shows while fetching from CMS API
- [ ] Results display within 5 seconds for typical queries
- [ ] Results show 5-10 top plans sorted by "estimated total annual cost" (premium + avg out-of-pocket)
- [ ] Each plan card shows: monthly premium (after subsidies), deductible, out-of-pocket max, metal tier, carrier name
- [ ] Plan cards include letter grade (A-F) based on value score algorithm
- [ ] Verify in browser: complete flow from landing to results works without account

**Technical Notes:**
- CMS Marketplace API: `https://marketplace.api.healthcare.gov/`
- Need to handle APTC (subsidy) calculations based on income vs FPL
- Cache API responses by ZIP+params for 24 hours to reduce API calls

---

### Story 2: Current Plan Entry & Savings Comparison
**As a** user with an existing Marketplace plan
**I want to** enter my current plan details and see if I could save money switching
**So that** I know whether it's worth re-shopping during OEP

**Acceptance Criteria:**
- [ ] "I have a current plan" option on input form
- [ ] User can search/select their current plan by carrier and plan name
- [ ] If plan not found, user can manually enter: monthly premium, deductible, metal tier
- [ ] Results page highlights current plan vs alternatives
- [ ] Shows explicit savings: "Switch to [Plan X]: Save $180/mo ($2,160/year)"
- [ ] Side-by-side comparison view for current plan vs top 3 alternatives
- [ ] Comparison includes: premium, deductible, OOP max, key benefits (dental, vision, etc.)
- [ ] Verify in browser: entering current plan shows personalized savings

**Technical Notes:**
- Store current plan selection in localStorage for anonymous users
- Need plan ID mapping to match user's plan to API data

---

### Story 3: Dollar-Centric Dashboard (Logged-In Users)
**As a** registered user
**I want to** see a personalized dashboard with my plan info and savings opportunities
**So that** I can quickly check my status without re-entering information

**Acceptance Criteria:**
- [ ] Dashboard shows: current plan summary, monthly cost, annual projection
- [ ] "Potential Savings" card shows best alternative with dollar difference
- [ ] "Key Dates" section shows: OEP dates, renewal deadline, next premium change
- [ ] Quick actions: "Re-compare Plans", "Update My Info", "Notification Settings"
- [ ] Dashboard loads in < 2 seconds for returning users
- [ ] Mobile-responsive layout works on phones
- [ ] Verify in browser: dashboard displays correctly after login

**Technical Notes:**
- User profile stores: ZIP, household info, income, current plan selection
- Background job refreshes plan data weekly during OEP, monthly otherwise

---

### Story 4: User Registration & Authentication
**As a** visitor
**I want to** create an account to save my information and receive alerts
**So that** I don't have to re-enter everything and I get notified about important changes

**Acceptance Criteria:**
- [ ] Sign-up form: email, password (8+ chars), optional phone for SMS
- [ ] Email verification required before enabling notifications
- [ ] Login form with "forgot password" flow
- [ ] OAuth options: Google, Apple (reduces friction)
- [ ] After signup, prompt to complete profile (ZIP, household, income, current plan)
- [ ] "Continue as guest" option always visible — never force registration
- [ ] Verify in browser: full signup → email verify → login → dashboard flow works

**Technical Notes:**
- Use Supabase Auth for simplicity
- Store phone numbers only if user opts into SMS (with consent checkbox)
- GDPR/CCPA considerations: clear data usage disclosure

---

### Story 5: Notification Preferences & Delivery
**As a** registered user
**I want to** choose how and when I receive alerts
**So that** I get important updates without being spammed

**Acceptance Criteria:**
- [ ] Settings page with notification preferences
- [ ] Channel options: Email (default on), Push (if PWA), SMS (opt-in, requires phone)
- [ ] Notification types user can toggle:
  - Premium change alerts (when next year's rates published)
  - Renewal deadline reminders (30 days, 7 days, 1 day before)
  - New savings opportunities (if better plan appears)
  - OEP start/end reminders
- [ ] Frequency cap: max 2 notifications per week outside OEP, max 4/week during OEP
- [ ] One-click unsubscribe in every email/SMS
- [ ] Verify in browser: settings save correctly, test email sends

**Technical Notes:**
- Email: SendGrid or Resend
- SMS: Twilio (watch costs — ~$0.0075/SMS)
- Push: Web Push API for PWA users
- Queue system for notification delivery (avoid rate limits)

---

### Story 6: Premium Change Alerts (High-Value Notification)
**As a** registered user
**I want to** be notified when my plan's premium changes for next year
**So that** I can evaluate alternatives before auto-renewal

**Acceptance Criteria:**
- [ ] System detects when CMS publishes next year's rates (typically Oct 15)
- [ ] Within 48 hours of rate publication, users receive personalized alert
- [ ] Alert shows: "Your [Plan Name] premium changing from $X to $Y/month (+Z%)"
- [ ] Alert includes: "We found [N] plans that could save you $[amount]/month"
- [ ] CTA button: "Compare Your Options" links to pre-filled comparison
- [ ] Verify: alert content is accurate and links work

**Technical Notes:**
- Background job monitors CMS API for new plan year data
- Calculate diff between current year and next year rates
- Personalize based on user's stored income/household (subsidies may also change)

---

### Story 7: HealthCare.gov Handoff (Affiliate/CTA)
**As a** user who found a better plan
**I want to** easily go to HealthCare.gov to enroll
**So that** I can complete my enrollment without confusion

**Acceptance Criteria:**
- [ ] Clear "Enroll on HealthCare.gov" button on plan details and comparison pages
- [ ] Button opens HealthCare.gov in new tab
- [ ] If affiliate tracking available, append tracking parameters
- [ ] Interstitial explains: "You're leaving [App Name]. Complete enrollment on HealthCare.gov."
- [ ] Track click-through as conversion event
- [ ] Verify in browser: button works, tracking fires

**Technical Notes:**
- Research HealthCare.gov affiliate/partner programs
- At minimum, track internal analytics on CTA clicks
- Deep-link to plan if HealthCare.gov supports it (unlikely, but check)

---

### Story 8: Plan Detail View
**As a** user comparing plans
**I want to** see detailed information about a specific plan
**So that** I can understand what's covered before deciding

**Acceptance Criteria:**
- [ ] Click on plan card opens detail view (modal or page)
- [ ] Shows all CMS API data: premiums at all income levels, deductibles, copays, coinsurance
- [ ] Benefits section: doctor visits, specialist visits, ER, hospital, prescriptions, mental health
- [ ] Network info: plan type (HMO/PPO/EPO), carrier contact
- [ ] "Compare" button to add plan to side-by-side comparison
- [ ] "Set as My Plan" button for logged-in users
- [ ] Verify in browser: detail view displays complete plan information

**Technical Notes:**
- CMS API provides detailed benefits data — map to user-friendly display
- Consider expandable sections for dense information

---

### Story 9: Freemium Premium Features
**As a** power user
**I want to** access advanced features with a premium subscription
**So that** I can get deeper insights and priority support

**Acceptance Criteria:**
- [ ] Free tier includes: basic comparison, 1 saved household, email alerts
- [ ] Premium tier ($3.99/mo or $29.99/year) includes:
  - Unlimited saved households (for helping family members)
  - SMS alerts
  - Historical premium tracking (see how plan costs changed over years)
  - Priority email support
  - Ad-free experience
- [ ] Upgrade prompts appear contextually (not annoyingly)
- [ ] Stripe integration for payment
- [ ] Cancel anytime, prorated refunds
- [ ] Verify in browser: upgrade flow, payment, feature unlocking works

**Technical Notes:**
- Stripe Checkout for subscriptions
- Feature flags to gate premium features
- Consider family plan pricing

---

### Story 10: Minimal Advertising (Non-Premium Users)
**As a** free user
**I want to** see relevant, non-intrusive ads
**So that** the service can remain free while not ruining my experience

**Acceptance Criteria:**
- [ ] Ads only on results page and dashboard (not during input flow)
- [ ] Max 1 ad per page
- [ ] Ads clearly labeled as "Advertisement"
- [ ] No auto-playing video, no pop-ups, no interstitials
- [ ] Ad content relevant to insurance/finance (no junk)
- [ ] Premium users see no ads
- [ ] Verify in browser: ads display correctly and aren't obnoxious

**Technical Notes:**
- Consider Google AdSense or direct partnerships with relevant brands
- Placeholder for MVP, implement once we have traffic

---

### Story 11: SEO Landing Pages by Location
**As a** person searching "health insurance [city/state]"
**I want to** find a helpful page about Marketplace options in my area
**So that** I can quickly get relevant information

**Acceptance Criteria:**
- [ ] Generate landing pages for top 100 metros in federal Marketplace states
- [ ] Page includes: state-specific OEP info, average premiums in area, CTA to compare
- [ ] Dynamic stats pulled from CMS API (e.g., "Matthews, NC has 47 plans available")
- [ ] Pages are SSR/SSG for SEO
- [ ] Schema markup for local content
- [ ] Verify: pages rank and drive organic traffic

**Technical Notes:**
- Astro SSG for landing pages
- Build script to generate pages from ZIP/city database
- Update stats monthly during off-season, daily during OEP

---

### Story 12: Mobile-Responsive Design
**As a** user on my phone
**I want to** use the app comfortably on a small screen
**So that** I can compare plans anywhere

**Acceptance Criteria:**
- [ ] All pages usable on 320px width and up
- [ ] Touch targets minimum 44x44px
- [ ] Input forms easy to complete on mobile (large fields, appropriate keyboards)
- [ ] Results cards stack vertically on mobile
- [ ] Comparison view adapts (horizontal scroll or stacked)
- [ ] Dashboard is mobile-first
- [ ] Verify in browser: test on iPhone SE, Pixel 5, and tablet sizes

**Technical Notes:**
- Tailwind CSS with mobile-first breakpoints
- Test with Chrome DevTools device emulation + real devices

---

## Technical Considerations

### Stack
- **Frontend:** Astro + React (islands for interactive components)
- **Styling:** Tailwind CSS
- **Backend:** Astro API routes + Supabase
- **Database:** Supabase (Postgres)
- **Auth:** Supabase Auth (email + OAuth)
- **Payments:** Stripe
- **Email:** Resend or SendGrid
- **SMS:** Twilio
- **Hosting:** Cloudflare Pages + Workers
- **Analytics:** Plausible or PostHog (privacy-focused)

### Data Model (Core Tables)
```
users (Supabase Auth managed)
  - id, email, phone, created_at

profiles
  - user_id, zip, county_fips, household_json, income, current_plan_id, created_at, updated_at

saved_comparisons
  - id, user_id (nullable for anon), input_params_json, results_json, created_at

notification_preferences
  - user_id, email_enabled, sms_enabled, push_enabled, preferences_json

subscriptions
  - user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end
```

### External APIs
- **CMS Marketplace API** (primary data source)
  - Endpoints: /plans, /counties, /poverty-guidelines, /premiums
  - Rate limits: TBD (need to test/confirm)
  - Free developer API key required
  - Documentation: https://marketplace.api.healthcare.gov/

### Key Risks
1. **CMS API reliability** — if API goes down during OEP, we're dead. Mitigation: aggressive caching, status monitoring.
2. **Subsidy calculation accuracy** — complex rules around APTC. Mitigation: link to official calculator, add disclaimers.
3. **Regulatory concerns** — we're not licensed brokers. Mitigation: clear disclaimers, no "advice", just information.
4. **SMS costs at scale** — could get expensive. Mitigation: SMS is premium-only, strict opt-in.
5. **Data freshness** — plans change, especially during OEP. Mitigation: frequent cache invalidation, "last updated" timestamps.

### Compliance & Legal
- **No HIPAA required** — we never collect PHI (protected health information)
- **Privacy policy required** — disclose data collection (ZIP, income, email)
- **Terms of service** — disclaim that we're not providing insurance advice
- **CAN-SPAM / TCPA compliance** — proper opt-in/opt-out for email and SMS
- **Affiliate disclosure** — if we earn commissions, must disclose

---

## Open Questions
1. Does CMS Marketplace API support any affiliate/partner tracking for HealthCare.gov referrals?
2. What are the exact API rate limits? Need to test during high-traffic OEP period.
3. Should we support state-based Marketplaces eventually? (CA, NY, etc. have their own APIs)
4. Is there demand for a "help my parents" feature (managing multiple households)?
5. Legal review: do we need any state-specific insurance disclaimers?

---

## Task Checklist

### Phase 1: Foundation (MVP Core)
- [ ] Story 1: Anonymous Plan Comparison
- [ ] Story 8: Plan Detail View
- [ ] Story 12: Mobile-Responsive Design

### Phase 2: Personalization
- [ ] Story 2: Current Plan Entry & Savings Comparison
- [ ] Story 4: User Registration & Authentication
- [ ] Story 3: Dollar-Centric Dashboard

### Phase 3: Notifications
- [ ] Story 5: Notification Preferences & Delivery
- [ ] Story 6: Premium Change Alerts

### Phase 4: Monetization
- [ ] Story 7: HealthCare.gov Handoff
- [ ] Story 9: Freemium Premium Features
- [ ] Story 10: Minimal Advertising

### Phase 5: Growth
- [ ] Story 11: SEO Landing Pages by Location

### Final
- [ ] Security review (auth, data handling, API keys)
- [ ] Legal review (disclaimers, privacy policy, terms)
- [ ] Load testing before OEP
- [ ] Beta testing with real users in NC

---

## Success Criteria for MVP (Pre-OEP Launch)
1. User can compare plans by ZIP/household/income in < 5 minutes
2. Results show clear dollar amounts and savings opportunities
3. Optional account creation works with email verification
4. Basic email notifications functional
5. Mobile experience is smooth
6. Zero storage of sensitive health data
7. Proper disclaimers in place

---

*PRD Created: January 2026*
*Target Launch: November 2026 OEP*
*Author: Claude + Human collaboration*
