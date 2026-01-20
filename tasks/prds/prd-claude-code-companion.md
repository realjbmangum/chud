# PRD: Claude Code Companion Overlay

## Overview
A terminal-based companion tool that displays real-time session information alongside Claude Code without requiring slash commands. Shows model, token count, cost estimate, session duration, and message count - always visible while working.

## Goals
1. Always-visible session stats without interrupting workflow or typing commands
2. Real-time updates as you work (token count, cost, tool usage)
3. MVP first, then polish for open-source release
4. **Success metric:** Can work a full session without ever wondering "what model am I on?" or "how many tokens have I used?"

## Non-Goals (v1)
- Web-based dashboard (terminal-only)
- Multi-session management (focus on current session)
- Historical analytics/charts
- Cost alerts or budgeting features
- Integration with billing/API keys

## Research Findings (Integration Points)

Claude Code exposes these integration points:

| Method | Real-time? | Data Available |
|--------|------------|----------------|
| **Hooks** (SessionStart, PostToolUse, UserPromptSubmit) | Yes | Session ID, tool calls, transcript path |
| **~/.claude/history.jsonl** | No (lagged) | Session metadata, tokens, cost |
| **Session transcript** (~/.claude/projects/{proj}/{session}.jsonl) | Semi | Full conversation, token counts |

**Recommended approach:** Hook-based event emission + transcript polling

---

## User Stories

### Story 1: Session Start Detection
**As a** Claude Code user
**I want** the companion to automatically detect when I start a session
**So that** I see stats from the moment I begin working

**Acceptance Criteria:**
- [ ] Companion detects new Claude Code session within 2 seconds of start
- [ ] Displays session ID (shortened) and start time
- [ ] Shows which model is active (Opus, Sonnet, Haiku)
- [ ] Works whether companion starts before or after Claude Code

**Technical Notes:**
- Use SessionStart hook to emit event to companion
- Fall back to polling ~/.claude/history.jsonl if hook missed
- Hook writes to Unix socket or named pipe

---

### Story 2: Real-Time Token & Cost Display
**As a** user monitoring my usage
**I want** to see token count and cost estimate update as I work
**So that** I can pace my usage without checking manually

**Acceptance Criteria:**
- [ ] Shows input tokens / output tokens separately
- [ ] Shows estimated cost in dollars (based on model pricing)
- [ ] Updates after each Claude response (not mid-stream)
- [ ] Cost calculation uses correct per-model pricing

**Technical Notes:**
- Parse session transcript for token counts
- PostToolUse hook triggers refresh
- Model pricing table (as of Jan 2025):
  - Opus: $15/$75 per 1M tokens
  - Sonnet: $3/$15 per 1M tokens
  - Haiku: $0.25/$1.25 per 1M tokens

---

### Story 3: Session Duration & Message Count
**As a** user in a long session
**I want** to see how long I've been working and how many exchanges
**So that** I have context on session depth

**Acceptance Criteria:**
- [ ] Shows elapsed time since session start (HH:MM:SS)
- [ ] Shows message count (user messages / total messages)
- [ ] Timer updates every second
- [ ] Message count updates after each exchange

**Technical Notes:**
- Session start time from SessionStart hook or history.jsonl
- Message count from transcript line count

---

### Story 4: Terminal Display (MVP)
**As a** terminal user
**I want** the companion to display cleanly alongside my Claude Code session
**So that** it's always visible without being intrusive

**Acceptance Criteria:**
- [ ] Works in tmux split pane (primary approach)
- [ ] Minimal, clean display - no clutter
- [ ] Fits in narrow pane (40 chars wide max)
- [ ] Updates without flickering
- [ ] Clear visual hierarchy (model name prominent)

**Technical Notes:**
- Use Node.js with blessed/ink or simple ANSI codes
- Or: Shell script with watch + clear for ultimate simplicity
- MVP can be very simple - just formatted text output

