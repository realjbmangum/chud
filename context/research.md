# Complete guide to AI coding agents, skills, and configuration

AI coding agents are transforming software development by providing context-aware assistance that adapts to project-specific patterns. This reference covers four critical resources: the AGENTS.md specification for configuring AI agents across tools, a battle-tested Claude Code configuration system, Claudeception for autonomous skill extraction, and Vercel's agent-skills framework for distributing reusable capabilities. Together, they form a comprehensive toolkit for building effective AI-assisted development workflows.

---

## Source 1: AGENTS.md — The configuration standard for AI coding agents

### Core concept and purpose

AGENTS.md is a **configuration layer** that lives between an AI agent's base instructions and your codebase. It's a Markdown file (placed in repository root or home directory) that acts as a **briefing packet for AI coding agents**—essentially a README written for machines rather than humans.

| File | Audience | Purpose |
|------|----------|---------|
| README.md | Humans | Quick starts, project descriptions, contribution guidelines |
| AGENTS.md | AI Agents | Build steps, tests, conventions that would clutter README |

### Tool support and compatibility

AGENTS.md is an **open standard** supported by OpenAI Codex, Google Jules & Gemini CLI, Cursor, Factory, Amp, Aider, VS Code, GitHub Copilot Coding Agent, Windsurf, RooCode, Kilo Code, Zed, Warp, goose, opencode, Phoenix, Semgrep, and Devin. Claude Code uses `CLAUDE.md` instead—create a symlink for cross-compatibility:

```bash
ln -s AGENTS.md CLAUDE.md
```

### The progressive disclosure architecture

The core design principle is **progressive disclosure**: give the agent only what it needs immediately, and point it to other resources when needed. Large AGENTS.md files poison context, and stale documentation actively confuses AI agents (worse than for humans).

**Recommended directory structure:**
```
project-root/
├── AGENTS.md           # Root-level, minimal instructions
├── docs/
│   ├── TYPESCRIPT.md   # TypeScript conventions
│   └── TESTING.md      # Testing guidelines
└── packages/
    └── api/
        └── AGENTS.md   # Package-specific instructions
```

Nested AGENTS.md files **merge with the root level**, with the closest file to the edited file taking precedence. This enables monorepo patterns where each package maintains its own context.

### File discovery order and priority

| Priority | Source |
|----------|--------|
| 1 (Highest) | Explicit user chat prompts |
| 2 | Closest AGENTS.md to edited file |
| 3 | Parent directory AGENTS.md files |
| 4 | Root AGENTS.md |
| 5 (Lowest) | Global ~/.codex/AGENTS.md |

### Minimal template (recommended starting point)

```markdown
# AGENTS.md

## Setup commands
- Install deps: `pnpm install`
- Start dev server: `pnpm dev`
- Run tests: `pnpm test`

## Code style
- TypeScript strict mode
- Single quotes, no semicolons
- Use functional patterns where possible
```

### Comprehensive sample for monorepos

```markdown
# Sample AGENTS.md file

## Dev environment tips
- Use `pnpm dlx turbo run where <project_name>` to jump to a package instead of scanning with `ls`.
- Run `pnpm install --filter <project_name>` to add the package to your workspace.
- Use `pnpm create vite@latest <project_name> -- --template react-ts` to spin up a new React + Vite package.
- Check the name field inside each package's package.json to confirm the right name.

## Testing instructions
- Find the CI plan in the .github/workflows folder.
- Run `pnpm turbo run test --filter <project_name>` to run every check defined for that package.
- From the package root you can just call `pnpm test`. The commit should pass all tests before you merge.
- To focus on one step, add the Vitest pattern: `pnpm vitest run -t "<test name>"`.
- Add or update tests for the code you change, even if nobody asked.

## PR instructions
- Title format: [<project_name>] <Title>
- Always run `pnpm lint` and `pnpm test` before committing.
```

### Tool-specific configuration

**Aider** (`.aider.conf.yml`):
```yaml
read: AGENTS.md
```

**Gemini CLI** (`.gemini/settings.json`):
```json
{ "contextFileName": "AGENTS.md" }
```

