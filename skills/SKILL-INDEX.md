# Skill Index

Master reference for all available skills. When a skill is invoked, follow the instructions below.

---

## Planning & Methodology

### prd
**File:** `skills/planning/prd.md`
**Trigger:** "create a prd", "plan this feature", "write prd for"
**Instructions:**
1. Ask 3-5 clarifying questions with lettered options (A, B, C, D)
2. Wait for answers before proceeding
3. Generate structured PRD: Overview, Goals, Non-Goals, User Stories, Technical Considerations
4. Each user story must be completable in one session
5. Acceptance criteria must be specific and verifiable
6. Save to `/tasks/prd-[feature-name].md`

### progress-tracking
**File:** `skills/planning/progress-tracking.md`
**Trigger:** "initialize progress tracking", "update progress", "check progress"
**Instructions:**
1. Maintain `progress.txt` in project root
2. "Codebase Patterns" section at top - read this first each session
3. Session log entries: date, completed, files changed, learnings, decisions, next steps
4. Update after completing features, discovering patterns, or hitting gotchas
5. Focus on "why" not just "what" - capture context git doesn't

### compound-engineering
**Trigger:** "compound engineering", "plan work review compound"
**Instructions:**
Follow the loop: Plan (40%) → Work (20%) → Review (20%) → Compound (20%)
- **Plan:** PRD for features, clarify scope for tasks, research existing patterns
- **Work:** Small incremental steps, continuous validation, stay focused
- **Review:** Run quality gates (design/code/security reviews)
- **Compound:** Update progress.txt, capture learnings in CLAUDE.md/AGENTS.md

---

## Document Processing

### pdf
**Trigger:** "use the pdf skill", working with PDF files
**Instructions:**
1. Use the Read tool to read PDF files directly (Claude Code supports this)
2. Extract text, tables, and structured data
3. For summaries: key points with page references
4. For data extraction: output as markdown tables or JSON
5. Note any images or charts that can't be extracted

### xlsx
**Trigger:** "use the xlsx skill", working with spreadsheets
**Instructions:**
1. Read the spreadsheet file
2. Identify sheets, columns, and data types
3. For analysis: summarize patterns, outliers, totals
4. For manipulation: describe changes needed, output as CSV or new structure
5. Can generate formulas and explain their logic

### docx
**Trigger:** "use the docx skill", working with Word documents
**Instructions:**
1. Read the document content
2. Preserve formatting context (headers, lists, tables)
3. For editing: show tracked changes style (old → new)
4. For analysis: summarize structure and key content

### pptx
**Trigger:** "use the pptx skill", working with presentations
**Instructions:**
1. Read slide content and structure
2. Identify flow: title → content → conclusion
3. For improvements: suggest slide restructuring, content tightening
4. For creation: outline slides with speaker notes

### markdown-to-epub
**Trigger:** "convert to epub", "make an ebook"
**Instructions:**
1. Gather all markdown source files
2. Create logical chapter structure
3. Generate front matter (title, author, TOC)
4. Output as structured markdown ready for Pandoc or Calibre conversion

---

## Development & Code

### test-driven-development
**Trigger:** "use TDD", "write tests first"
**Instructions:**
1. **Red:** Write a failing test for the feature/fix
2. **Green:** Write minimum code to pass the test
3. **Refactor:** Clean up while keeping tests green
4. Repeat for each requirement
5. Never write implementation before the test

### software-architecture
**Trigger:** "architecture review", "design patterns"
**Instructions:**
1. Identify current architecture patterns in use
2. Apply SOLID principles analysis
3. Suggest improvements: separation of concerns, dependency injection
4. Consider: scalability, maintainability, testability
5. Document decisions with rationale

### changelog-generator
**Trigger:** "generate changelog", "release notes"
**Instructions:**
1. Run `git log --oneline` to see recent commits
2. Group by type: Features, Fixes, Breaking Changes, Other
3. Transform technical commits into user-friendly descriptions
4. Format as markdown with version header and date
5. Highlight breaking changes prominently

### code-review
**Trigger:** "review this code", "code review"
**Instructions:**
1. Read code completely before commenting
2. Check: correctness, security, maintainability, performance
3. **Verify against SITE-FACTORY-PLAYBOOK.md standards**
4. Check for Supabase pagination (1000 row limit!)
5. Prioritize: critical → important → minor → nitpick
6. Suggest improvements, don't just criticize
7. Acknowledge good patterns

