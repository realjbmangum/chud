# PRD: Veterinary Education YouTube Channel

## Overview
Launch a YouTube channel that translates veterinary medical information into plain language for pet owners. Content will bridge the gap between complex vet terminology and what regular pet owners need to know. Using AI presenter (HeyGen) + AI voiceover (ElevenLabs) to maintain visual authority while keeping production costs low. Primary focus is reaching YouTube monetization threshold (1,000 subscribers, 4,000 watch hours) to validate business model.

**Target audience:** Pet owners who want to understand their vet's advice, medical terms, and make informed decisions about their pets' health.

## Goals
1. **Revenue validation:** Reach YouTube Partner Program requirements (1k subs, 4k watch hours) to unlock monetization
2. **Content validation:** Publish 12 videos in first month to identify which topics perform (expecting 1-in-5 hit rate)
3. **Workflow efficiency:** Establish 4-5 hour per-video production process that's sustainable at 3 videos/week

## Non-Goals (Critical - what we are NOT building)
- **Not providing veterinary diagnosis or medical advice** - Educational translation only, always defer to licensed vets
- **Not building automation tools yet** - Wait until channel revenue justifies tool investment (post-monetization)
- **Not hiring talent or contractors** - Solo operation with AI presenters to keep costs under $50/month
- **Not pursuing sponsorships yet** - Focus on organic ad revenue first, sponsor ethics are complex with AI presenters
- **Not expanding to other platforms** - YouTube only for now (no TikTok, Instagram Reels, etc.)
- **Not creating courses or backend products** - Pure ad-revenue model until proven

## User Stories

### Story 1: YouTube Channel Setup
**As a** content creator
**I want to** set up a professional YouTube channel with proper branding
**So that** viewers take the content seriously and understand it's AI-assisted educational content

**Acceptance Criteria:**
- [ ] Channel created with clear name (e.g., "PetMed Explained", "Vet Terms Translated")
- [ ] Channel banner and profile image created (can use Canva free)
- [ ] About section includes: "AI-assisted educational content. Not veterinary advice. Always consult your vet."
- [ ] Video description template created with disclaimer and source citation format
- [ ] Verify in YouTube Studio: channel appears professional and disclaimer is visible

**Technical Notes:**
- Channel name should be searchable and indicate veterinary education
- Consider SEO: "vet", "pet health", "pet care" in name/description

### Story 2: AI Presenter Creation
**As a** content creator
**I want to** create a trustworthy-looking AI presenter avatar
**So that** viewers perceive the content as authoritative without needing to be on camera

**Acceptance Criteria:**
- [ ] HeyGen account created (Creator plan: $24/month annual or $29/month monthly)
- [ ] Test 5-10 different avatar variations (age, gender, presentation style)
- [ ] Select avatar that looks professional, warm, and trustworthy for pet education
- [ ] Test 30-second sample video with script to verify lip sync and naturalness
- [ ] Avatar can be used with custom audio (ElevenLabs integration if HeyGen supports it)
- [ ] Verify in video preview: avatar doesn't look uncanny, movements are natural

**Technical Notes:**
- Reddit poster mentioned testing 15 reference photos before finding good one
- Consider older-looking avatar (30s-40s) for more perceived authority
- Test both male and female options to see what resonates

### Story 3: Voice Selection (ElevenLabs)
**As a** content creator
**I want to** create a clear, trustworthy voiceover
**So that** content is easy to understand and pleasant to listen to

**Acceptance Criteria:**
- [ ] Test 5-10 different ElevenLabs voices with sample script
- [ ] Select voice that is: clear, warm, authoritative but not condescending, medium pacing
- [ ] Verify voice matches avatar if using HeyGen with custom audio
- [ ] Test full 5-minute script to ensure voice doesn't become grating
- [ ] Clone or save voice settings for consistent reuse

**Technical Notes:**
- User already has ElevenLabs subscription (asset)
- Consider separate voice generation if HeyGen's built-in voices are insufficient
- Test if HeyGen accepts custom audio upload + lip sync

### Story 4: Research Workflow Template
**As a** content creator
**I want to** systematize research for each video topic
**So that** I can consistently produce well-sourced, accurate content in 4-5 hours

