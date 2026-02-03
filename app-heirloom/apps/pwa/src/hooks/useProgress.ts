import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface CategoryProgress {
  category: string;
  stories_count: number;
  total_prompts: number;
}

interface UseProgressResult {
  categories: CategoryProgress[];
  totalStories: number;
  totalPrompts: number;
  overallPercentage: number;
  getCategoryProgress: (category: string) => CategoryProgress | undefined;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Category definitions with icons
export const CATEGORIES = [
  { id: 'early-life', name: 'Early Life', icon: '👶', color: 'bg-pink-500' },
  { id: 'school', name: 'School Years', icon: '🎓', color: 'bg-blue-500' },
  { id: 'career', name: 'Career', icon: '💼', color: 'bg-indigo-500' },
  { id: 'love', name: 'Love & Family', icon: '❤️', color: 'bg-red-500' },
  { id: 'parenting', name: 'Parenting', icon: '👨‍👩‍👧', color: 'bg-orange-500' },
  { id: 'adventures', name: 'Adventures', icon: '🌍', color: 'bg-teal-500' },
  { id: 'traditions', name: 'Traditions', icon: '🎄', color: 'bg-green-600' },
  { id: 'values', name: 'Values & Beliefs', icon: '💡', color: 'bg-yellow-500' },
  { id: 'health', name: 'Health', icon: '🏃', color: 'bg-lime-500' },
  { id: 'legacy', name: 'Legacy', icon: '⭐', color: 'bg-amber-500' },
] as const;

const PROMPTS_PER_CATEGORY = 10;

export function useProgress(): UseProgressResult {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch user's category progress
      const { data, error: fetchError } = await supabase
        .from('user_category_progress')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      // Merge with all categories (some might not have entries yet)
      const progressMap = new Map(
        (data || []).map(p => [p.category, p])
      );

      const allCategories: CategoryProgress[] = CATEGORIES.map(cat => {
        const existing = progressMap.get(cat.id);
        return {
          category: cat.id,
          stories_count: existing?.stories_count || 0,
          total_prompts: existing?.total_prompts || PROMPTS_PER_CATEGORY,
        };
      });

      setCategories(allCategories);
      setError(null);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [user]);

  const totalStories = categories.reduce((sum, c) => sum + c.stories_count, 0);
  const totalPrompts = categories.reduce((sum, c) => sum + c.total_prompts, 0);
  const overallPercentage = totalPrompts > 0 ? (totalStories / totalPrompts) * 100 : 0;

  const getCategoryProgress = (category: string) =>
    categories.find(c => c.category === category);

  return {
    categories,
    totalStories,
    totalPrompts,
    overallPercentage,
    getCategoryProgress,
    loading,
    error,
    refresh: fetchProgress,
  };
}

export function getCategoryInfo(categoryId: string) {
  return CATEGORIES.find(c => c.id === categoryId);
}

export function getWeakCategories(categories: CategoryProgress[], threshold = 0.3) {
  return categories.filter(c => {
    const percentage = c.total_prompts > 0 ? c.stories_count / c.total_prompts : 0;
    return percentage < threshold;
  });
}

export default useProgress;