**Firebender** (`.firebender/firebender.json`):
```json
{"rules":[{"filePathMatches":"*","rulesPaths":"~/AGENTS.md"}]}
```

### Best practices and critical warnings

**The ideal AGENTS.md contains:**
1. One-sentence project description (acts like a role-based prompt)
2. Package manager declaration (prevents wrong defaults)

**What to avoid:**
- Documenting file paths (they change constantly and poison context)
- Auto-generating AGENTS.md (floods the file with unnecessary content)
- Adding conflicting opinions without style review (treat AGENTS.md like code—do PR reviews)
- Exceeding 500 lines (long files slow agents and bury signal; aim for ≤150 lines)

**Describe capabilities, not structure.** Bad: "Authentication logic lives in src/auth/handlers.ts". Good: Describe what authentication does and let the agent discover the implementation.

---

## Source 2: Everything Claude Code — Production configuration after 10 months of daily use

### Author credentials and context

This configuration comes from Affaan Mustafa, who has used Claude Code since the experimental rollout in February 2025 and won the Anthropic x Forum Ventures hackathon ($15,000 in credits) building zenith.chat entirely with Claude Code.

### The six pillars of Claude Code configuration

#### 1. Skills (workflow definitions)

Skills are markdown files providing Claude specialized knowledge for specific workflows. They operate like rules constrained to certain scopes.

**Storage locations:**
- Global: `~/.claude/skills/`
- Project: `.claude/skills/`

Skills can be chained together with commands in a single prompt. Example use cases: `/refactor-clean` for dead code cleanup, `/tdd` for test-driven development.

#### 2. Hooks (event-triggered automations)

Hooks fire on tool events: `PreToolUse`, `PostToolUse`, `Stop`.

**Example—warn about console.log in code:**
```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] Remove console.log' >&2"
  }]
}
```

Pro tip: Use the `hookify` plugin to create hooks conversationally instead of writing JSON manually.

#### 3. Subagents (delegated processes)

Subagents are processes the main Claude can delegate tasks to with limited scopes. They can run in background or foreground, freeing context for the main orchestrator.

**Critical insight:** "A subagent with 50 tools will be slower and less focused than one with 5 tools scoped to its actual job."

**Example subagent definition:**
```markdown
---
name: code-reviewer
description: Reviews code for quality, security, and maintainability
tools: Read, Grep, Glob, Bash
model: opus
---
You are a senior code reviewer...
```

#### 4. Commands (slash command execution)

Commands are quick executable prompts stored at `~/.claude/commands/`. Examples: `/tdd`, `/e2e`, `/test-coverage`, `/plan`, `/code-review`, `/build-fix`, `/refactor-clean`, `/update-codemaps`, `/update-docs`.

#### 5. Rules (always-follow guidelines)

The `.rules` folder holds `.md` files with best practices Claude should **always** follow. Keep modular—separate files for security, coding-style, testing, git-workflow, etc.

#### 6. MCPs (Model Context Protocols)

MCPs connect Claude to external services directly. They're "not a replacement for APIs—it's a prompt-driven wrapper around them, allowing more flexibility in navigating information."

Example: Supabase MCP lets Claude pull specific data and run SQL directly.

### Context window management (critical)

**"Critical: Don't enable all MCPs at once. Your 200k context window can shrink to 70k with too many tools enabled."**

**Rules of thumb:**
- Have 20-30 MCPs configured total
- Keep under 10 enabled per project
- Under 80 tools active at any time
- Use `disabledMcpServers` in project config to disable unused ones

### Complete repository structure

```
everything-claude-code/
├── agents/           # Specialized subagents
│   ├── planner.md, architect.md, tdd-guide.md
│   ├── code-reviewer.md, security-reviewer.md
│   ├── build-error-resolver.md, e2e-runner.md
│   ├── refactor-cleaner.md, doc-updater.md
├── skills/           # Workflow definitions
│   ├── coding-standards.md, backend-patterns.md
│   ├── frontend-patterns.md, clickhouse-io.md
│   └── tdd-workflow/, security-review/
├── commands/         # Slash commands
├── rules/            # Always-follow guidelines
│   ├── security.md, coding-style.md, testing.md
│   ├── git-workflow.md, agents.md, performance.md
├── hooks/hooks.json  # Event-triggered automations
├── mcp-configs/      # MCP server configurations
├── plugins/          # Plugin documentation
└── examples/         # Example configurations
```

