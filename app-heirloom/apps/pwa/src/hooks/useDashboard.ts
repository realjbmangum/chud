import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useProgress, CATEGORIES } from './useProgress';
import { useStreaks } from './useStreaks';

interface Achievement {
  id: string;
  achievement_type: string;
  achievement_name: string;
  earned_at: string;
  metadata: Record<string, unknown>;
}

interface ActivityItem {
  id: string;
  activity_type: string;
  title: string;
  description: string | null;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
  user_id: string;
  user_name?: string;
}

interface UpcomingEvent {
  id: string;
  event_type: string;
  title: string;
  event_date: string;
  family_tree_member_id: string | null;
  member_name?: string;
}

interface TodayPrompt {
  category: string;
  categoryName: string;
  icon: string;
  prompt: string;
}

interface UseDashboardResult {
  // User info
  userName: string;
  greeting: string;

  // Progress (from useProgress hook)
  totalStories: number;
  totalPrompts: number;
  overallPercentage: number;
  categoryProgress: ReturnType<typeof useProgress>['categories'];

  // Streaks (from useStreaks hook)
  dailyStreak: number;
  longestStreak: number;
  isActiveToday: boolean;

  // Achievements
  achievements: Achievement[];
  recentAchievement: Achievement | null;

  // Activity feed
  activityFeed: ActivityItem[];
  familyActivityFeed: ActivityItem[];

  // Upcoming events
  upcomingEvents: UpcomingEvent[];

  // Today's prompt
  todayPrompt: TodayPrompt | null;

  // Loading states
  loading: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFirstName(fullName: string | null): string {
  if (!fullName) return 'there';
  return fullName.split(' ')[0];
}

// Sample prompts for each category
const CATEGORY_PROMPTS: Record<string, string[]> = {
  'early-life': [
    "What's your earliest childhood memory?",
    "Describe your childhood home.",
    "Who was your best friend growing up?",
  ],
  'school': [
    "What subject did you love most in school?",
    "Tell about a teacher who influenced you.",
    "Describe your most memorable school day.",
  ],
  'career': [
    "What was your first job?",
    "Describe a career milestone you're proud of.",
    "What career advice would you give your younger self?",
  ],
  'love': [
    "How did you meet your partner?",
    "Describe a meaningful family tradition.",
    "What does love mean to you?",
  ],
  'parenting': [
    "What surprised you most about becoming a parent?",
    "Describe a proud parenting moment.",
    "What values do you hope to pass on?",
  ],
  'adventures': [
    "What's the most adventurous thing you've done?",
    "Describe a trip that changed your perspective.",
    "Where would you love to travel next?",
  ],
  'traditions': [
    "What holiday tradition is most special to you?",
    "Describe a family recipe passed down generations.",
    "What tradition would you like to start?",
  ],
  'values': [
    "What belief guides your daily life?",
    "Who taught you your most important life lesson?",
    "What principle would you never compromise?",
  ],
  'health': [
    "What healthy habit has served you well?",
    "Describe a challenge you overcame.",
    "What does wellness mean to you?",
  ],
  'legacy': [
    "How would you like to be remembered?",
    "What life wisdom would you share with future generations?",
    "What impact do you hope to leave?",
  ],
};

function getTodayPrompt(categoryProgress: ReturnType<typeof useProgress>['categories']): TodayPrompt | null {
  // Find the category with lowest progress
  const sortedCategories = [...categoryProgress].sort(
    (a, b) => (a.stories_count / a.total_prompts) - (b.stories_count / b.total_prompts)
  );

  const targetCategory = sortedCategories[0];
  if (!targetCategory) return null;

  const categoryInfo = CATEGORIES.find(c => c.id === targetCategory.category);
  if (!categoryInfo) return null;

  const prompts = CATEGORY_PROMPTS[targetCategory.category] || [];
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const promptIndex = dayOfYear % prompts.length;

  return {
    category: targetCategory.category,
    categoryName: categoryInfo.name,
    icon: categoryInfo.icon,
    prompt: prompts[promptIndex] || "What's on your mind today?",
  };
}

export function useDashboard(): UseDashboardResult {
  const { user } = useAuth();
  const progress = useProgress();
  const streaks = useStreaks();

  const [userName, setUserName] = useState<string>('there');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [familyActivityFeed, setFamilyActivityFeed] = useState<ActivityItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch user name
      const { data: userData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (userData?.full_name) {
        setUserName(getFirstName(userData.full_name));
      }

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      setAchievements(achievementsData || []);

      // Fetch user's activity
      const { data: activityData } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setActivityFeed(activityData || []);

      // Fetch family activity (from user's families)
      const { data: memberships } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id);

      if (memberships && memberships.length > 0) {
        const familyIds = memberships.map(m => m.family_id);
        const { data: familyActivity } = await supabase
          .from('activity_feed')
          .select('*')
          .in('family_id', familyIds)
          .neq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        setFamilyActivityFeed(familyActivity || []);
      }

      // Fetch upcoming events (next 30 days)
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const { data: eventsData } = await supabase
        .from('life_events')
        .select('*')
        .or(`user_id.eq.${user.id},family_id.in.(${(memberships || []).map(m => m.family_id).join(',')})`)
        .gte('event_date', today)
        .lte('event_date', thirtyDaysFromNow)
        .order('event_date', { ascending: true })
        .limit(5);

      setUpcomingEvents(eventsData || []);

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refresh = async () => {
    await Promise.all([
      fetchDashboardData(),
      progress.refresh(),
      streaks.refresh(),
    ]);
  };

  const recentAchievement = achievements.length > 0 ? achievements[0] : null;
  const todayPrompt = getTodayPrompt(progress.categories);

  return {
    userName,
    greeting: getGreeting(),
    totalStories: progress.totalStories,
    totalPrompts: progress.totalPrompts,
    overallPercentage: progress.overallPercentage,
    categoryProgress: progress.categories,
    dailyStreak: streaks.dailyStreak,
    longestStreak: streaks.longestStreak,
    isActiveToday: streaks.isActiveToday,
    achievements,
    recentAchievement,
    activityFeed,
    familyActivityFeed,
    upcomingEvents,
    todayPrompt,
    loading: loading || progress.loading || streaks.loading,
    error: error || progress.error || streaks.error,
    refresh,
  };
}

export default useDashboard;