### design-review
**Trigger:** "design review", "review the design", "check the UI"
**Instructions:**
1. Identify changed UI component files (.astro, .svelte, .tsx)
2. Check Tailwind patterns: spacing, colors, responsive breakpoints
3. Reference `/Users/jbm/new-project/context/design-principles.md`
4. Verify mobile responsiveness (sm:, md:, lg: breakpoints)
5. Check accessibility: focus states, labels, contrast
6. If needed, ask for screenshot to verify visual design
7. Generate report with file:line references

### git-workflow
**Trigger:** "commit this", "create PR", "git help"
**Instructions:**
1. Use conventional commits: type(scope): description
2. Types: feat, fix, docs, refactor, test, chore
3. PR template: Summary, Changes, Test Plan
4. Never force push to main
5. Always verify with `git status` before and after

### root-cause-tracing
**Trigger:** "trace this error", "find the root cause"
**Instructions:**
1. Start at the error message
2. Trace backwards through the call stack
3. Identify the first point where behavior diverged from expected
4. Check inputs, state, and external dependencies at that point
5. Document the chain: trigger → intermediate steps → failure

### test-fixing
**Trigger:** "fix these tests", "tests are failing"
**Instructions:**
1. Run tests, capture full output
2. Categorize failures: logic errors, missing mocks, flaky tests, environment issues
3. Fix in order of dependency (foundational tests first)
4. Verify each fix before moving on
5. Don't just make tests pass - ensure they test the right thing

---

## Data & Analysis

### csv-summarizer
**Trigger:** "analyze this CSV", "summarize this data"
**Instructions:**
1. Read the CSV file
2. Report: row count, columns, data types
3. For each numeric column: min, max, mean, median
4. For each categorical column: unique values, most common
5. Identify patterns, outliers, missing data
6. Suggest visualizations if helpful

### data-transformation
**Trigger:** "transform this data", "restructure this"
**Instructions:**
1. Understand source format and target format
2. Map fields between source and target
3. Handle edge cases: nulls, type mismatches, duplicates
4. Output transformation logic or transformed data
5. Validate sample rows

---

## Content & Writing

### youtube-transcript
**Trigger:** "transcribe this video", "get youtube transcript"
**Instructions:**
1. Use WebFetch on the YouTube URL
2. Extract or summarize the video content
3. If transcript available: format with timestamps
4. Create summary: key points, quotes, takeaways
5. Save to appropriate location if requested

### article-extractor
**Trigger:** "extract this article", "get article content"
**Instructions:**
1. Use WebFetch on the article URL
2. Extract: title, author, date, main content
3. Strip ads, navigation, sidebars
4. Format as clean markdown
5. Note source URL for citation

### content-research
**Trigger:** "research this topic", "find sources"
**Instructions:**
1. Use WebSearch for current information
2. Find 3-5 credible sources
3. Extract key facts, statistics, quotes
4. Note conflicting viewpoints
5. Output: facts, stats, perspectives, content angles, source list

### brainstorming
**Trigger:** "brainstorm", "help me think through"
**Instructions:**
1. Ask clarifying questions first
2. Generate 5-10 diverse ideas without judgment
3. Group ideas by theme
4. Identify pros/cons of top options
5. Help narrow to 2-3 strongest candidates

### meeting-analyzer
**Trigger:** "analyze this meeting", "meeting insights"
**Instructions:**
1. Read transcript or notes
2. Identify: decisions made, action items, owners
3. Note: speaking ratios, unresolved questions
4. Flag: conflicts, topics needing follow-up
5. Output structured summary with action items

---

## Creative & Media

### book-editor
**File:** `skills/creative/book-editor.md`
**Trigger:** "edit this chapter", "editorial review", "publisher review"
**Instructions:**
1. Read voice guide and chapter completely
2. Provide professional editorial report: developmental, line, and copy edit
3. Check forbidden elements: litotes, em dashes, anaphora, sermon drift
4. Verify sensory grounding (emotion + physical)
5. Score publisher-readiness (7+ in all categories = ready)
6. Prioritize top 3 fixes
7. Offer to help revise or let author take first pass

