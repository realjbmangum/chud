import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface Streak {
  id: string;
  streak_type: 'daily' | 'weekly';
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

interface UseStreaksResult {
  dailyStreak: number;
  weeklyStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  isActiveToday: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useStreaks(): UseStreaksResult {
  const { user } = useAuth();
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreaks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;
      setStreaks(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching streaks:', err);
      setError('Failed to load streaks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreaks();
  }, [user]);

  const dailyStreak = streaks.find(s => s.streak_type === 'daily')?.current_streak || 0;
  const weeklyStreak = streaks.find(s => s.streak_type === 'weekly')?.current_streak || 0;
  const longestStreak = Math.max(
    ...streaks.map(s => s.longest_streak),
    0
  );

  const lastActivityStr = streaks.find(s => s.streak_type === 'daily')?.last_activity_date;
  const lastActivityDate = lastActivityStr ? new Date(lastActivityStr) : null;

  const today = new Date().toISOString().split('T')[0];
  const isActiveToday = lastActivityStr === today;

  return {
    dailyStreak,
    weeklyStreak,
    longestStreak,
    lastActivityDate,
    isActiveToday,
    loading,
    error,
    refresh: fetchStreaks,
  };
}

export function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start your streak today!";
  if (streak === 1) return "Great start! Keep going!";
  if (streak < 7) return `${streak} days strong!`;
  if (streak < 30) return `${streak} day streak! Amazing!`;
  if (streak < 100) return `${streak} days! You're on fire!`;
  return `${streak} days! Legendary!`;
}

export function getStreakEmoji(streak: number): string {
  if (streak === 0) return '💤';
  if (streak < 3) return '🔥';
  if (streak < 7) return '🔥';
  if (streak < 14) return '⚡';
  if (streak < 30) return '🌟';
  if (streak < 100) return '💫';
  return '👑';
}

export default useStreaks;
