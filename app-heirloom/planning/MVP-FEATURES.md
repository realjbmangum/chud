# Heirloom MVP Feature Specification

**Last Updated:** February 2, 2026
**Status:** Decisions Finalized
**Owners:** Brian + Oliver

---

## MVP Philosophy

Ship the smallest product that delivers on the core promise:
**"Preserve your family's stories with guided prompts and secure storage."**

The MVP must prove:
1. People will record memories when prompted
2. Families will share and view each other's stories
3. Users trust us with their most precious content

---

## Feature Tiers

### Must-Have (V1 MVP)

#### User Management
- [ ] Account creation (email + password)
- [ ] Basic profile (name, photo, family role)
- [ ] Password reset flow
- [ ] Session management (stay logged in)

#### Recording Experience
- [ ] Daily prompted question on home screen
- [ ] Audio recording (primary)
- [ ] Video recording (primary)
- [ ] **Max recording length: 5 minutes**
- [ ] Media upload from device (photos, existing videos)
- [ ] Category selection — **optional** (Childhood, Career, Family, Faith, Legacy)
- [ ] Title/name the memory
- [ ] "Choose another prompt" - refresh prompt
- [ ] **Record to device, upload when ready** (no background sync)
- [ ] **Wifi-only upload setting** in user preferences

#### Personal Vault (My Vault)
- [ ] View all personal recordings
- [ ] Horizontal scroll / card-based UI
- [ ] Sort by date (newest first)
- [ ] Filter by category
- [ ] Playback audio/video
- [ ] View photos with captions

#### Family Vault
- [ ] Invite family members (email invite)
- [ ] Accept family invitation
- [ ] View family members' shared content
- [ ] "What's new" feed of recent family stories
- [ ] Filter by category
- [ ] Basic permissions (view only for now)

#### Security (Core Promise)
- [ ] Encrypted storage at rest
- [ ] HTTPS everywhere
- [ ] Secure authentication
- [ ] Private by default (explicit sharing required)

#### Landing Page
- [ ] Hero section with value proposition
- [ ] Feature highlights
- [ ] How it works (3-step)
- [ ] Pricing display
- [ ] Sign up / Sign in CTAs
- [ ] Footer (About, FAQ, Terms, Privacy, Contact)

---

### Nice-to-Have (V1.1)

#### Enhanced Recording
- [ ] Custom prompt creation ("Create my own legacy question")
- [ ] Prompt categories/themes
- [ ] Recording tags (people, places, dates)
- [ ] Transcription of audio/video

#### Enhanced Vault
- [ ] Search within vault
- [ ] Shuffle/random story feature
- [ ] Timeline view
- [ ] Story collections/albums

#### Family Features
- [ ] Family tree visualization
- [ ] Tagging family members in stories
- [ ] Comments/reactions on stories
- [ ] Edit permissions (not just view)

#### Time Capsules (V1.1 or V1.2)
- [ ] Create time capsule
- [ ] Select recipients (one or many)
- [ ] Set release date
- [ ] Select content from vault
- [ ] Record new content for capsule
- [ ] Notification on release date
- [ ] Capsule reveal experience

---

### Future (V2+)

#### Advanced Features
- [ ] AI-generated prompts based on history
- [ ] Story suggestions based on family gaps
- [ ] Collaborative storytelling (multiple people, one story)
- [ ] Memory books (print-on-demand)
- [ ] Legacy letters/written content
- [ ] Voice cloning / AI enhancement
- [ ] Family history integration (Ancestry, FamilySearch)

#### HaaS (Heirloom as a Service)
- [ ] Advisor dashboard
- [ ] Client vault management
- [ ] White-label options
- [ ] Bulk family invitations
- [ ] Reporting/analytics for advisors

#### Platform Expansion
- [ ] Desktop app
- [ ] Smart TV viewing app
- [ ] Voice assistant integration (Alexa, Google)

#### Media Processing
- [ ] Video transcoding (compress server-side to reduce storage costs)

