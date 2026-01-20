# PRD: Claude Code Dashboard

## Overview

Claude Code Dashboard is a floating desktop overlay that provides real-time monitoring and metrics for developers using Claude Code CLI. The app displays token usage, cost tracking, model information, and session statistics in a compact, always-on-top widget that stays visible while coding. This solves the problem of developers lacking visibility into session metrics, token consumption, and API costs while working with Claude Code.

## Goals

1. Provide passive, glanceable visibility into Claude Code session metrics without interrupting workflow
2. Display accurate token usage and cost estimates within acceptable margins (5% and 10% respectively)
3. Create a lightweight, performant overlay that uses minimal system resources (under 50MB RAM)
4. Enable developers to make informed decisions about context usage and model selection

## Non-Goals

**Not building in v1:**
- Voice input integration via Whisper - future consideration
- Macro/hotkey support for Claude Code actions - deferred to v2
- Team usage dashboards and shared metrics - not needed for MVP
- Stream Deck or hardware integrations - separate product consideration
- Model switcher directly from overlay - use CLI for this
- Alert thresholds/notifications - keep passive for v1
- Session history persistence across app restarts - in-memory only for MVP
- Multi-session monitoring - one active session at a time
- Custom themes or appearance settings - use single aesthetic for v1

## User Stories

### Story 1: Basic Overlay Window

**As a** developer using Claude Code CLI
**I want** a floating, always-on-top window in my screen corner
**So that** I can see session metrics without switching away from my editor

**Acceptance Criteria:**
- [ ] Window appears as floating overlay (always-on-top)
- [ ] Window positioned in corner (user can choose which corner or drag)
- [ ] Dark translucent glass background with blur effect
- [ ] Window size is compact (roughly 280x400px)
- [ ] Clicking outside doesn't close window (stays persistent)
- [ ] Window has subtle border/shadow for visibility
- [ ] Verify in browser/app: window stays on top when switching to other apps

**Technical Notes:**
- Choose tech stack first (Electron vs Tauri vs Native)
- Research platform-specific always-on-top APIs
- Consider frameless window with custom titlebar

---

### Story 2: Model Indicator Badge

**As a** Claude Code user
**I want** to see which model is currently active
**So that** I know if I'm using Sonnet 4.5, Opus 4.5, or Haiku

**Acceptance Criteria:**
- [ ] Badge displays current model name (e.g., "Sonnet 4.5", "Opus 4.5", "Haiku")
- [ ] Badge uses distinct visual styling (colored background or icon)
- [ ] Badge positioned prominently at top of overlay
- [ ] Badge updates in real-time when model changes (if detectable)
- [ ] Verify in browser/app: badge correctly shows model from CLI session

**Technical Notes:**
- Parse model name from Claude Code CLI output
- Color scheme: blue for Sonnet, purple for Opus, green for Haiku
- May need to detect model from CLI flags or output headers

---

### Story 3: Token Usage Gauge

**As a** developer
**I want** to see how many tokens I've consumed in the current session
**So that** I can understand my usage and cost trajectory

**Acceptance Criteria:**
- [ ] Circular gauge displays token count (e.g., "12,543 tokens")
- [ ] Gauge shows percentage of typical context window (e.g., "62%")
- [ ] Visual fills progressively (empty → full circle)
- [ ] Updates in real-time after each Claude Code prompt/response
- [ ] Gauge color changes based on usage: green (0-60%), yellow (60-85%), red (85%+)
- [ ] Verify in app: gauge updates after sending prompt to Claude Code

**Technical Notes:**
- Parse token counts from CLI output (input + output tokens)
- Context window size varies by model (200K for Sonnet 4.5)
- May need running total accumulator

---

### Story 4: Context Window Progress Bar

**As a** developer
**I want** a horizontal bar showing context window consumption
**So that** I know when I'm approaching limits

