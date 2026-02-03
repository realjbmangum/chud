# Heirloom - Technical Co-Founder Next Steps

**Last Updated:** November 24, 2025
**Co-Founders:** Brian McCullough (Tech) & Oliver Lollis (SWITCH)
**Status:** Brand Foundation Complete → Moving to Product Definition

---

## ✅ What We Have (Brand Foundation Complete)

### Documentation
- **The Heirloom Manifesto** - Core mission and emotional foundation
- **One Page Narrative** - Product vision, purpose, and positioning
- **Tone-of-Voice Guidelines** - Complete communication standards
- **Brand Identity Direction** - Visual system (colors, mood, references)
- **Typography System** - Font hierarchy and usage guidelines

### Brand Assets Defined
- **Color Palette:** Heritage Green (#0C3B2E), Heirloom Gold (#C4A464), Ivory Linen (#F8F5EE), Memory Blue (#91A8C0), Charcoal Ink (#2A2A2A)
- **Typography:** Cormorant Garamond (serif/emotion), Inter (sans/function), Playfair Display (luxury accents)
- **Voice:** Warm, eternal, trustworthy, human
- **Visual Style:** Documentary warmth, golden-hour tones, crafted elegance

### Target Audience Defined
- **Primary:** Families (parents, grandparents, children seeking generational connection)
- **B2B (HaaS):** Financial advisors, estate planners, faith leaders, caregivers

---

## ❌ What We Need (Technical & Product Definition)

### Phase 1: Product Definition (URGENT - NEXT 2 WEEKS)

#### 1. MVP Feature Specification
**Priority:** CRITICAL
**Owner:** Brian + Oliver
**Deliverable:** `planning/MVP-FEATURES.md`

Define exactly what the MVP includes:
- [ ] Core user flows (onboarding, recording, vault access, sharing)
- [ ] Feature list with Must-Have / Nice-to-Have / Future tiers
- [ ] User stories for each persona (parent, grandparent, child, advisor)
- [ ] Success metrics and KPIs

**Questions to Answer:**
- What can users do in V1?
- What gets pushed to V2/V3?
- How does the 5-minute experience actually work?
- What does "zero-knowledge encryption" mean technically?

---

#### 2. Technical Architecture
**Priority:** CRITICAL
**Owner:** Brian
**Deliverable:** `planning/TECH-STACK.md`

Define the technology foundation:
- [ ] Frontend framework (React Native? Flutter? Progressive Web App?)
- [ ] Backend stack (Node.js, Python, Go?)
- [ ] Database (PostgreSQL, MongoDB, Firebase?)
- [ ] File storage (AWS S3, Cloudflare R2, encrypted vault solution?)
- [ ] Authentication (Auth0, Supabase Auth, custom?)
- [ ] Encryption strategy (E2E encryption, key management, zero-knowledge architecture)
- [ ] Hosting/Infrastructure (AWS, Google Cloud, Vercel, Railway?)
- [ ] CI/CD pipeline

**Questions to Answer:**
- Mobile-first or web-first?
- Self-hosted or cloud-managed services?
- How do we implement zero-knowledge encryption without losing data if users lose keys?
- What's the data retention/backup strategy?

---

#### 3. Security & Privacy Architecture
**Priority:** CRITICAL
**Owner:** Brian (research + design)
**Deliverable:** `planning/SECURITY-ARCHITECTURE.md`

Detail the zero-knowledge encryption implementation:
- [ ] Key generation and management (how do users access across devices?)
- [ ] Encryption at rest and in transit
- [ ] Multi-device synchronization without server-side decryption
- [ ] Family vault sharing mechanism (encrypted shares?)
- [ ] Password recovery without compromising zero-knowledge promise
- [ ] GDPR/CCPA compliance
- [ ] Data deletion and right-to-be-forgotten

**Questions to Answer:**
- How does zero-knowledge encryption work with family sharing?
- What happens if a user forgets their master password?
- How do we prove we can't access user data (trust model)?

---

#### 4. Database Schema & Data Model
**Priority:** HIGH
**Owner:** Brian
**Deliverable:** `planning/DATABASE-SCHEMA.md`

Design the data structure:
- [ ] User/Account model (individuals, families, organizations)
- [ ] Vault model (family vaults, personal vaults, shared vaults)
- [ ] Content model (voice notes, videos, photos, letters, stories)
- [ ] Metadata structure (tags, dates, people, relationships)
- [ ] Permissions model (who can view/edit/share what)
- [ ] Timeline/chronology system
- [ ] Encryption key storage (if applicable)

**Questions to Answer:**
- How do we model family relationships?
- What metadata is searchable vs. private?
- How do we handle large media files efficiently?

---

#### 5. UI/UX Wireframes & User Flows
**Priority:** HIGH
**Owner:** Brian + Oliver (or hire designer?)
**Deliverable:** `designs/wireframes/` folder

Create low-fidelity wireframes:
- [ ] Onboarding flow (account creation, vault setup)
- [ ] Recording experience (voice note, video, photo upload)
- [ ] Vault browsing (timeline view, search, filters)
- [ ] Sharing flow (invite family, set permissions)
- [ ] Settings (security, account, notifications)
- [ ] HaaS advisor dashboard (if needed for MVP)

**Tools:** Figma, Sketch, or hand-drawn → digitized

---

### Phase 2: Business Model & GTM (NEXT 30 DAYS)

#### 6. Pricing & Business Model
**Priority:** HIGH
**Owner:** Oliver + Brian
**Deliverable:** `planning/BUSINESS-MODEL.md`

Define revenue streams:
- [ ] Consumer pricing tiers (free tier? freemium? subscription?)
- [ ] HaaS (Heirloom as a Service) pricing for advisors
- [ ] Storage limits per tier
- [ ] Feature gating strategy
- [ ] Lifetime vs. subscription debate
- [ ] Enterprise/white-label options

**Questions to Answer:**
- What's the sustainable pricing model?
- How much does storage/encryption infrastructure cost per user?
- What's the unit economics?

---

#### 7. Go-to-Market Strategy
**Priority:** MEDIUM
**Owner:** Oliver (lead) + Brian (support)
**Deliverable:** `planning/GTM-STRATEGY.md`

Plan the launch:
- [ ] Beta testing strategy (who, how many, timeline)
- [ ] Launch channels (Product Hunt, social, advisors network)
- [ ] Partnership strategy (financial advisors, estate planners)
- [ ] Content marketing plan (blog, LinkedIn, storytelling)
- [ ] Paid acquisition strategy (if any)
- [ ] Referral/viral loop design

---

#### 8. Roadmap & Timeline
**Priority:** HIGH
**Owner:** Brian + Oliver
**Deliverable:** `planning/PRODUCT-ROADMAP.md`

Create a realistic timeline:
- [ ] MVP feature set + launch date target
- [ ] Development milestones (alpha, beta, launch)
- [ ] Post-launch feature releases (V1.1, V1.2, V2.0)
- [ ] Resource needs (hiring, contractors, tools)
- [ ] Budget allocation

---

### Phase 3: Legal & Compliance (NEXT 60 DAYS)

#### 9. Legal Foundation
**Priority:** MEDIUM
**Owner:** Oliver + Brian (consult lawyer)
**Deliverable:** Legal documents folder

Set up legal structure:
- [ ] Company formation (LLC, C-Corp, Delaware vs. other?)
- [ ] Co-founder agreement (equity split, vesting, IP assignment)
- [ ] Terms of Service
- [ ] Privacy Policy (GDPR, CCPA compliant)
- [ ] Data Processing Agreement (for HaaS clients)
- [ ] Trademark application for "Heirloom" (check availability)

---

### Phase 4: Development Setup (WEEK 1-2)

#### 10. Development Environment
**Priority:** HIGH (once tech stack decided)
**Owner:** Brian
**Deliverable:** Working dev environment

Set up infrastructure:
- [ ] GitHub repository structure (monorepo vs. separate repos?)
- [ ] Local development environment setup guide
- [ ] CI/CD pipeline (GitHub Actions, CircleCI?)
- [ ] Staging environment
- [ ] Code quality tools (linting, formatting, testing)
- [ ] Documentation standards

---

## 🎯 Immediate Action Items (This Week)

### For Brian (Tech Co-Founder)
1. **Schedule co-founder alignment meeting with Oliver**
   - Review brand docs together
   - Align on MVP vision
   - Agree on decision-making process

2. **Research zero-knowledge encryption solutions**
   - Evaluate: Keybase architecture, Signal Protocol, Etebase, E3DB
   - Document pros/cons for family sharing use case
   - Prototype concept if needed

3. **Draft MVP feature spec**
   - Start with user stories
   - Prioritize ruthlessly (what's truly minimum?)
   - Share with Oliver for feedback

4. **Evaluate tech stack options**
   - Research: Supabase, Firebase, AWS Amplify for backend
   - Mobile: React Native vs. Flutter vs. PWA
   - Create comparison doc

### For Oliver (Business Co-Founder)
1. **Validate HaaS opportunity**
   - Interview 3-5 financial advisors/estate planners
   - Understand their pain points with legacy planning
   - Validate willingness to pay for Heirloom

2. **Define pricing strategy**
   - Research competitors (FamilySearch, StoryWorth, Legacy.com)
   - Survey potential users on willingness to pay
   - Draft initial pricing tiers

3. **Create go-to-market hypothesis**
   - Who's the earliest adopter segment?
   - What's the MVP launch channel?
   - How do we get first 100 users?

---

## 📊 Success Metrics (Define Together)

### Product Metrics (TBD)
- Time to first recording
- Recording completion rate
- Vault revisit frequency
- Family member invites sent
- Content uploaded per user

### Business Metrics (TBD)
- CAC (Customer Acquisition Cost)
- LTV (Lifetime Value)
- Conversion rate (free → paid)
- Churn rate
- HaaS partner acquisition rate

---

## 🚨 Risks & Open Questions

### Technical Risks
- **Zero-knowledge encryption complexity:** Can we deliver on this promise without making UX terrible?
- **Storage costs:** How do we make unlimited generational storage economically viable?
- **Platform decision:** Mobile-first vs. web-first significantly impacts development timeline

### Business Risks
- **Market validation:** Is the pain point strong enough for people to pay?
- **Competition:** How do we differentiate from free solutions (Google Photos, iCloud)?
- **HaaS adoption:** Will advisors actually integrate this into their practice?

### Open Questions for Oliver
1. What's your vision for V1 launch date?
2. Do we have any funding? Bootstrap vs. raise?
3. What's your capacity/role (part-time vs. full-time)?
4. What resources can SWITCH provide (network, marketing, etc.)?

### Open Questions for Brian
1. What's your capacity/timeline (full-time vs. nights/weekends)?
2. Do we build, buy, or partner for encryption infrastructure?
3. What's the technical complexity level you're comfortable with?

---

## 📚 Resources & Research

### Competitor Analysis Needed
- **StoryWorth** - Prompts + book printing
- **Legacy.com** - Obituaries + memorials
- **FamilySearch** - Genealogy + stories
- **1Password Families** - Shared vault concept (different use case but similar UX)
- **Signal** - Zero-knowledge messaging (technical reference)

### Technologies to Evaluate
- **Encryption:** Etebase, E3DB, Keybase architecture
- **Backend:** Supabase, Firebase, AWS Amplify
- **Mobile:** React Native, Flutter, Ionic
- **Storage:** Cloudflare R2, Wasabi, AWS S3 + Glacier
- **Auth:** Supabase Auth, Auth0, Firebase Auth

---

## 📞 Next Meeting Agenda

**Suggested Topics:**
1. Review brand docs together (Oliver's reaction?)
2. Align on MVP vision (what's in, what's out)
3. Discuss co-founder equity and roles
4. Set timeline expectations (launch target?)
5. Decide on funding approach (bootstrap, friends/family, accelerator?)
6. Assign first week action items

---

**This document is a living roadmap. Update as decisions are made.**
