# C.H.U.D. (Claude Heads Up Display)

> Floating desktop overlay showing real-time stats for Claude Code terminal sessions

## Tech Stack
- **Runtime:** Electron + Node.js 18+
- **Frontend:** Vanilla JS (no framework)
- **Communication:** Unix Sockets
- **Version:** MVP v0.1.0

## Key Features
- Session tracking
- Token usage monitoring
- Cost estimation
- Todo progress display
- Optional quota tracking

## Development
```bash
npm install
npm start
```

## Architecture Notes
- Single-instance protection to prevent app freezing
- Reads Claude Code session data via Unix sockets
- Transparent overlay that stays on top

## Status
MVP complete and functional.

---
*See progress.txt for session history (create if needed)*