**Acceptance Criteria:**
- [ ] Create research checklist document with steps: topic selection, source gathering, fact extraction, citation formatting
- [ ] Identify 5-7 trusted veterinary sources (e.g., Cornell Vet School, UC Davis, AVMA, VCA Hospitals, PetMD)
- [ ] Create source citation template for video descriptions
- [ ] Test workflow on first video topic: "How to Read Pet Medication Labels"
- [ ] Document time spent on each research phase

**Technical Notes:**
- Sources must be institutional or academic, not random vet blogs
- Consider creating Notion or Google Doc template
- Track research time vs. scripting time vs. production time

### Story 5: Script Template
**As a** content creator
**I want to** a reusable script structure for videos
**So that** writing each script is faster and videos have consistent quality

**Acceptance Criteria:**
- [ ] Script template includes: hook (first 10 sec), problem statement, 3-5 main points, conclusion/CTA, disclaimer
- [ ] Script formatted for voiceover: short sentences, conversational tone, no complex words
- [ ] Built-in reminders for: B-roll cues, on-screen text suggestions, citation callouts
- [ ] Target length: 1,200-1,500 words for 5-7 minute video
- [ ] Test on first video script

**Technical Notes:**
- Reddit poster does 4-5 hours total per video, including research
- Script should be scannable with clear sections
- Consider Flesch-Kincaid readability score (aim for 8th grade level)

### Story 6: First Video Production - "How to Read Pet Medication Labels"
**As a** content creator
**I want to** produce and publish the first complete video
**So that** I can test the entire workflow and learn what needs improvement

**Acceptance Criteria:**
- [ ] Research completed: 5+ authoritative sources on pet medication safety
- [ ] Script written: 1,200-1,500 words, includes hook, 3-5 main points, disclaimer
- [ ] Voiceover generated (ElevenLabs or HeyGen built-in)
- [ ] AI presenter video generated in HeyGen
- [ ] B-roll sourced: Pexels or Pixabay (free) - medication bottles, pet images, vet office
- [ ] Video edited in CapCut: intro, presenter sections, B-roll overlay, captions, outro
- [ ] Thumbnail created (Canva): clear text, pet image, stands out in feed
- [ ] YouTube metadata: title, description with sources, tags, disclosure statement
- [ ] Published and live on YouTube
- [ ] Document total production time and pain points

**Technical Notes:**
- This is the learning video - expect it to take longer than 4-5 hours
- Document every step for future efficiency
- Note which parts are most time-consuming

### Story 7: Content Calendar - 12 Video Topics
**As a** content creator
**I want to** plan 12 video topics upfront
**So that** I'm never stuck wondering what to create next and can batch research

**Acceptance Criteria:**
- [ ] 12 topics identified across different sub-categories (medications, symptoms, procedures, costs, breed-specific)
- [ ] Topics prioritized by: search volume (Google Trends), personal interest, competitor gaps
- [ ] Publishing schedule: 3 videos/week for 4 weeks
- [ ] Each topic has 2-3 keyword phrases for SEO
- [ ] Topics avoid diagnosis or medical advice (educational translation only)

**Topic Ideas:**
1. How to Read Pet Medication Labels
2. What Your Dog's Blood Panel Results Actually Mean
3. When Limping Is an Emergency vs. Wait-and-See
4. Understanding Your Vet's Estimate: What You're Paying For
5. Common Dog Vaccines Explained: What They Protect Against
6. How to Give Your Pet Pills Without a Battle
7. Decoding Vet Terms: Arthritis, Dysplasia, and Other Scary Words
8. What "Dental Cleaning" Really Involves (And Why It Costs So Much)
9. Reading Cat Urinalysis Results: What's Normal, What's Not
10. Post-Surgery Care: What Your Vet Means by "Restrict Activity"
11. Understanding Pet Insurance: What's Actually Covered
12. Breed-Specific Health Issues: [Popular Breed] Owner's Guide

### Story 8: Video 2-4 Production (Week 1)
**As a** content creator
**I want to** produce videos 2, 3, and 4 in the first week
**So that** I establish consistent posting schedule and refine workflow