**Acceptance Criteria:**
- [ ] Horizontal progress bar below or near token gauge
- [ ] Bar fills left-to-right as tokens accumulate
- [ ] Shows percentage label (e.g., "45% of context window")
- [ ] Bar color matches gauge color scheme (green/yellow/red)
- [ ] Updates in real-time with token usage
- [ ] Verify in app: bar progresses as session continues

**Technical Notes:**
- Use same token data source as gauge
- Calculate percentage: (current_tokens / max_context_window) * 100
- Consider smooth animations for visual polish

---

### Story 5: Cost Ticker

**As a** developer concerned about API spend
**I want** to see the running dollar amount for my current session
**So that** I can budget and track costs in real-time

**Acceptance Criteria:**
- [ ] Displays cost in dollars (e.g., "$0.34")
- [ ] Cost updates after each prompt/response cycle
- [ ] Calculation based on current model pricing (input vs output tokens)
- [ ] Cost positioned prominently (near top with model badge)
- [ ] Shows 2 decimal places for cents
- [ ] Verify in app: cost increases correctly based on known token counts

**Technical Notes:**
- Pricing data (as of Jan 2025):
  - Sonnet 4.5: $3/MTok input, $15/MTok output
  - Opus 4.5: $15/MTok input, $75/MTok output
  - Haiku: $0.25/MTok input, $1.25/MTok output
- Formula: (input_tokens/1M * input_price) + (output_tokens/1M * output_price)
- May need to parse input vs output tokens separately

---

### Story 6: Session Timer and Prompt Count

**As a** developer
**I want** to see session duration and number of prompts sent
**So that** I can track my coding session activity

**Acceptance Criteria:**
- [ ] Timer displays session duration (e.g., "23:45" for 23 minutes 45 seconds)
- [ ] Timer starts when overlay connects to Claude Code session
- [ ] Prompt counter shows number of prompts sent (e.g., "12 prompts")
- [ ] Counter increments with each new user prompt
- [ ] Both metrics displayed in lower section of overlay
- [ ] Verify in app: timer runs continuously, counter increments on prompts

**Technical Notes:**
- Start timer when app launches or connects to CLI process
- Detect new prompts by parsing CLI input stream
- Format timer as HH:MM or MM:SS depending on session length

---

### Story 7: Status Indicator

**As a** developer
**I want** a colored dot showing current Claude Code activity status
**So that** I can see at a glance if Claude is thinking, idle, or errored

**Acceptance Criteria:**
- [ ] Colored dot indicator (small, 8-12px)
- [ ] Green dot = Idle (waiting for user input)
- [ ] Blue dot with subtle pulse animation = Thinking (Claude is responding)
- [ ] Red dot = Error state (connection issue or API error)
- [ ] Gray dot = Disconnected (no active Claude Code session)
- [ ] Positioned near model badge or top corner
- [ ] Verify in app: dot changes color during prompt/response cycle

**Technical Notes:**
- Parse CLI state from output patterns (prompt vs streaming response)
- Detect errors from stderr or error messages
- Consider subtle glow effect for active states

---

### Story 8: Token Usage Sparkline Chart

**As a** developer analyzing my usage patterns
**I want** a mini sparkline showing token usage trend over the session
**So that** I can see if my prompts are getting larger or context is growing

**Acceptance Criteria:**
- [ ] Small line chart (sparkline) below token gauge
- [ ] X-axis = time/prompt sequence, Y-axis = token count per exchange
- [ ] Shows last 10-20 data points
- [ ] Line color matches theme (soft blue/green)
- [ ] Updates with each new prompt/response
- [ ] Verify in app: sparkline shows usage pattern over multiple prompts

**Technical Notes:**
- Store array of recent token counts (rolling window)
- Use lightweight charting library or SVG/canvas
- Keep visual minimal and information-dense

---

### Story 9: Current Task Display

**As a** developer
**I want** to see the current task or file Claude is working on
**So that** I have context for what the session is doing