### image-enhancer
**Trigger:** "enhance this image", "improve image quality"
**Instructions:**
1. Read the image file
2. Analyze: resolution, clarity, exposure, composition
3. Suggest improvements or describe enhanced version
4. For actual enhancement: recommend tools (ImageMagick, etc.)

### canvas-design
**Trigger:** "design this", "create a visual"
**Instructions:**
1. Clarify: purpose, audience, dimensions, style
2. Describe layout: hierarchy, spacing, focal points
3. Suggest: colors, fonts, imagery
4. Output as detailed design spec or HTML/CSS if appropriate

### video-downloader
**Trigger:** "download this video"
**Instructions:**
1. Recommend yt-dlp for YouTube/most sites
2. Provide command: `yt-dlp -f best [URL]`
3. For specific formats: `yt-dlp -f 'bestvideo[height<=1080]+bestaudio' [URL]`
4. Note: respect copyright and terms of service

### remotion
**Trigger:** "use remotion", "create video with code", "programmatic video"
**Instructions:**
1. **Setup:** `npx create-video@latest` or add to existing project with `npm i remotion @remotion/cli`
2. **Project structure:**
   - `src/Root.tsx` - Register compositions
   - `src/Composition.tsx` - Main video component
   - `remotion.config.ts` - Build/render config
3. **Key concepts:**
   - `useCurrentFrame()` - Get current frame number
   - `useVideoConfig()` - Get fps, width, height, durationInFrames
   - `<Sequence from={frame}>` - Time-based sequencing
   - `<AbsoluteFill>` - Full-frame positioning
   - `interpolate(frame, [start, end], [from, to])` - Animation helper
4. **Preview:** `npx remotion preview`
5. **Render:** `npx remotion render src/index.ts CompositionId out.mp4`
6. **Common patterns:**
   - Text animations: interpolate opacity/transform over frames
   - Image sequences: map data to `<Sequence>` components
   - Audio sync: `<Audio src={audio} />` with frame-based timing
7. **Best practices:**
   - Keep compositions pure (no side effects)
   - Use `staticFile()` for assets in /public
   - Calculate all positions from frame number
   - Test at different fps before final render

---

## Productivity & Organization

### file-organizer
**Trigger:** "organize these files", "clean up this folder"
**Instructions:**
1. List current files and structure
2. Identify patterns: by date, type, project, status
3. Propose new structure with rationale
4. Identify duplicates and candidates for deletion
5. Execute reorganization if approved

### invoice-organizer
**Trigger:** "organize invoices", "prep for taxes"
**Instructions:**
1. Read invoice/receipt files
2. Extract: vendor, date, amount, category
3. Rename consistently: YYYY-MM-DD_Vendor_Amount
4. Group by category or month
5. Generate summary spreadsheet

### kaizen
**Trigger:** "continuous improvement", "kaizen"
**Instructions:**
1. Identify current process or problem
2. Ask: What's working? What's not? What's wasteful?
3. Apply 5 Whys to find root causes
4. Suggest small, incremental improvements
5. Plan: test → measure → adjust

### session-notes
**Trigger:** "capture session", "session notes"
**Instructions:**
1. Summarize: completed, in progress, blocked
2. Note: decisions made, things learned
3. List: next steps, priority order
4. Include: file paths, commands, URLs for reference
5. Save to SESSION-LOG.md or SESSION-SUMMARY-YYYY-MM-DD.md

### ship-learn-next
**Trigger:** "what should I build next", "prioritize backlog"
**Instructions:**
1. List current options/backlog
2. For each: effort (S/M/L), impact (S/M/L), risk
3. Apply: quick wins first, then high-impact
4. Consider: dependencies, learning opportunities
5. Recommend top 1-3 priorities with rationale

---

## Family & Genealogy

### family-history-research
**Trigger:** "genealogy help", "family research"
**Instructions:**
1. Clarify: who, what time period, what's known
2. Suggest sources: census, vital records, military, immigration
3. Recommend: Ancestry, FamilySearch, FindAGrave
4. Help organize findings: person → sources → facts
5. Identify gaps and next research steps

---

## Business & Marketing

