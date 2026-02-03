// Trigger system for prompting users to record stories

export interface Trigger {
  id: string;
  type: 'life_event' | 'category_gap' | 'streak_milestone' | 'seasonal' | 'custom';
  title: string;
  description: string;
  prompt?: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

export interface UpcomingEvent {
  id: string;
  event_type: string;
  title: string;
  event_date: string;
  member_name?: string;
}

export interface CategoryProgress {
  category: string;
  stories_count: number;
  total_prompts: number;
}

// Check for category gaps (categories with low completion)
export function getCategoryGapTriggers(
  categories: CategoryProgress[],
  threshold = 0.3
): Trigger[] {
  return categories
    .filter(cat => {
      const percentage = cat.total_prompts > 0
        ? cat.stories_count / cat.total_prompts
        : 0;
      return percentage < threshold && cat.stories_count < 3;
    })
    .map(cat => ({
      id: `category_gap_${cat.category}`,
      type: 'category_gap' as const,
      title: `Complete your ${getCategoryName(cat.category)} stories`,
      description: `You only have ${cat.stories_count} stories in this category`,
      priority: 'medium' as const,
      icon: getCategoryIcon(cat.category),
    }));
}

// Check for upcoming life events
export function getLifeEventTriggers(events: UpcomingEvent[]): Trigger[] {
  const today = new Date();
  const oneWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  return events
    .filter(event => {
      const eventDate = new Date(event.event_date);
      return eventDate >= today && eventDate <= oneWeek;
    })
    .map(event => ({
      id: `event_${event.id}`,
      type: 'life_event' as const,
      title: event.title,
      description: getEventDescription(event),
      prompt: getEventPrompt(event),
      priority: isEventTomorrow(event.event_date) ? 'high' as const : 'medium' as const,
      icon: getEventIcon(event.event_type),
    }));
}

// Check for streak milestones approaching
export function getStreakTriggers(currentStreak: number): Trigger[] {
  const triggers: Trigger[] = [];

  // Check if close to milestone
  const milestones = [7, 30, 100, 365];
  for (const milestone of milestones) {
    if (currentStreak === milestone - 1) {
      triggers.push({
        id: `streak_${milestone}`,
        type: 'streak_milestone',
        title: `Almost at ${milestone} days!`,
        description: `Record today to reach a ${milestone}-day streak`,
        priority: 'high',
        icon: '🔥',
      });
    }
  }

  // Remind to keep streak going
  if (currentStreak >= 3) {
    triggers.push({
      id: 'streak_reminder',
      type: 'streak_milestone',
      title: `Keep your ${currentStreak}-day streak!`,
      description: 'Record a story today to continue your streak',
      priority: 'medium',
      icon: '⚡',
    });
  }

  return triggers;
}

// Seasonal triggers based on current date
export function getSeasonalTriggers(): Trigger[] {
  const triggers: Trigger[] = [];
  const today = new Date();
  const month = today.getMonth();
  const day = today.getDate();

  // Holiday season (December)
  if (month === 11) {
    triggers.push({
      id: 'holiday_season',
      type: 'seasonal',
      title: 'Holiday Memory Time',
      description: 'Capture your favorite holiday traditions',
      prompt: 'What holiday tradition means the most to you?',
      priority: 'medium',
      icon: '🎄',
    });
  }

  // New Year (January 1-7)
  if (month === 0 && day <= 7) {
    triggers.push({
      id: 'new_year',
      type: 'seasonal',
      title: 'New Year Reflections',
      description: 'Reflect on the past year',
      prompt: 'What was the most memorable moment from last year?',
      priority: 'medium',
      icon: '✨',
    });
  }

  // Summer (June-August)
  if (month >= 5 && month <= 7) {
    triggers.push({
      id: 'summer_memories',
      type: 'seasonal',
      title: 'Summer Stories',
      description: 'Capture your summer adventures',
      prompt: 'What\'s your favorite summer memory?',
      priority: 'low',
      icon: '☀️',
    });
  }

  // Mother's Day / Father's Day (May/June)
  if (month === 4 || month === 5) {
    triggers.push({
      id: 'parent_appreciation',
      type: 'seasonal',
      title: 'Parent Appreciation',
      description: 'Share stories about your parents',
      prompt: 'What life lesson did your parents teach you?',
      priority: 'medium',
      icon: '💝',
    });
  }

  return triggers;
}

// Get all active triggers sorted by priority
export function getAllTriggers(
  categories: CategoryProgress[],
  events: UpcomingEvent[],
  currentStreak: number,
  isActiveToday: boolean
): Trigger[] {
  const triggers: Trigger[] = [];

  // Don't show streak triggers if already recorded today
  if (!isActiveToday) {
    triggers.push(...getStreakTriggers(currentStreak));
  }

  triggers.push(...getLifeEventTriggers(events));
  triggers.push(...getCategoryGapTriggers(categories));
  triggers.push(...getSeasonalTriggers());

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  triggers.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Return top 3
  return triggers.slice(0, 3);
}

// Helper functions
function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    'early-life': 'Early Life',
    'school': 'School Years',
    'career': 'Career',
    'love': 'Love & Family',
    'parenting': 'Parenting',
    'adventures': 'Adventures',
    'traditions': 'Traditions',
    'values': 'Values & Beliefs',
    'health': 'Health',
    'legacy': 'Legacy',
  };
  return names[category] || category;
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'early-life': '👶',
    'school': '🎓',
    'career': '💼',
    'love': '❤️',
    'parenting': '👨‍👩‍👧',
    'adventures': '🌍',
    'traditions': '🎄',
    'values': '💡',
    'health': '🏃',
    'legacy': '⭐',
  };
  return icons[category] || '📝';
}

function getEventIcon(eventType: string): string {
  const icons: Record<string, string> = {
    birthday: '🎂',
    anniversary: '💍',
    holiday: '🎉',
    memorial: '🕯️',
    custom: '📅',
  };
  return icons[eventType] || '📅';
}

function getEventDescription(event: UpcomingEvent): string {
  const eventDate = new Date(event.event_date);
  const today = new Date();
  const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return 'Today!';
  if (diffDays === 1) return 'Tomorrow';
  return `In ${diffDays} days`;
}

function getEventPrompt(event: UpcomingEvent): string {
  switch (event.event_type) {
    case 'birthday':
      return event.member_name
        ? `What's a favorite memory with ${event.member_name}?`
        : 'Share a memory about this special day';
    case 'anniversary':
      return 'What moment from this relationship stands out?';
    case 'memorial':
      return 'Share a cherished memory of this person';
    default:
      return 'Record your thoughts about this occasion';
  }
}

function isEventTomorrow(dateStr: string): boolean {
  const eventDate = new Date(dateStr);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return eventDate.toDateString() === tomorrow.toDateString();
}

export default { getAllTriggers, getCategoryGapTriggers, getLifeEventTriggers, getStreakTriggers, getSeasonalTriggers };
