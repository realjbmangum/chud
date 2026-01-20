# Product Requirements Document: JGen

**Status:** Post-hoc Documentation (Existing App)
**Version:** 2.0
**Last Updated:** January 2026

---

## Overview

### What is JGen?

JGen (pronounced "jay-gen") is a **Visual Image Prompt Builder** - a web-based GUI application for constructing and editing structured prompts for AI image generators. Instead of writing complex prompts from scratch, users build them visually using forms, dropdowns, sliders, and preset selections.

### Who is it for?

1. **AI Image Enthusiasts** - People who use Midjourney, Stable Diffusion, DALL-E, or Flux regularly and want a faster, more organized way to create prompts
2. **Creative Professionals** - Designers and artists who need consistent, well-structured prompts for their work
3. **Beginners** - Users new to AI image generation who benefit from guided prompt construction
4. **Power Users** - Those who import prompts from ChatGPT/Claude and want to refine them visually

### Core Value Proposition

- Transform the complex art of prompt engineering into an intuitive visual experience
- Support multiple AI platforms with platform-specific syntax
- Enable prompt sharing, reuse, and iteration through history and presets

---

## Goals

### Primary Objectives

1. **Simplify Prompt Creation** - Make building image generation prompts accessible to users of all skill levels
2. **Support Multiple Platforms** - Generate properly formatted output for Midjourney, Stable Diffusion, DALL-E, Flux, and generic use
3. **Enable Iteration** - Allow users to save, recall, and refine prompts over time
4. **Bridge AI Tools** - Import JSON prompts from ChatGPT/Claude and refine them with the GUI

### Success Metrics (Implicit)

- Users can create effective prompts without memorizing syntax
- Prompts export correctly for each supported platform
- Users return to refine and reuse their saved prompts

---

## Non-Goals

### What JGen Explicitly Does NOT Do

1. **No Image Generation** - JGen builds prompts; it does not generate images itself
2. **No API Integration** - Currently operates entirely client-side with no backend or API calls to image generators
3. **No User Accounts** - All data is stored in browser localStorage; there's no authentication or cloud sync
4. **No Collaboration** - Single-user experience; no shared workspaces or team features
5. **No Prompt Marketplace** - No community sharing or prompt library browsing
6. **No Image Upload** - No img2img support or image analysis features

---

## User Stories

### Basic Mode User

**As a casual user, I want to:**

1. Select what type of subject I'm creating (person, animal, landscape, etc.)
2. Describe my subject in plain text
3. Choose appearance details through dropdowns (for people: hair color, body type, age, etc.)
4. Set the scene with activity, location, and time period
5. Pick a visual style from image previews (photograph, anime, oil painting, etc.)
6. Select lighting with visual previews
7. Copy my finished prompt and use it in Midjourney/SD/DALL-E

### Advanced Mode User

**As a power user, I want to:**

1. Have granular control over every prompt parameter
2. Specify exact art styles, moods, and lighting options
3. Add artist influences (e.g., "in the style of Greg Rutkowski")
4. Control camera settings (focal length, shot type, depth of field)
5. Fine-tune detail and creativity levels with sliders
6. Set specific seeds for reproducibility
7. Manage negative prompts with presets and custom entries

### JSON Import User

**As someone using ChatGPT/Claude for prompts, I want to:**

1. Paste a JSON prompt from an AI assistant
2. Have JGen automatically parse and map fields to the GUI
3. Refine the prompt using visual controls
4. Export the modified prompt while preserving the original structure

### Export User

**As a user ready to generate, I want to:**

1. See my prompt in the correct format for my chosen platform
2. View the prompt length against platform limits (with warnings)
3. Copy the prompt with one click
4. Download as JSON/YAML/Markdown for documentation
5. Share via URL (for smaller prompts)

---

## Technical Considerations

### Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Components | shadcn/ui |
| State | Zustand with localStorage persistence |
| Styling | OKLch colors, glassmorphism, cyberpunk theme |
| Export | Client-side generation (no backend) |

### Architecture Patterns

1. **Client-Only** - No server-side logic; all processing happens in the browser
2. **Persistent State** - Zustand store persisted to localStorage with versioned migrations
3. **Two Modes** - Basic (preset-driven) and Advanced (full control) with data sync between them
4. **Hybrid JSON System** - Imported JSON preserved and merged with GUI edits on export

### Key Files

| File | Purpose |
|------|---------|
| `/src/app/page.tsx` | Main page with mode toggle and panel layout |
| `/src/store/prompt-store.ts` | Zustand store with all state and actions |
| `/src/lib/types/prompt.ts` | TypeScript types, platform limits, preset options |
| `/src/lib/presets/basic.ts` | Subject types, activities, locations, styles |
| `/src/components/builder/BasicBuilder.tsx` | Simplified UI for basic mode |
| `/src/components/builder/PreviewPanel.tsx` | Live prompt preview and generation |
| `/src/components/builder/ExportPanel.tsx` | Multi-format export functionality |

