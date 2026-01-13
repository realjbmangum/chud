# C.H.U.D. (Claude Heads Up Display)

> A beautiful, always-visible overlay that shows real-time stats for your Claude Code terminal sessions

![Platform](https://img.shields.io/badge/platform-macOS-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)

## 🎯 What is C.H.U.D.?

C.H.U.D. is a glassy, floating desktop overlay that gives you instant visibility into your Claude Code session without ever typing a slash command. It's like a fighter jet HUD, but for AI coding sessions.

**Never wonder again:**
- "What model am I using right now?"
- "How many tokens have I burned?"
- "How long have I been in this session?"
- "What's my todo progress?"

C.H.U.D. shows it all in a beautiful, always-on-top overlay.

## ✨ Features

### 🎨 Beautiful Visual Design
- **Frosted glass aesthetic** with blur effects
- **Color-coded model badges** (Purple=Opus, Blue=Sonnet, Green=Haiku)
- **Animated progress bars** for tokens, cost, and todos
- **Pulsing status indicators** that show activity at a glance
- **Always-on-top** floating window you can drag anywhere

### 📊 Real-Time Session Tracking
- **Model detection** - Instantly see which Claude model is active
- **Token usage** - Separate input/output token bars with visual scaling
- **Cost estimation** - Real-time cost calculation based on current model pricing
- **Session timer** - Track how long you've been working
- **Message count** - See total exchanges in current session
- **Todo progress** - Visual progress bar synced with TodoWrite tool

### ⚙️ Optional Quota Tracking
- **Daily usage percentage** - See your organization's quota usage
- **Reset time** - Know when your limits refresh
- **Weekly totals** - Track usage across all organization members
- *(Requires Anthropic Admin API key)*

### 🔌 Seamless Integration
- **Hook-based events** - Receives real-time updates from Claude Code
- **Transcript parsing** - Automatically reads session data from local files
- **No slash commands** - Everything updates automatically
- **Zero configuration** - Works out of the box

## 🚀 Installation

### Prerequisites
- **macOS** (currently macOS only)
- **Node.js 18+**
- **Claude Code** installed and working

### Quick Start

```bash
# Clone the repository
cd ~/your-projects
git clone https://github.com/yourusername/chud.git
cd chud

# Install dependencies
npm install

# Install Claude Code hooks (one-time setup)
npm run setup

# Launch C.H.U.D.
npm start
```

That's it! The overlay will appear on your desktop.

## 📖 Usage

### Starting C.H.U.D.

```bash
cd ~/path/to/chud
npm start
```

The glassy overlay appears in the top-right of your screen (draggable anywhere).

### First Time Setup

**Hooks Installation (Required)**

The first time you run C.H.U.D., it automatically installs hooks to `~/.claude/settings.json`:

```bash
npm run setup
```

These hooks emit events when you:
- Start a new session
- Use tools (Read, Write, Edit, Bash, etc.)
- Update your todo list
- Switch models

**API Key (Optional)**

For organization quota tracking:

1. Click the ⚙️ gear icon in the overlay
2. Paste your Anthropic Admin API key (`sk-ant-admin-...`)
3. Click Save

*Note: Regular API keys won't work for quota tracking - you need an Admin key from your org.*

### Using C.H.U.D.

**It just works!** Once running:

- Work normally in Claude Code
- C.H.U.D. updates automatically
- No slash commands needed
- Drag the window anywhere on screen
- Click minimize (−) to dock it
- Click close (×) to quit

### Stopping C.H.U.D.

- Click the red × button, or
- Run: `pkill -f "Electron.*chud"`

## 🏗️ How It Works

C.H.U.D. uses three data sources:

### 1. Claude Code Hooks (Real-time)
- Installed to `~/.claude/settings.json`
- Fires on events: `SessionStart`, `PreToolUse`, `PostToolUse`, etc.
- Sends JSON to Unix socket at `/tmp/chud.sock`
- C.H.U.D. listens and updates instantly

### 2. Transcript Parsing (Every 2 seconds)
- Reads `~/.claude/projects/{project}/{session}.jsonl`
- Extracts: model name, token counts, message count
- Provides data even if hooks aren't active yet

### 3. Anthropic API (Every 60 seconds, optional)
- Polls organization usage endpoints
- Shows daily quota %, reset time, weekly totals
- Only works with Admin API keys

## 🎨 Visual Indicators

### Status Dot (Title Bar)
- 🟢 **Green** - Ready, connected to session
- 🟠 **Orange** - Processing (tool running)
- ⚪ **Gray** - Waiting for session

### Model Badge Colors
- 🟣 **Purple gradient** - Claude Opus (most capable)
- 🔵 **Blue gradient** - Claude Sonnet (balanced)
- 🟢 **Green gradient** - Claude Haiku (fastest)

### Progress Bars
- **Token bars** - Scale dynamically as usage grows
- **Cost bar** - Green → Orange → Red as cost increases
- **Todo bar** - Shows completion percentage
- **Quota bar** - Changes color at 60% (warning) and 80% (critical)

## ⚙️ Configuration

### Settings Panel
Click the ⚙️ gear icon to access:
- **API Key Management** - Add/update your Admin API key
- **Usage Status** - See if quota tracking is active

### Hook Configuration
Hooks are stored in `~/.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [...],
    "PreToolUse": [...],
    "PostToolUse": [...],
    "UserPromptSubmit": [...],
    "Stop": [...]
  }
}
```

To uninstall hooks:
```bash
npm run uninstall
```

### Data Storage
- **API keys** - Encrypted in `~/.chud/config.enc` using macOS Keychain
- **No other data stored** - C.H.U.D. is read-only

## 🐛 Troubleshooting

### "No session detected"
- Start a Claude Code session in your terminal
- C.H.U.D. will detect it within 2 seconds

### "Quota tracking not working"
- Requires Admin API key (`sk-ant-admin-...`)
- Regular API keys (`sk-ant-api-...`) won't work
- Only org admins can generate Admin keys
- C.H.U.D. works perfectly without quota tracking

### "Tool field is empty"
- Hooks only fire in NEW sessions
- Start a fresh Claude Code session after installing hooks
- Tool/status will update in real-time going forward

### Multiple overlays appearing
```bash
# Kill all instances
pkill -9 -f "Electron.*chud"
npm start
```

### Hooks not firing
```bash
# Reinstall hooks
npm run setup

# Check hooks are installed
cat ~/.claude/settings.json | grep emit-event.sh

# Start a NEW Claude Code session
```

## 🔧 Development

### Project Structure
```
chud/
├── src/
│   ├── main.js           # Electron main process
│   ├── preload.js        # IPC bridge
│   ├── renderer/         # UI (HTML/CSS/JS)
│   ├── socket.js         # Unix socket server
│   ├── events.js         # Hook event handler
│   ├── transcript.js     # Session file parser
│   ├── usage.js          # API client
│   └── state.js          # State management
├── hooks/
│   └── emit-event.sh     # Claude Code hook script
└── scripts/
    └── setup-hooks.js    # Hook installer
```

### Building

```bash
# Development mode (hot reload)
npm run dev

# Production build
npm start
```

### Tech Stack
- **Electron** - Desktop app framework
- **Node.js** - Runtime
- **Vanilla JS** - No frontend frameworks
- **Unix Sockets** - IPC with Claude Code

## 📋 Requirements

- macOS (10.13 High Sierra or later)
- Node.js 18+
- Claude Code (latest version)
- 50MB disk space

## 🗺️ Roadmap

### v0.2
- [ ] Windows support (named pipes)
- [ ] Linux testing
- [ ] Configurable window size/position
- [ ] Theme customization

### v1.0
- [ ] Distributable binary (.app)
- [ ] Auto-updater
- [ ] Session history view
- [ ] Export session stats

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing`
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built for the [Claude Code](https://claude.com/claude-code) community
- Inspired by fighter jet HUDs and gaming overlays
- Uses the [Anthropic API](https://anthropic.com)

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/chud/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/chud/discussions)
- **Twitter**: [@RealJBMangum]([https://twitter.com/yourusername](https://x.com/RealJBMangum))

---

**Made with ❤️ for Claude Code users who want instant visibility into their AI coding sessions**