### Parallelization strategies

- **Fork conversations** with `/fork` for parallel non-overlapping tasks
- **Git worktrees** for running multiple Claudes without conflicts
- **tmux** for long-running commands and monitoring logs

---

## Source 3: Claudeception — Autonomous skill extraction and continuous learning

### The knowledge persistence problem

"Every time you use an AI coding agent, it starts from zero. You spend an hour debugging some obscure error, the agent figures it out, session ends. Next time you hit the same issue? Another hour."

Claudeception solves this by enabling Claude Code to **save discovered knowledge as reusable skills** automatically.

### How it works

1. **Discovery**: Claude Code's skills system loads skill names and descriptions (~100 tokens each) at startup
2. **Matching**: When working, Claude matches current context against skill descriptions
3. **Retrieval**: Relevant skills are pulled into context
4. **Writing**: Claudeception writes to the retrieval system, creating new skills
5. **Optimization**: Skills are written with descriptions optimized for future retrieval

**Description quality is critical:**
- ❌ "Helps with database problems" (won't match anything)
- ✅ "Fix for PrismaClientKnownRequestError in serverless" (matches exact errors)

### Installation

**Step 1—Clone the skill:**
```bash
# User-level (recommended)
git clone https://github.com/blader/Claudeception.git ~/.claude/skills/claudeception

# Project-level
git clone https://github.com/blader/Claudeception.git .claude/skills/claudeception
```

**Step 2—Set up the activation hook:**
```bash
mkdir -p ~/.claude/hooks
cp ~/.claude/skills/claudeception/scripts/claudeception-activator.sh ~/.claude/hooks/
chmod +x ~/.claude/hooks/claudeception-activator.sh
```

**Step 3—Add hook to settings** (`~/.claude/settings.json`):
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/claudeception-activator.sh"
          }
        ]
      }
    ]
  }
}
```

### Quality gates for skill extraction

**NOT every task produces a skill.** It only extracts knowledge that:
1. Required **actual discovery** (not just reading docs)
2. Will **help with future tasks**
3. Has **clear trigger conditions**
4. Has been **verified to work**

Quality test: "Would this actually help someone who hits this problem in six months? If not, no skill."

### Skill format

```yaml
---
name: prisma-connection-pool-exhaustion
description: |
  Fix for PrismaClientKnownRequestError: Too many database connections 
  in serverless environments (Vercel, AWS Lambda). Use when connection 
  count errors appear after ~5 concurrent requests.
author: Claude Code
version: 1.0.0
date: 2024-01-15
---

# Prisma Connection Pool Exhaustion

## Problem
[What this skill solves]

## Context / Trigger Conditions
[Exact error messages, symptoms, scenarios]

## Solution
[Step-by-step fix]

## Verification
[How to confirm it worked]
```

### Usage

**Automatic activation** occurs when Claude Code just completed debugging and discovered a non-obvious solution, found a workaround through investigation, or learned project-specific patterns.

**Explicit activation:**
```
/claudeception
```
or
```
Save what we just learned as a skill
```

### Activation rates

Hook-based activation achieves **~80-84% activation rate** vs ~20% with semantic matching alone.

---

## Source 4: Vercel agent-skills — Distributable capabilities for AI agents

### Framework overview

Vercel's agent-skills is a collection of skills for AI coding agents (Claude Code, Codex, Cursor, OpenCode) that extends agent capabilities through packaged instructions and scripts. It standardizes how agents access domain-specific knowledge.

### Three-layer architecture

1. **Authoring Layer**: Developers create skills with SKILL.md + scripts/*.sh
2. **Distribution Layer**: Skills packaged as .zip archives and published to GitHub
3. **Execution Layer**: Skills installed and run in Claude environments

### Skill structure requirements

```
skills/
  {skill-name}/              # kebab-case directory name
    SKILL.md                 # Required: skill definition
    scripts/                 # Required: executable scripts directory
      {script-name}.sh       # Bash scripts (preferred)
  {skill-name}.zip           # Required: packaged for distribution
