# Heirloom App Wireframe

**Last Updated:** December 1, 2025

---

## Home Screen

- **Logo** (top)
- **Daily Prompt / Legacy Question**
  - Example: "What is your favorite childhood memory?"
  - **Recording Options:**
    - Audio
    - Video
    - Upload (existing media)
  - Select Category and Name the Memory
  - Choose another prompt
  - Create my own legacy question

---

## My Vault / Library

Personal collection of recorded memories.

- **Layout:** Horizontally scrollable, clickable story cards
- **Organization:** Sorted by latest video/date
- **Story Card Thumbnails** with preview

### Filter by Category
- Childhood
- Career
- Family
- Faith
- Legacy
- Shuffle (random)

---

## Family Vault / Library

Shared family memories from connected family members.

- **Header:** "What's new in my family?"
- **Layout:** Horizontally scrollable, clickable story cards
- **Organization:** Sorted by latest video/date
- **Story Card Thumbnails** with preview

### Filter by Category
- Childhood
- Career
- Family
- Faith
- Legacy
- Shuffle (random)

---

## Create A Time Capsule

Schedule memories to be revealed at a future date.

- **Recipients:** Create for one or many people
- **Release Date:** Select when the capsule opens
- **Content Options:**
  - Select existing content from the Vault
  - Create new Video/Audio specifically for the capsule

---

## My Account

- **Settings**
- **Preferences**
- **About**
- **FAQ**
- **Security**
- **Terms**
- **Privacy**
- **Contact**

---

## Navigation Structure

```
┌─────────────────────────────────────┐
│              Home                   │
│  ┌─────────────────────────────┐   │
│  │    Daily Prompt Card        │   │
│  │    [Record] [Upload]        │   │
│  └─────────────────────────────┘   │
│                                     │
│  My Vault ──────────────────────►  │
│  [Card] [Card] [Card] [Card]       │
│                                     │
│  Family Vault ──────────────────►  │
│  [Card] [Card] [Card] [Card]       │
│                                     │
│  [+ Create Time Capsule]           │
│                                     │
└─────────────────────────────────────┘
     [Home] [Vault] [Family] [Account]
```
