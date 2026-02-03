# Heirloom PWA - UX Overhaul Session
**Date:** December 23, 2025

## Overview
Complete UX overhaul of the Heirloom PWA, transforming it from a basic MVP into a polished family storytelling experience with dashboard, progress tracking, calendar, family tree, and milestone system.

---

## What Was Built

### 1. Database Schema (New Tables)
Created `supabase/migrations/20251223_ux_overhaul.sql`:

| Table | Purpose |
|-------|---------|
| `family_tree_members` | Family tree nodes (users or placeholders) |
| `family_relationships` | Parent/child/spouse/sibling connections |
| `life_events` | Birthdays, anniversaries, holidays, memorials |
| `user_streaks` | Daily/weekly recording streak tracking |
| `user_achievements` | Badges and milestones earned |
| `user_category_progress` | Stories recorded per category |
| `activity_feed` | Recent activity for dashboard |

**Triggers added:**
- Auto-update category progress on story insert
- Auto-update streaks on story insert
- Auto-add activity feed entry on story insert

### 2. Design System (`apps/pwa/src/index.css`)
- Design tokens (colors, spacing, shadows, radius)
- Typography scale (headings, body, labels, captions)
- Button variants (primary, secondary, gold, ghost, danger)
- Card variants (default, elevated, floating, interactive)
- Category badges with unique colors
- Progress bars and rings
- Animations (fade-in, slide-up, scale-bounce, pulse-gold, shimmer)
- Skeleton loaders

### 3. UI Component Library (`apps/pwa/src/components/ui/`)
- `Button.tsx` - Multiple variants and sizes
- `Card.tsx` - Elevation levels
- `Badge.tsx` - Category and status badges
- `Avatar.tsx` - With initials fallback and rings
- `Modal.tsx` - Center modal and bottom sheet
- `Progress.tsx` - Bar, ring, and category progress
- `Skeleton.tsx` - Loading states
- `EmptyState.tsx` - Empty, error, and loading states

### 4. Custom Hooks (`apps/pwa/src/hooks/`)
- `useDashboard.ts` - Aggregates all dashboard data
- `useProgress.ts` - Category progress tracking
- `useStreaks.ts` - Daily/weekly streak management
- `useCalendar.ts` - Calendar data and navigation
- `useFamilyTree.ts` - Family tree CRUD operations

### 5. New Pages

#### Dashboard (`pages/Dashboard.tsx`)
Replaced Home.tsx with new dashboard featuring:
- Greeting with user's name
- Overall progress ring
- Streak display with emoji
- Weekly goal tracker
- Achievement badges count
- Today's prompt card with recording options
- Category progress horizontal scroll
- Upcoming events section
- Activity feed with My/Family toggle

#### Calendar (`pages/Calendar.tsx`)
- Monthly calendar grid view
- List view option
- Story indicators (green dots)
- Event indicators (gold dots)
- Day detail bottom sheet
- Navigation between months
- Today button

#### Family Tree (`pages/FamilyTree.tsx`)
- Interactive pan and zoom
- Generation-based layout
- Visual member nodes with avatars
- Spouse connections with heart icon
- Parent-child connection lines
- Hover to reveal add button
- Relationship type picker with emojis
- Add member modal with placeholder option

### 6. Supporting Libraries (`apps/pwa/src/lib/`)
- `achievements.ts` - 16 achievement definitions across 4 categories
- `triggers.ts` - Smart prompts for events, category gaps, streaks, seasonal

### 7. Navigation Updates
- TabBar: Home → Calendar → Record → Family → Profile
- Added routes: `/calendar`, `/tree`, `/family/tree`
- FamilyVault header now links to Family Tree

---

## RLS Policy Fixes
Fixed several Row Level Security issues:

```sql
-- Allow viewing families you created OR are member of
DROP POLICY IF EXISTS "Users can view families they belong to" ON families;
CREATE POLICY "Users can view families they belong to" ON families
  FOR SELECT USING (
    created_by = auth.uid()
    OR id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

-- Allow users to add themselves as members
DROP POLICY "Admins can add family members" ON family_members;
CREATE POLICY "Users can add themselves as members" ON family_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Allow creating family vaults
DROP POLICY "Users can create personal vaults" ON vaults;
CREATE POLICY "Users can create vaults" ON vaults
  FOR INSERT WITH CHECK (true);
```

---

## Files Changed/Created

### New Files (26)
```
apps/pwa/src/components/family/FamilyTreeNode.tsx
apps/pwa/src/components/family/MemberCard.tsx
apps/pwa/src/components/ui/Avatar.tsx
apps/pwa/src/components/ui/Badge.tsx
apps/pwa/src/components/ui/Button.tsx
apps/pwa/src/components/ui/Card.tsx
apps/pwa/src/components/ui/EmptyState.tsx
apps/pwa/src/components/ui/Modal.tsx
apps/pwa/src/components/ui/Progress.tsx
apps/pwa/src/components/ui/Skeleton.tsx
apps/pwa/src/components/ui/index.ts
apps/pwa/src/hooks/useCalendar.ts
apps/pwa/src/hooks/useDashboard.ts
apps/pwa/src/hooks/useFamilyTree.ts
apps/pwa/src/hooks/useProgress.ts
apps/pwa/src/hooks/useStreaks.ts
apps/pwa/src/lib/achievements.ts
apps/pwa/src/lib/triggers.ts
apps/pwa/src/pages/Calendar.tsx
apps/pwa/src/pages/Dashboard.tsx
apps/pwa/src/pages/FamilyTree.tsx
supabase/migrations/20251223_ux_overhaul.sql
```

### Modified Files
```
apps/pwa/src/App.tsx
apps/pwa/src/components/TabBar.tsx
apps/pwa/src/index.css
apps/pwa/src/pages/FamilyVault.tsx
```

---

## Git Commits
1. `31b78dd` - Complete UX overhaul with dashboard, calendar, and family tree
2. `300aeb9` - Redesign Family Tree with interactive visual map

---

## Next Steps / Future Improvements
- [ ] Photo upload for family tree members
- [ ] Edit member functionality
- [ ] Achievement celebration animations (confetti)
- [ ] Push notifications for streaks and events
- [ ] Family tree export/share
- [ ] More sophisticated tree layout algorithm for large families
- [ ] Recurring event handling in calendar
- [ ] Category-specific prompt suggestions based on progress