```

### Lazy-loading lifecycle (three states)

| State | Context Consumption | Duration | Trigger |
|-------|---------------------|----------|---------|
| **Dormant** | ~20 tokens (name + description only) | Most of skill lifetime | Agent startup |
| **Active** | ~200-500 tokens (full SKILL.md) | Seconds to minutes | Trigger phrase match |
| **Executing** | 0 tokens (only output parsed) | Seconds | Script invocation |

### Installation

```bash
# Primary installation
npx add-skill vercel-labs/agent-skills

# Install specific skills
npx add-skill vercel-labs/agent-skills --skill frontend-design --skill skill-creator

# Install globally
npx add-skill vercel-labs/agent-skills -g

# List available skills
npx add-skill vercel-labs/agent-skills --list

# Non-interactive (CI/CD friendly)
npx add-skill vercel-labs/agent-skills --skill frontend-design -g -a claude-code -y
```

### Installation paths by agent

**Project-level (default):**
| Agent | Path |
|-------|------|
| OpenCode | `.opencode/skill/<name>/` |
| Claude Code | `.claude/skills/<name>/` |
| Codex | `.codex/skills/<name>/` |
| Cursor | `.cursor/skills/<name>/` |

**Global (`--global`):**
| Agent | Path |
|-------|------|
| Claude Code | `~/.claude/skills/<name>/` |
| Codex | `~/.codex/skills/<name>/` |

### SKILL.md format

```yaml
---
name: {skill-name}
description: {One sentence describing when to use this skill. Include trigger phrases.}
---

# {Skill Title}

{Brief description of what the skill does.}

## How It Works

1. First step
2. Second step
3. Third step

## Usage

```bash
/mnt/skills/user/{skill-name}/scripts/{script}.sh [arguments]
```

## Output

{Show example output}

## Troubleshooting

{Common issues and solutions}
```

### Available skills

#### react-best-practices

45+ rules across 8 categories for React and Next.js performance optimization:

1. **Eliminating Async Waterfalls** (CRITICAL)
2. **Bundle Size Optimization** (CRITICAL)
3. **Server-side Performance**
4. **Client-side Data Fetching**
5. **Re-render Optimization**
6. **Rendering Performance**
7. **Advanced Patterns**
8. **JavaScript Performance**

**Example—fixing async waterfalls:**

*Incorrect (sequential awaits):*
```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId)
  
  if (skipProcessing) {
    return { skipped: true }
  }
  
  return processUserData(userData)
}
```

*Correct (conditional fetching):*
```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  if (skipProcessing) {
    return { skipped: true }
  }
  
  const userData = await fetchUserData(userId)
  return processUserData(userData)
}
```

**LRU cache pattern for cross-request caching:**
```typescript
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 5 * 60 * 1000 // 5 minutes
})

export async function getUser(id: string) {
  const cached = cache.get(id)
  if (cached) return cached
  
  const user = await db.user.findUnique({ where: { id } })
  cache.set(id, user)
  return user
}
```

#### web-design-guidelines

Audits code for 100+ rules covering accessibility, performance, and UX across 8 categories: Interactions, Animations, Layout, Content, Forms, Performance, Design, and Copywriting.

**Trigger phrases:** "Review my UI", "Check accessibility", "Audit design"

#### vercel-deploy

Deploy applications to Vercel instantly with no authentication required. Deployments are "claimable"—users can transfer ownership to their own Vercel account.

**Usage:**
```bash
# Deploy current directory
bash /mnt/skills/user/vercel-deploy/scripts/deploy.sh

# Deploy specific project
bash /mnt/skills/user/vercel-deploy/scripts/deploy.sh /path/to/project
```

**Output:**
```json
{
  "previewUrl": "https://skill-deploy-abc123.vercel.app",
  "claimUrl": "https://vercel.com/claim-deployment?code=...",
  "deploymentId": "dpl_...",
  "projectId": "prj_..."
}
```

### Script requirements

```bash
#!/bin/bash
set -e

