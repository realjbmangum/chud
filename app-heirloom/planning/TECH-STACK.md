# Heirloom Technical Architecture

**Last Updated:** December 1, 2025
**Status:** Draft - Decisions Needed
**Owner:** Brian

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Mobile App    │   Landing Page  │   Web App (Future)      │
│ (React Native)  │    (Next.js)    │     (Next.js)           │
└────────┬────────┴────────┬────────┴────────┬────────────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                    ┌──────▼──────┐
                    │   API Layer │
                    │  (Supabase) │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
   ┌─────▼─────┐    ┌──────▼──────┐   ┌─────▼─────┐
   │  Auth     │    │  Database   │   │  Storage  │
   │ (Supabase)│    │ (PostgreSQL)│   │ (Supabase)│
   └───────────┘    └─────────────┘   └───────────┘
```

---

## Key Decisions

### Decision 1: Mobile Framework

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **React Native** | Large ecosystem, JS skills transfer, Expo simplifies dev | Performance ceiling, native module headaches | **Recommended** |
| Flutter | Great performance, beautiful UI, single codebase | Dart learning curve, smaller ecosystem | Strong alternative |
| PWA | No app store, instant updates, single codebase | Limited native APIs, no push notifications (iOS), storage limits | Not for MVP |

**Recommendation:** React Native with Expo
- Faster development with Expo managed workflow
- Easy audio/video recording with expo-av
- Can eject to bare workflow if needed later
- Strong community support

---

### Decision 2: Backend Platform

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Supabase** | PostgreSQL, real-time, auth built-in, generous free tier, open source | Newer, smaller community than Firebase | **Recommended** |
| Firebase | Mature, excellent docs, Google scale | NoSQL (Firestore), vendor lock-in, costs scale poorly | Good but not ideal |
| AWS Amplify | Full AWS ecosystem, enterprise-grade | Complex, steep learning curve, overkill for MVP | Overkill |
| Custom (Node + PostgreSQL) | Full control, no vendor lock-in | Build everything yourself, slower to MVP | Not for MVP |

**Recommendation:** Supabase
- PostgreSQL is better for relational data (families, relationships, permissions)
- Built-in auth, storage, real-time subscriptions
- Row Level Security (RLS) for granular permissions
- Self-host option if we outgrow managed service
- Active development, growing ecosystem

---

### Decision 3: File Storage

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Supabase Storage** | Integrated with auth/RLS, simple | Limited transform options | **Recommended for MVP** |
| Cloudflare R2 | Cheap, no egress fees, S3 compatible | Separate service to manage | Consider for scale |
| AWS S3 | Industry standard, mature | Egress costs, complexity | Overkill for MVP |
| Wasabi | Cheap storage | Less ecosystem integration | Consider for scale |

**Recommendation:** Supabase Storage for MVP
- Integrated permissions with database
- Simple upload/download APIs
- Can migrate to R2/S3 later if costs become issue

---

### Decision 4: Authentication

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Supabase Auth** | Integrated, simple, supports OAuth | Fewer enterprise features | **Recommended** |
| Auth0 | Feature-rich, enterprise-grade | Expensive at scale, separate service | Overkill |
| Firebase Auth | Mature, well-documented | Ties you to Firebase ecosystem | Not if using Supabase |
| Custom | Full control | Security risk, slow to build | Never for auth |

**Recommendation:** Supabase Auth
- Email/password + magic links
- Social login (Google, Apple) when ready
- Integrates with RLS for database security
- No additional service to manage

---

### Decision 5: Landing Page / Marketing Site

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Next.js** | React-based, great DX, Vercel hosting | May be overkill for simple landing | **Recommended** |
| Webflow | No-code, fast iteration | Cost, less control | Good for non-technical |
| Plain HTML/CSS | Simple, fast | Hard to maintain | Too basic |
| Astro | Fast, modern | Smaller ecosystem | Good alternative |

**Recommendation:** Next.js on Vercel
- Same React skills as mobile app
- Easy deployment on Vercel
- Can grow into full web app
- Great SEO support

---

## Recommended Stack Summary

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Mobile App** | React Native + Expo | Fast development, good AV support |
| **Landing Page** | Next.js + Vercel | React skills, easy deploy, SEO |
| **Backend/API** | Supabase | All-in-one, PostgreSQL, real-time |
| **Database** | PostgreSQL (via Supabase) | Relational data, RLS |
| **Auth** | Supabase Auth | Integrated, secure |
| **File Storage** | Supabase Storage | Integrated, simple |
| **Encryption** | TBD - See Security Architecture | Critical decision pending |

---

## Development Tools

| Tool | Purpose |
|------|---------|
| **TypeScript** | Type safety across frontend and backend |
| **ESLint + Prettier** | Code quality and formatting |
| **GitHub** | Source control, issues, PRs |
| **GitHub Actions** | CI/CD pipeline |
| **Expo EAS** | Mobile app builds and submissions |
| **Vercel** | Landing page hosting and preview deploys |

---

## Infrastructure Costs (Estimated MVP)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Supabase | Pro | $25 |
| Vercel | Hobby/Pro | $0-20 |
| Expo EAS | Production | $99 |
| Apple Developer | Annual | $8.25/mo |
| Google Play | One-time | $2.08/mo |
| Domain | Annual | ~$1/mo |
| **Total** | | **~$135-155/mo** |

*Note: Storage costs will increase with users. Budget for ~$0.10-0.20/GB/month.*

---

## Repository Structure

```
heirloom/
├── apps/
│   ├── mobile/          # React Native + Expo
│   │   ├── src/
│   │   ├── app.json
│   │   └── package.json
│   └── web/             # Next.js landing + web app
│       ├── src/
│       ├── next.config.js
│       └── package.json
├── packages/
│   ├── shared/          # Shared types, utils, constants
│   └── ui/              # Shared UI components (if applicable)
├── supabase/
│   ├── migrations/      # Database migrations
│   ├── functions/       # Edge functions
│   └── seed.sql         # Seed data
├── docs/
├── planning/
└── package.json         # Monorepo root (pnpm workspaces)
```

**Monorepo Tooling:** pnpm workspaces + Turborepo

---

## Technical Risks

### 1. Video Upload on Mobile
**Risk:** Large video files may fail to upload on poor connections
**Mitigation:**
- Implement chunked/resumable uploads
- Compress video before upload
- Show progress and allow background upload
- Expo has built-in support via expo-file-system

### 2. Storage Costs at Scale
**Risk:** Video storage could become expensive
**Mitigation:**
- Implement storage limits per tier
- Transcode to efficient formats (H.264/H.265)
- Consider tiered storage (hot/cold) for old content
- Monitor costs closely, migrate to R2 if needed

### 3. Offline Recording
**Risk:** Users expect to record without internet
**Mitigation:**
- Store recordings locally first
- Sync when connection available
- Clear UX for "pending upload" state
- Expo-av supports local recording

### 4. Audio/Video Playback
**Risk:** Inconsistent playback across devices
**Mitigation:**
- Use standard formats (MP4/H.264, AAC)
- Expo-av handles cross-platform playback
- Test on older devices

---

## Open Questions

1. **Zero-knowledge encryption:** How does this integrate with Supabase? May need custom encryption layer. See `SECURITY-ARCHITECTURE.md`.

2. **Transcription:** Do we want audio/video transcription? Options:
   - Whisper API (OpenAI)
   - AssemblyAI
   - Deepgram
   - Run Whisper ourselves

3. **Push notifications:** Which service?
   - Expo Push (simplest)
   - OneSignal
   - Firebase Cloud Messaging

4. **Analytics:** What do we track?
   - Mixpanel
   - PostHog (self-hostable)
   - Amplitude

---

## Next Steps

1. [ ] Finalize stack decisions with Oliver
2. [ ] Set up GitHub repository structure
3. [ ] Create Supabase project
4. [ ] Draft database schema
5. [ ] Draft security architecture (encryption approach)
6. [ ] Initialize Expo app
7. [ ] Initialize Next.js landing page