**Acceptance Criteria:**
- [ ] Videos 2-4 researched, scripted, produced, published
- [ ] Each video takes ≤5 hours total production time
- [ ] Posting schedule maintained: Mon/Wed/Fri or Tue/Thu/Sat
- [ ] Track which topics get traction (views in first 48 hours)
- [ ] Respond to all comments to boost engagement
- [ ] Document workflow improvements vs. Video 1

### Story 9: Analytics Review & Iteration (End of Week 2)
**As a** content creator
**I want to** analyze first week's performance
**So that** I can double down on what works and adjust what doesn't

**Acceptance Criteria:**
- [ ] YouTube Studio analytics reviewed: views, watch time, CTR, average view duration
- [ ] Identify which topics/thumbnails/titles performed best
- [ ] Read all comments for content ideas and audience questions
- [ ] Adjust content calendar based on learnings
- [ ] Document findings: what worked, what flopped, what to change

**Technical Notes:**
- First week data will be limited but directional
- Look for: which topics get higher CTR, which keep viewers watching longer
- Comment themes = future video ideas

### Story 10: Videos 5-12 Production (Weeks 2-4)
**As a** content creator
**I want to** complete the 12-video validation phase
**So that** I have enough data to know if this channel concept works

**Acceptance Criteria:**
- [ ] Videos 5-12 researched, scripted, produced, published on schedule
- [ ] 3 videos/week maintained consistently (no gaps)
- [ ] Workflow optimized to 4-5 hours per video
- [ ] Respond to every comment within 24 hours
- [ ] Track cumulative subscribers and watch hours weekly
- [ ] Document which videos are "hits" (outlier performance)

**Success Metrics:**
- Target by end of Week 4: 200-500 subscribers, 1,000+ watch hours
- Identify 2-3 topics that perform 3x better than others
- Establish sustainable production rhythm

### Story 11: Monetization Milestone Strategy
**As a** content creator
**I want to** create a plan to reach 1k subs and 4k watch hours
**So that** I can unlock YouTube ad revenue as soon as possible

**Acceptance Criteria:**
- [ ] Current metrics tracked: subs, watch hours, views per video
- [ ] Projection model: "If current rate continues, when will we hit 1k/4k?"
- [ ] Identify strategies to accelerate: better titles, thumbnails, topics, posting frequency
- [ ] Consider: shorts strategy (quick wins for subs), series/playlists (binge watch time)
- [ ] Set milestone check-ins: 250 subs, 500 subs, 1k watch hours, 2k watch hours

**Technical Notes:**
- Reddit poster hit 48k subs in 4 months, but expect slower start
- One viral video (280k views) drove 12k subs - aim for that hit
- Watch hours accumulate slower than subs typically

### Story 12: Post-Monetization - Tool Planning
**As a** content creator
**I want to** document production pain points throughout first month
**So that** I know exactly what to automate once channel revenue justifies it

**Acceptance Criteria:**
- [ ] Pain points log maintained throughout all 12 videos
- [ ] Time tracking by phase: research, scripting, voiceover, video generation, editing, publishing
- [ ] Identify highest-leverage automation opportunities (e.g., "research takes 2 hours, could be 30 min with tool")
- [ ] Document manual workflow in detail for future tool-building
- [ ] Estimate: If channel hits monetization, how much revenue would justify tool development?

**Technical Notes:**
- This sets up Phase 2 (tool building) which was explicitly deferred
- Channel needs to prove $500-1000/month revenue before investing in automation tools
- Document everything as if building for a future user

## Technical Considerations

**Platform & Tools:**
- **YouTube:** Primary distribution platform
- **HeyGen:** AI presenter video generation (Creator: $24/mo annual, $29/mo monthly)
- **ElevenLabs:** AI voiceover (user already has subscription)
- **CapCut:** Free video editing software
- **Pexels/Pixabay:** Free stock footage for B-roll
- **Canva:** Free thumbnail creation
- **Google Docs/Notion:** Research and scripting

**Content Stack:**
- Research sources: Cornell Vet School, UC Davis Veterinary Medicine, AVMA, VCA Hospitals, AKC, PetMD
- Citation format: In description, link all sources used
- Disclaimer: Every video includes "Not veterinary advice. Always consult your vet."

