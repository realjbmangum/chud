# Heirloom - Co-Founder Roadmap

**Last Updated:** February 2, 2026
**Co-Founders:** Brian Mangum (Tech) & Oliver Lollis (Business/SWITCH)
**Status:** MVP ~50% Complete → Building Consumer Product

---

## Roles & Ownership

- **Brian:** Tech co-founder, builder, product development
- **Oliver:** Business co-founder, face of Heirloom, networking, business development
- **Ownership:** 50/50
- **Communication:** Weekly Monday calls + async as needed
- **Launchpad:** Oliver handles Wednesday calls, pulls Brian in for key meetings

---

## Strategic Direction (Decided Jan 2026)

### Business Model Priority
1. **Consumer platform FIRST** — nail the user experience
2. **Enterprise / HaaS SECOND** — only after consumer product is proven

### Enterprise Verticals (Future)
- Financial advisors / wealth planners (Atlanta capital firm already interested)
- Funeral homes
- Churches (community legacy preservation)
- Estate planners
- Health/caregiving (CaringBridge-style use case)

### Flywheel
**Community is the growth engine.** Public profiles, family tree discovery, tagging people, shared stories — users drive growth organically. Build the house, let families make it their own.

### Exit Strategy
Both aligned on build-to-sell. No specific number yet — agreed to develop this further.

### Competitive Positioning
- Most competitors sell digital versions of physical products (books, prints)
- Heirloom is a digital platform — "Facebook for families that never dies"
- Enterprise angle (HaaS) is unique — no one else is doing it
- TAM: everyone with a family story to tell

---

## ✅ What's Done

| Layer | Status |
|-------|--------|
| Brand Identity | Complete (manifesto, tone, typography, colors, visual direction) |
| MVP Feature Spec | Complete — decisions finalized Feb 2026 |
| Tech Stack | Decided (Next.js + React Native + Supabase) |
| Security Architecture | Documented (zero-knowledge encryption, Option C) |
| Database Schema | Deployed to Supabase (9 tables with RLS) |
| Prompt Library | ~300-400 prompts created |
| Mobile App UI | Polished mockup with animations |
| Web Landing Page | Live at theheirloom.site — reviewed and hardened |
| Waitlist | Collecting emails via Supabase |

---

## ❌ What's Next

### Phase 1: Ship Consumer MVP

#### For Brian (Tech)
1. [ ] Implement Supabase authentication (email + password)
2. [ ] Connect app to real database (replace mock data)
3. [ ] Build recording functionality (audio + video, 5-min max)
4. [ ] Record to device, upload when ready
5. [ ] Add wifi-only upload setting
6. [ ] On-device video compression before upload
7. [ ] 5 GB storage limit per user
8. [ ] Family invite flow (email invites)
9. [ ] Upgrade Supabase to Pro plan ($25/mo) before production

#### For Oliver (Business)
1. [ ] Log into theheirloom.site and test — give Brian feedback
2. [ ] Continue Launchpad Wednesday calls, relay key info
3. [ ] Explore entity formation: S-corp in opportunity zone
4. [ ] Follow up with Atlanta capital firm on enterprise interest
5. [ ] Validate HaaS opportunity with 3-5 advisors/planners

### Phase 2: Entity Formation & Legal
- [ ] File S-corp in opportunity zone (Launchpad guidance)
- [ ] Open business bank account under entity
- [ ] Set up Stripe for payments
- [ ] Trademark "Heirloom"
- [ ] Co-founder agreement (equity, vesting, IP assignment)

### Phase 3: Enterprise / HaaS (After Consumer MVP)
- [ ] Advisor dashboard (separate interface from consumer)
- [ ] Client vault management
- [ ] White-label options
- [ ] Reporting/analytics for advisors
- [ ] Enterprise pricing model

---

## Open Questions

### Still Need to Discuss
1. How do we handle deceased family members in the vault?
2. Exit strategy — develop specific targets/numbers
3. Oliver's capacity: part-time vs full-time?
4. SWITCH resources available for Heirloom?
5. Video transcoding strategy (deferred from MVP, need plan for scale)

### Resolved
- Prompts: ~300-400 at launch ✅
- Recording length: 5 min max ✅
- Categories: optional ✅
- Offline: record to device, upload when ready ✅
- Wifi-only upload setting ✅
- Storage: 5 GB per user ✅
- Pricing: everything free in MVP ✅
- Plan: individual only, no family plan at launch ✅
- Entity: S-corp in opportunity zone (pending formation) ✅
- Ownership: 50/50 ✅
- Roles: Brian = tech, Oliver = business/face ✅

---

## Key References

| Document | Path |
|----------|------|
| Call Notes (Jan 27) | `notes/call-2026-01-27.md` |
| MVP Features | `planning/MVP-FEATURES.md` |
| Tech Stack | `planning/TECH-STACK.md` |
| Security Architecture | `planning/SECURITY-ARCHITECTURE.md` |
| Database Schema | `planning/DATABASE-SCHEMA.md` |
| Brand Identity | `docs/Brand-Identity-Direction.md` |
| Manifesto | `docs/The-Heirloom-Manifesto.md` |
| Progress Log | `progress.txt` |

---

**This document is a living roadmap. Update as decisions are made.**