### marketing-plan
**File:** `skills/business/marketing-plan.md`
**Trigger:** "create a marketing plan", "GTM strategy", "help me launch", "how should I market"
**Instructions:**
1. Ask discovery questions (product, resources, competitors, goals)
2. Analyze market and positioning
3. Generate phased plan: Foundation → Launch → Growth → Paid (optional)
4. Include channel-specific playbooks (Reddit, Twitter, Facebook Groups, Product Hunt)
5. Define metrics, milestones, and quick wins
6. Save to `/tasks/marketing-plan-[product].md`

### brand-guidelines
**Trigger:** "apply brand", "brand consistency"
**Instructions:**
1. Reference brand guide if available
2. Apply: colors, fonts, voice, logo usage
3. Check: consistency across materials
4. Flag: violations or inconsistencies
5. Suggest: improvements for brand alignment

### domain-brainstormer
**Trigger:** "domain ideas", "name this project"
**Instructions:**
1. Clarify: purpose, audience, tone
2. Generate 10-20 name ideas across styles
3. Check availability: .com, .io, .dev, .ai
4. Consider: memorability, spelling, length
5. Shortlist top 5 with pros/cons

### lead-research
**Trigger:** "research this company", "find leads"
**Instructions:**
1. WebSearch for company info
2. Find: size, industry, key people, recent news
3. Identify: pain points, buying signals
4. Suggest: outreach angle, personalization hooks
5. Output structured lead profile

### competitive-analysis
**Trigger:** "analyze competitors", "competitive research"
**Instructions:**
1. Identify top 3-5 competitors
2. For each: positioning, pricing, features, messaging
3. Find: gaps, opportunities, threats
4. Compare: strengths/weaknesses matrix
5. Recommend: differentiation strategy

---

## Security & Forensics

### security-review
**Trigger:** "security review", "check security", "scan for vulnerabilities"
**Instructions:**
1. Identify scope: files with auth, user input, or data handling
2. Check for hardcoded secrets (API keys, tokens, passwords)
3. Verify input validation: no SQL injection, XSS, command injection
4. Check RLS policies on new Supabase tables
5. Verify no sensitive data in logs or error messages
6. Only report findings with >= 80% confidence
7. Severity: CRITICAL > HIGH > MEDIUM > LOW

### metadata-extraction
**Trigger:** "extract metadata", "file forensics"
**Instructions:**
1. Identify file type
2. Extract available metadata: created, modified, author, location, device
3. For images: EXIF data (camera, GPS, timestamp)
4. For documents: author, revision history, software
5. Report findings, note privacy implications

### computer-forensics
**Trigger:** "forensic analysis", "investigate this"
**Instructions:**
1. Preserve evidence: don't modify originals
2. Document chain of custody
3. Analyze: file system, logs, artifacts
4. Timeline: reconstruct sequence of events
5. Report: findings, methodology, limitations

### threat-hunting
**Trigger:** "hunt for threats", "security analysis"
**Instructions:**
1. Define scope: what systems, what timeframe
2. Identify indicators of compromise (IOCs)
3. Search logs for suspicious patterns
4. Correlate findings across sources
5. Document: findings, false positives, recommendations

---

## Project-Specific Skills

### homelab
**File:** `skills/projects/homelab.md`
**Trigger:** "use homelab skill", working on home automation
**Quick ref:** Read SUMMARY.md first. Plato=NAS, Phaedrus=HA, Docker LXC=containers.

### crown-compass (cc)
**File:** `skills/projects/crown-compass.md`
**Trigger:** "use cc skill", creating CC content
**Quick ref:** Read voice.md first. Contemplative pilgrim, not drill sergeant. 2-3 heralds/week.

### heirloom
**File:** `skills/projects/heirloom.md`
**Trigger:** "use heirloom skill", working on family app
**Quick ref:** Read NEXT-STEPS.md first. Supabase backend, Next.js frontend.

### 100-days
**File:** `skills/projects/100-days.md`
**Trigger:** "use 100-days skill", working on book
**Quick ref:** Interview → Draft → Review → Revise. Visceral, sensory, story-first.

---

## How to Use This Index

Say any of these:
- "use the [skill] skill"
- "help me with [trigger phrase]"
- Reference the skill by name

I'll follow the instructions for that skill automatically.

---

**Last Updated:** January 23, 2026 - Added marketing-plan skill for GTM strategy