**Acceptance Criteria:**
- [ ] Text label showing current task (e.g., "Editing auth.ts")
- [ ] Truncate long filenames with ellipsis (max ~30 chars)
- [ ] Updates when Claude starts working on new file/task
- [ ] Positioned in middle section of overlay
- [ ] Shows "Idle" when no active task
- [ ] Verify in app: label updates when Claude Code changes focus

**Technical Notes:**
- Parse task context from CLI output (tool calls, file operations)
- May need to infer from Read/Edit/Write tool usage
- Fallback to "Active session" if task unclear

---

### Story 10: Session History (Expandable)

**As a** developer
**I want** to click the overlay to expand and see session history
**So that** I can review past prompts and metrics

**Acceptance Criteria:**
- [ ] Clicking overlay expands to show history panel
- [ ] History shows last 5-10 prompts with timestamp and token count
- [ ] Each entry shows: time, prompt preview (truncated), tokens used
- [ ] Clicking again or "X" collapses back to compact view
- [ ] History scrollable if more than 10 entries
- [ ] Verify in app: click to expand, see history, click to collapse

**Technical Notes:**
- Store session history in memory (array of objects)
- Consider slide-out or accordion animation
- Compact view should be default state

---

## Technical Considerations

**Stack Decision:**
- **Electron**: Cross-platform, familiar web tech (HTML/CSS/JS), larger bundle (~100MB+)
- **Tauri**: Rust-based, smaller footprint (~10-20MB), better performance, steeper learning curve
- **Native (Swift/macOS)**: Best performance, platform-specific, more dev effort per platform

**Recommendation:** Start with Tauri for balance of performance and cross-platform support.

**Data Source Integration:**
- **Wrapper approach**: App launches Claude Code as child process, captures stdout/stderr
- **Sidecar approach**: App runs alongside, tails shared log or output stream
- **Socket/IPC**: If Claude Code exposes metrics via socket (requires CLI support)

**Recommendation:** Wrapper approach gives most control and reliability.

**Dependencies:**
- Process management (spawn, stream parsing)
- UI framework (React/Svelte/Vue for web-based, SwiftUI for native)
- Charting library (lightweight, e.g., Chart.js or custom SVG)
- Platform window APIs for always-on-top behavior

**Risks:**
- Claude Code output format may change (breaking parsing logic)
- Token counts might not be exposed in CLI output (may need estimation)
- Platform-specific windowing behavior differences (Windows/Mac/Linux)
- Performance impact of real-time parsing on large output streams

## Open Questions

1. **Output parsing reliability**: Does Claude Code CLI expose structured JSON output, or do we parse plain text?
2. **Token visibility**: Are input/output token counts printed to stdout after each exchange?
3. **Platform priority**: Should we target macOS first (primary dev platform), then expand to Windows/Linux?
4. **Model detection**: Can we reliably detect model switches mid-session, or assume single model per session?
5. **Distribution**: Standalone app download, or integrated with Claude Code installation?

## Task Checklist

- [ ] Story 1: Basic Overlay Window
- [ ] Story 2: Model Indicator Badge
- [ ] Story 3: Token Usage Gauge
- [ ] Story 4: Context Window Progress Bar
- [ ] Story 5: Cost Ticker
- [ ] Story 6: Session Timer and Prompt Count
- [ ] Story 7: Status Indicator
- [ ] Story 8: Token Usage Sparkline Chart
- [ ] Story 9: Current Task Display
- [ ] Story 10: Session History (Expandable)
- [ ] Final integration testing and polish
- [ ] Code review and security review (if handling sensitive data)
- [ ] Performance testing (verify <50MB RAM usage)

---

**Notes:**
- Each story should be completable in one focused session
- Test frequently in actual Claude Code environment
- Keep visual design consistent with "gaming HUD overlay" aesthetic
- Prioritize accuracy and performance over additional features
- Consider user feedback after Story 7 (core metrics) before building Stories 8-10

**Original Product Vision:** See separate document for full context on voice input, team features, and hardware integrations planned for future versions.