**Display mockup:**
```
┌─ Claude Code Companion ─────┐
│                             │
│  MODEL    opus-4.5          │
│  SESSION  abc123...         │
│                             │
│  ─────────────────────────  │
│                             │
│  TOKENS   12,450 in         │
│           8,230 out         │
│                             │
│  COST     $0.42             │
│                             │
│  TIME     00:23:45          │
│  MESSAGES 14 exchanges      │
│                             │
│  ─────────────────────────  │
│                             │
│  TODOS    3/7 complete      │
│  ▓▓▓▓▓▓░░░░░░░░ 43%        │
│                             │
│  ─────────────────────────  │
│                             │
│  LAST TOOL  Edit            │
│  STATUS     Ready           │
│                             │
└─────────────────────────────┘
```

**Note:** Model name updates in real-time if user switches models mid-session.

---

### Story 5: Todo Progress Display
**As a** user tracking my work
**I want** to see my todo list progress in the companion
**So that** I know how much of the current task is complete

**Acceptance Criteria:**
- [ ] Shows X/Y todos complete
- [ ] Visual progress bar
- [ ] Updates when todos change (via PostToolUse hook on TodoWrite)
- [ ] Shows "No todos" gracefully when list is empty

**Technical Notes:**
- TodoWrite tool calls will trigger PostToolUse hook
- Parse todo state from transcript or hook payload
- May need to track todo state in companion memory

---

### Story 6: Hook Installation & Setup
**As a** user setting up the companion
**I want** easy installation of required hooks
**So that** I can get started quickly

**Acceptance Criteria:**
- [ ] Single command installs hooks to ~/.claude/settings.json
- [ ] Doesn't overwrite existing hooks (merges)
- [ ] Clear instructions if manual setup needed
- [ ] Companion works in degraded mode if hooks fail (polling only)

**Technical Notes:**
- Hooks config goes in ~/.claude/settings.json
- Need SessionStart, PostToolUse, UserPromptSubmit hooks
- Each hook calls a small bash script that emits to socket

---

## Technical Considerations

### Stack
- **Language:** Node.js (for blessed/ink TUI) or pure Bash (simplest MVP)
- **IPC:** Unix socket or named pipe at /tmp/claude-companion.sock
- **Display:** tmux pane, or standalone terminal window

### Architecture
```
┌─────────────────────────────────────────┐
│  Claude Code Session                    │
│  └─ Hooks emit to socket on events      │
└──────────────┬──────────────────────────┘
               │ JSON events
               ↓
┌─────────────────────────────────────────┐
│  Companion Process                      │
│  ├─ Listens on Unix socket              │
│  ├─ Polls transcript for token counts   │
│  └─ Renders TUI display                 │
└─────────────────────────────────────────┘
```

### Files to Read
- `~/.claude/history.jsonl` - session metadata
- `~/.claude/projects/{hash}/{session}.jsonl` - transcript with tokens
- `~/.claude/settings.json` - verify hooks installed

### Risks
- **Transcript format may change** - Claude Code updates could break parsing
- **Hook timing** - events may be delayed or missed
- **Permission issues** - socket creation in /tmp

### Dependencies
- Node.js 18+ (if using Node approach)
- tmux (for split pane usage)
- Claude Code with hooks support

---

## Open Questions (Resolved)
- ~~Should we show current working directory?~~ No
- ~~Should we show git branch?~~ No
- ~~Should we show todo list progress (from TodoWrite tool)?~~ **Yes - add to display**
- ~~What happens when user switches models mid-session?~~ **Handle it - always show current model**

---

## Task Checklist
- [ ] Story 1: Session Start Detection
- [ ] Story 2: Real-Time Token & Cost Display
- [ ] Story 3: Session Duration & Message Count
- [ ] Story 4: Terminal Display (MVP)
- [ ] Story 5: Todo Progress Display
- [ ] Story 6: Hook Installation & Setup
- [ ] Integration testing with live Claude Code session
- [ ] Documentation for open-source release

---

## Future Considerations (v2+)
- Status bar mode (like vim statusline) instead of separate pane
- Desktop app overlay (Electron/Tauri)
- Multi-session switching
- Cost alerts/budgets
- Session history browser
- Export session stats