# Cleanup trap for temporary files
cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Status messages to stderr (human output)
echo "Processing..." >&2

# Machine-readable output (JSON) to stdout
echo '{"result": "success"}'
```

---

## Code examples and patterns summary

### Pattern 1: Minimal AGENTS.md configuration

```markdown
# AGENTS.md

This project uses pnpm workspaces.
This is a React component library for accessible data visualization.

## Setup
- Install: `pnpm install`
- Dev: `pnpm dev`
- Test: `pnpm test`
```

### Pattern 2: Claude Code hook for code quality

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] Remove console.log' >&2"
  }]
}
```

### Pattern 3: Scoped subagent definition

```markdown
---
name: code-reviewer
description: Reviews code for quality, security, and maintainability
tools: Read, Grep, Glob, Bash
model: opus
---
You are a senior code reviewer. Focus on security vulnerabilities, 
performance issues, and maintainability concerns.
```

### Pattern 4: Skill with YAML frontmatter

```yaml
---
name: prisma-connection-pool-exhaustion
description: |
  Fix for PrismaClientKnownRequestError: Too many database connections 
  in serverless environments (Vercel, AWS Lambda).
author: Claude Code
version: 1.0.0
---
```

### Pattern 5: Progressive skill loading hook

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/claudeception-activator.sh"
          }
        ]
      }
    ]
  }
}
```

### Pattern 6: Self-cleaning bash script for skills

```bash
#!/bin/bash
set -e

TEMP_DIR=$(mktemp -d)
cleanup() { rm -rf "$TEMP_DIR"; }
trap cleanup EXIT

echo "Deploying..." >&2
# ... deployment logic ...
echo '{"previewUrl": "https://example.vercel.app"}'
```

---

## Key takeaways and actionable insights

### Context management is everything

The **200k context window can shrink to 70k** with too many tools enabled. Apply the rule of thumb: 20-30 MCPs configured total, under 10 enabled per project, under 80 tools active. Use progressive disclosure—load information only when needed, not upfront.

### AGENTS.md should be minimal and referential

The ideal AGENTS.md contains just a one-sentence project description and package manager declaration, with pointers to detailed documentation. Stale documentation actively poisons AI context—worse than having no docs at all. Never auto-generate these files.

### Skills beat ad-hoc prompting

Codified skills (reusable markdown files with frontmatter) provide consistent, retrievable workflows. They load lazily (~20 tokens dormant, ~200-500 tokens active) and can be chained. Invest in building a skill library rather than repeating prompt engineering.

### Subagent scoping determines performance

"A subagent with 50 tools will be slower and less focused than one with 5 tools scoped to its actual job." Always scope subagents to minimum required tools, permissions, and context.

### Continuous learning through skill extraction

Claudeception demonstrates a powerful pattern: agents that write to their own skill retrieval system. This transforms debugging sessions into persistent, reusable knowledge. The quality test: "Would this help someone hitting this problem in six months?"

### Description quality determines retrieval quality

For semantic skill matching, vague descriptions like "Helps with database problems" fail to match. Specific descriptions like "Fix for PrismaClientKnownRequestError in serverless" match exact error conditions.

### Hooks automate quality gates

Use hooks for automated enforcement: lint checking on edit, console.log warnings, test reminders. The `PostToolUse` hook on edits catches issues before they propagate.

### Parallelization multiplies throughput

Fork conversations with `/fork`, use git worktrees for multiple Claudes without conflicts, and leverage tmux for long-running commands. Design workflows for parallel execution.

### The skill lifecycle enables efficient context use

| State | Context Cost | When |
|-------|--------------|------|
| Dormant | ~20 tokens | Most of the time |
| Active | ~200-500 tokens | On trigger match |
| Executing | 0 tokens | Script runs outside context |

### Cross-tool compatibility requires symlinks

```bash
ln -s AGENTS.md CLAUDE.md
ln -s ../.ai/commands .claude/commands
ln -s ../.ai/commands .codex/prompts
```

This enables the same configuration to work across Codex, Claude Code, Cursor, and other tools supporting the emerging standards.