#### Community & Discovery (Potential Flywheel)
- [ ] Public profiles (opt-in)
- [ ] Search/tag people by name
- [ ] Family tree browsing and connections
- [ ] Groupings (by family, region, heritage)
- [ ] Community feed of public stories

---

## User Stories (V1 MVP)

### As a Parent
- I want to answer a daily prompt so my children can hear my stories someday
- I want to see what my parents have recorded so I can learn about their lives
- I want to invite my family so we can build a shared legacy together

### As a Grandparent
- I want simple prompts so I know what stories to tell
- I want to record easily so technology doesn't stop me from sharing
- I want to know my stories are safe and will last beyond me

### As an Adult Child
- I want to receive my family's stories so I can know them better
- I want to filter by topic so I can find stories relevant to my life now
- I want to be notified when family adds new content so I stay connected

---

## User Flows (V1 MVP)

### Onboarding Flow
```
Download App → Create Account → Set Profile →
Invite Family (optional, can skip) → First Prompt →
Record First Story → View in Vault → Success!
```

### Daily Recording Flow
```
Open App → See Daily Prompt → Tap Record →
Choose Audio/Video → Record → Review →
Select Category → Name It → Save to Vault
```

### Family Connection Flow
```
Tap Invite Family → Enter Email(s) → Send Invite →
Invitee Receives Email → Creates Account →
Accepts Family Connection → Appears in Family Vault
```

### Content Viewing Flow
```
Open App → Tap My Vault or Family Vault →
Scroll/Browse Cards → Tap Card → Playback →
(Optional) Filter by Category
```

---

## Success Metrics

### Activation
- **Time to first recording:** Target < 5 minutes from signup
- **First-day recording rate:** Target > 50% of new users

### Engagement
- **Weekly active recording:** Target > 1 recording/week for active users
- **Vault revisit rate:** Target > 2x/week viewing own or family content
- **Family invites sent:** Target > 2 invites per user in first week

### Retention
- **Week 1 retention:** Target > 60%
- **Month 1 retention:** Target > 40%
- **Recording streak:** Track users with 7+ consecutive days

### Growth
- **Family invite acceptance rate:** Target > 50%
- **Viral coefficient:** Target > 1.0 (each user brings 1+ new users)

---

## Resolved Questions (Feb 2, 2026)

### Product
1. **Prompts at launch:** ~300-400 prompts already created ✅
2. **Max recording length:** 5 minutes for MVP ✅
3. **Category selection:** Optional for MVP ✅
4. **Deceased family members:** Still needs discussion with Oliver ⚠️

### Technical
1. **Storage limit per user:** 5 GB for MVP. Note: Supabase Free plan only includes 1 GB total with 50 MB max file size. Will need Pro plan ($25/mo) for production — gives 100 GB storage. ✅
2. **Large video files:** Record to device, upload when ready. Wifi-only upload setting available. Compress on-device where possible. ✅
3. **Transcoding:** Store originals for MVP. Server-side transcoding deferred to future feature. ✅
4. **Offline recording:** Record to device locally, user uploads manually when ready. No background sync for MVP. ✅

### Business
1. **Free vs. paid:** Everything free in MVP ✅
2. **Launch plan:** Individual plan only, no Family Plan at launch ✅
3. **Trial period:** No trial — all free ✅

---

## Dependencies

- ~~**Tech Stack Decision**~~ ✅ Decided: Next.js + React Native + Supabase
- ~~**Security Architecture**~~ ✅ Documented (zero-knowledge encryption, Option C)
- ~~**Brand Assets**~~ ✅ Complete (colors, fonts, tone, identity)
- ~~**Prompt Library**~~ ✅ 300-400 prompts created

---

## Next Steps

1. [x] Review with Oliver - align on feature priorities
2. [x] Answer open questions (1 remaining: deceased family members)
3. [ ] Discuss with Oliver: handling deceased family members in vault
4. [ ] Create detailed user flow diagrams
5. [ ] Draft technical architecture
6. [ ] Upgrade Supabase to Pro plan before production launch
7. [ ] Implement on-device compression for video recordings
