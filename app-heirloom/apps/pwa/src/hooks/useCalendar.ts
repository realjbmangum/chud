import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface Story {
  id: string;
  title: string;
  category: string;
  media_type: 'audio' | 'video' | 'text' | 'photo';
  created_at: string;
  thumbnail_url?: string;
}

interface LifeEvent {
  id: string;
  event_type: 'birthday' | 'anniversary' | 'holiday' | 'memorial' | 'custom';
  title: string;
  description: string | null;
  event_date: string;
  recurring: boolean;
  recurrence_type: 'yearly' | 'monthly' | null;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  stories: Story[];
  events: LifeEvent[];
}

interface UseCalendarResult {
  currentDate: Date;
  currentMonth: Date;
  calendarDays: CalendarDay[];
  selectedDate: Date | null;
  selectedDayStories: Story[];
  selectedDayEvents: LifeEvent[];
  storiesByMonth: Map<string, Story[]>;
  eventsByMonth: Map<string, LifeEvent[]>;
  loading: boolean;
  error: string | null;
  goToNextMonth: () => void;
  goToPrevMonth: () => void;
  goToToday: () => void;
  selectDate: (date: Date) => void;
  refresh: () => Promise<void>;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function useCalendar(): UseCalendarResult {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get date range for current month view (include prev/next month padding)
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      // Add padding for calendar grid
      const viewStart = new Date(monthStart);
      viewStart.setDate(viewStart.getDate() - viewStart.getDay());

      const viewEnd = new Date(monthEnd);
      viewEnd.setDate(viewEnd.getDate() + (6 - viewEnd.getDay()));

      const startStr = formatDateKey(viewStart);
      const endStr = formatDateKey(viewEnd);

      // Fetch user's vault
      const { data: vaultData } = await supabase
        .from('vaults')
        .select('id')
        .eq('owner_user_id', user.id)
        .eq('type', 'personal')
        .single();

      if (vaultData) {
        // Fetch stories in date range
        const { data: storiesData, error: storiesError } = await supabase
          .from('stories')
          .select('id, title, category, media_type, created_at, thumbnail_url')
          .eq('vault_id', vaultData.id)
          .gte('created_at', startStr)
          .lte('created_at', endStr + 'T23:59:59')
          .order('created_at', { ascending: false });

        if (storiesError) throw storiesError;
        setStories(storiesData || []);
      }

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('life_events')
        .select('*')
        .or(`user_id.eq.${user.id}`)
        .gte('event_date', startStr)
        .lte('event_date', endStr)
        .order('event_date', { ascending: true });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);

      setError(null);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
      setError('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [user, currentMonth]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Build calendar grid
  const buildCalendarDays = (): CalendarDay[] => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    // Start from Sunday before month start
    const calendarStart = new Date(monthStart);
    calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay());

    // End on Saturday after month end
    const calendarEnd = new Date(monthEnd);
    calendarEnd.setDate(calendarEnd.getDate() + (6 - calendarEnd.getDay()));

    const days: CalendarDay[] = [];
    const today = new Date();
    const current = new Date(calendarStart);

    // Create map for quick lookup
    const storiesByDate = new Map<string, Story[]>();
    stories.forEach(story => {
      const dateKey = story.created_at.split('T')[0];
      if (!storiesByDate.has(dateKey)) {
        storiesByDate.set(dateKey, []);
      }
      storiesByDate.get(dateKey)!.push(story);
    });

    const eventsByDate = new Map<string, LifeEvent[]>();
    events.forEach(event => {
      const dateKey = event.event_date;
      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, []);
      }
      eventsByDate.get(dateKey)!.push(event);
    });

    while (current <= calendarEnd) {
      const dateKey = formatDateKey(current);
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === currentMonth.getMonth(),
        isToday: isSameDay(current, today),
        stories: storiesByDate.get(dateKey) || [],
        events: eventsByDate.get(dateKey) || [],
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const calendarDays = buildCalendarDays();

  // Get data for selected date
  const selectedDay = selectedDate
    ? calendarDays.find(d => isSameDay(d.date, selectedDate))
    : null;

  // Build month-based maps
  const storiesByMonth = new Map<string, Story[]>();
  const eventsByMonth = new Map<string, LifeEvent[]>();

  stories.forEach(story => {
    const monthKey = story.created_at.substring(0, 7); // YYYY-MM
    if (!storiesByMonth.has(monthKey)) {
      storiesByMonth.set(monthKey, []);
    }
    storiesByMonth.get(monthKey)!.push(story);
  });

  events.forEach(event => {
    const monthKey = event.event_date.substring(0, 7);
    if (!eventsByMonth.has(monthKey)) {
      eventsByMonth.set(monthKey, []);
    }
    eventsByMonth.get(monthKey)!.push(event);
  });

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
  };

  return {
    currentDate: new Date(),
    currentMonth,
    calendarDays,
    selectedDate,
    selectedDayStories: selectedDay?.stories || [],
    selectedDayEvents: selectedDay?.events || [],
    storiesByMonth,
    eventsByMonth,
    loading,
    error,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    selectDate,
    refresh: fetchCalendarData,
  };
}

export default useCalendar;