### State Management

The Zustand store maintains:

- **Mode** - "basic" or "advanced"
- **Config** - Core prompt configuration (subject, style, technical, negative, platform)
- **BasicSelections** - Subject type, activity, location, person/animal/creature details
- **History** - Last 50 prompts (auto-saved on export)
- **SavedPresets** - Up to 100 named presets
- **ImportedJson** - Original JSON from import (for merge on export)

### Platform-Specific Output

| Platform | Format |
|----------|--------|
| Midjourney | `prompt --ar 16:9 --v 6.1 --no negative --chaos N` |
| Stable Diffusion | `Positive: prompt\nNegative: negative\nSteps: N, CFG: N` |
| DALL-E | Natural language with "Avoid:" suffix |
| Flux | JSON object with prompt, negative_prompt, aspect_ratio |
| Generic | Plain text with optional negative section |

### Prompt Length Limits

The app tracks character counts and warns users:

| Platform | Soft Limit | Hard Limit |
|----------|------------|------------|
| Midjourney v6+ | 4,000 | 6,000 |
| Stable Diffusion | 200 | 300 |
| SDXL | 450 | 600 |
| DALL-E 3 | 3,000 | 4,000 |
| Flux | 400 | 512 |

---

## Current State

### Implemented Features

#### Basic Mode
- 9 subject types with visual selection (person, group, animal, creature, character, landscape, building, object, abstract)
- Subject-specific detail forms:
  - **Person/Character**: Age, skin tone, body type, hair color/style, eye color, facial features, skin details
  - **Animal**: Species, breed, size, coloring, pose
  - **Creature**: Type, size, coloring, fantasy features
  - **Landscape**: Terrain, time of day, weather, season
  - **Building**: Type, architecture style, condition
  - **Object**: Category, material, condition
  - **Abstract**: Pattern, movement, complexity, colors
- Scene settings: Activity, location, time period, clothing
- 12 style presets with image previews
- 8 lighting presets with image previews
- Suggestion chips for inspiration

#### Advanced Mode
- Full subject input (main, action, details)
- Art style, mood, and lighting dropdowns
- Artist influence input
- Color palette selection
- Camera controls (shot type, angle, focal length, depth of field)
- Film type simulation
- Render engine selection (for 3D)
- Advanced lighting (direction, intensity, color, shadows)
- Detail and creativity sliders
- Seed control
- Quality tag toggles
- Negative prompt builder with presets

#### JSON System
- Import any JSON from ChatGPT/Claude
- Smart field mapping (detects subject, scene, lighting, identity_lock, etc.)
- Preserves original structure
- Exports merged GUI + original JSON
- Live JSON viewer

#### Export
- 5 formats: Native (platform-specific), JSON, YAML, XML, Markdown
- Copy to clipboard
- Download as file
- Share via URL (for smaller prompts)
- Prompt length indicator with platform warnings

#### Utility Features
- "I'm Feeling Lucky" random prompt generator
- History panel (50 entries)
- Saved presets (100 entries)
- Dark/light theme toggle
- Mode switch with data sync
- Reset functionality
- Responsive design

### Known Issues

- Users upgrading from old localStorage may need to clear storage manually
- URL sharing fails silently for large prompts (now shows error)

---

## Future Considerations

The following are potential enhancements identified in the codebase (from CLAUDE.md):

### Short-term
1. Add sampler, steps, and CFG controls for Stable Diffusion users
2. Test hybrid JSON import with more complex prompt structures

### Medium-term
1. Direct API integration for image generation (generate images within JGen)
2. User accounts via Clerk
3. Cloud sync for prompts and presets

### Long-term
1. Prompt templates library
2. Community sharing
3. Image-to-prompt (analyze existing images)
4. Batch prompt generation

---

## Design System

### Visual Identity
- **Theme**: Cyberpunk aesthetic
- **Colors**: OKLch color space, neon accents
- **Effects**: Glassmorphism, glow effects, gradient text
- **Typography**: Clean, modern sans-serif

### Component Patterns
- Glass cards with subtle borders
- Neon glow on interactive elements
- Terminal-style preview panel
- Image-preview buttons for styles and lighting
- Badge-based toggle selections

---

## Session History

- **Dec 19, 2025**: v2.0 cyberpunk redesign
- **Dec 20, 2025**: JSON hybrid import, prompt length indicator, seed fix
- **Ongoing**: Style/lighting preview images generated for all subject types

---

*This PRD documents JGen as it exists. It is intended as a reference for future development and onboarding.*