**Monetization Requirements:**
- 1,000 subscribers
- 4,000 watch hours (in last 12 months)
- AdSense account
- Channel follows YouTube Partner Program policies

**Risks:**
- **Accuracy liability:** Misinformation about pet health could harm animals - all info must be triple-checked
- **AI presenter backlash:** Some viewers may distrust content when they discover presenter isn't real
- **Slow growth:** May take 3-6 months to hit monetization, not 1 month
- **Topic saturation:** Some pet health topics are crowded
- **Algorithm dependence:** Need 1-in-5 hit rate, which requires luck + skill

**Cost Analysis:**
- HeyGen: $24-29/month
- ElevenLabs: Already owned (sunk cost)
- Stock footage: $0 (using free sources)
- CapCut: $0
- Canva: $0 (free tier sufficient)
- **Total: ~$25-30/month**

**Time Investment:**
- Per video: 4-5 hours (goal)
- Per week: 12-15 hours (3 videos)
- Month 1 total: 48-60 hours

**Break-even calculation:**
- If channel hits monetization and earns $300-500/month (conservative)
- Effective hourly rate: $5-8/hour initially
- As channel grows (Reddit poster: $2,250/month net): $35-45/hour
- Profit margin after costs: ~95% (very low operating costs)

## Open Questions
- **HeyGen + ElevenLabs integration:** Does HeyGen accept custom audio upload, or must we use built-in voices?
- **Optimal posting schedule:** Mon/Wed/Fri vs. Tue/Thu/Sat vs. other? Test and adjust.
- **Thumbnail style:** Photo-realistic vs. cartoon vs. text-heavy? A/B test.
- **Video length sweet spot:** 5-7 minutes ideal, or should some be shorter (3-4 min) or longer (8-10 min)?
- **Shorts strategy:** Should we repurpose content into YouTube Shorts for subscriber acceleration?

## Success Metrics (Prioritized)

**Priority 1: Financial**
- Reach YouTube Partner Program eligibility: 1k subs, 4k watch hours
- Target: Month 2-3 (ambitious) or Month 4-6 (realistic)
- Post-monetization: $300-500/month in first 3 months of ads

**Priority 2: Engagement**
- Average view duration: >50% (viewers watching at least half the video)
- Comments per video: 5-10+ engaged comments asking follow-up questions
- Comment response rate: 100% (reply to every comment)

**Priority 3: Growth**
- Subscribers: 200-500 after 12 videos (Month 1)
- Views per video: 500-2,000 average, with 1-2 "hits" at 5k-10k+
- Hit rate: 1 in 5 videos performs 3x+ better than average

## Task Checklist
- [ ] Story 1: YouTube Channel Setup
- [ ] Story 2: AI Presenter Creation
- [ ] Story 3: Voice Selection (ElevenLabs)
- [ ] Story 4: Research Workflow Template
- [ ] Story 5: Script Template
- [ ] Story 6: First Video Production - "How to Read Pet Medication Labels"
- [ ] Story 7: Content Calendar - 12 Video Topics
- [ ] Story 8: Video 2-4 Production (Week 1)
- [ ] Story 9: Analytics Review & Iteration (End of Week 2)
- [ ] Story 10: Videos 5-12 Production (Weeks 2-4)
- [ ] Story 11: Monetization Milestone Strategy
- [ ] Story 12: Post-Monetization - Tool Planning
- [ ] Final review: Did we hit validation metrics? Proceed or pivot?

---

## Next Steps After This PRD

Once this PRD is approved:
1. **Start with Story 1** (YouTube Channel Setup) - Quick win, 30 minutes
2. **Then Story 2** (AI Presenter Creation) - Critical path, may take 2-3 hours of testing
3. **Then Story 6** (First Video Production) - The real test

**Decision point after Video 1:** Does the workflow feel sustainable? Is quality acceptable? If yes, proceed to Stories 7-8. If no, iterate on production process.

**Decision point after 12 videos (Month 1):** Are we on track to monetization? Is this niche working? If yes, keep going. If no, consider pivot to different niche or different approach.
