// Achievement Definitions for Heirloom

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'recording' | 'streak' | 'family' | 'milestone';
  threshold?: number;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Recording achievements
  {
    id: 'first_story',
    name: 'First Memory',
    description: 'Record your first story',
    icon: '🌱',
    category: 'recording',
    threshold: 1,
  },
  {
    id: 'ten_stories',
    name: 'Storyteller',
    description: 'Record 10 stories',
    icon: '📚',
    category: 'recording',
    threshold: 10,
  },
  {
    id: 'fifty_stories',
    name: 'Chronicle Keeper',
    description: 'Record 50 stories',
    icon: '📖',
    category: 'recording',
    threshold: 50,
  },
  {
    id: 'hundred_stories',
    name: 'Legacy Builder',
    description: 'Record 100 stories',
    icon: '🏛️',
    category: 'recording',
    threshold: 100,
  },
  {
    id: 'all_categories',
    name: 'Well-Rounded',
    description: 'Record a story in every category',
    icon: '🎯',
    category: 'recording',
  },

  // Streak achievements
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'streak',
    threshold: 7,
  },
  {
    id: 'streak_30',
    name: 'Monthly Maven',
    description: 'Maintain a 30-day streak',
    icon: '⚡',
    category: 'streak',
    threshold: 30,
  },
  {
    id: 'streak_100',
    name: 'Century Champion',
    description: 'Maintain a 100-day streak',
    icon: '🌟',
    category: 'streak',
    threshold: 100,
  },
  {
    id: 'streak_365',
    name: 'Year of Memories',
    description: 'Maintain a 365-day streak',
    icon: '👑',
    category: 'streak',
    threshold: 365,
  },

  // Family achievements
  {
    id: 'first_share',
    name: 'Sharing is Caring',
    description: 'Share your first story with family',
    icon: '💝',
    category: 'family',
    threshold: 1,
  },
  {
    id: 'family_creator',
    name: 'Family Founder',
    description: 'Create a family vault',
    icon: '🏠',
    category: 'family',
  },
  {
    id: 'family_tree_5',
    name: 'Growing Tree',
    description: 'Add 5 members to your family tree',
    icon: '🌳',
    category: 'family',
    threshold: 5,
  },
  {
    id: 'family_tree_10',
    name: 'Deep Roots',
    description: 'Add 10 members to your family tree',
    icon: '🌲',
    category: 'family',
    threshold: 10,
  },

  // Milestone achievements
  {
    id: 'first_birthday_story',
    name: 'Birthday Memories',
    description: 'Record a story for a birthday',
    icon: '🎂',
    category: 'milestone',
  },
  {
    id: 'holiday_memories',
    name: 'Holiday Spirit',
    description: 'Record stories for 5 different holidays',
    icon: '🎄',
    category: 'milestone',
    threshold: 5,
  },
  {
    id: 'video_star',
    name: 'Video Star',
    description: 'Record 5 video stories',
    icon: '🎬',
    category: 'milestone',
    threshold: 5,
  },
  {
    id: 'photo_album',
    name: 'Photo Album',
    description: 'Add 10 photo stories',
    icon: '📷',
    category: 'milestone',
    threshold: 10,
  },
];

export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

export function getAchievementsByCategory(category: AchievementDefinition['category']): AchievementDefinition[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

export function checkRecordingAchievements(totalStories: number): string[] {
  const earned: string[] = [];

  if (totalStories >= 1) earned.push('first_story');
  if (totalStories >= 10) earned.push('ten_stories');
  if (totalStories >= 50) earned.push('fifty_stories');
  if (totalStories >= 100) earned.push('hundred_stories');

  return earned;
}

export function checkStreakAchievements(currentStreak: number): string[] {
  const earned: string[] = [];

  if (currentStreak >= 7) earned.push('streak_7');
  if (currentStreak >= 30) earned.push('streak_30');
  if (currentStreak >= 100) earned.push('streak_100');
  if (currentStreak >= 365) earned.push('streak_365');

  return earned;
}

export function checkFamilyTreeAchievements(memberCount: number): string[] {
  const earned: string[] = [];

  if (memberCount >= 5) earned.push('family_tree_5');
  if (memberCount >= 10) earned.push('family_tree_10');

  return earned;
}

export default ACHIEVEMENTS;
