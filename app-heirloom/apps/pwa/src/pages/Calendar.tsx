import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Grid,
  Mic,
  Video,
  FileText,
  Image as ImageIcon,
  Plus,
} from 'lucide-react';
import { useCalendar } from '../hooks/useCalendar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { BottomSheet } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';

type ViewMode = 'calendar' | 'list';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Calendar() {
  const navigate = useNavigate();
  const calendar = useCalendar();
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [showDayDetail, setShowDayDetail] = useState(false);

  const handleDayClick = (date: Date) => {
    calendar.selectDate(date);
    setShowDayDetail(true);
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'photo': return <ImageIcon className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      default: return <Mic className="w-4 h-4" />;
    }
  };

  const getEventEmoji = (eventType: string) => {
    switch (eventType) {
      case 'birthday': return '🎂';
      case 'anniversary': return '💍';
      case 'holiday': return '🎄';
      case 'memorial': return '🕯️';
      default: return '📅';
    }
  };

  if (calendar.loading) {
    return (
      <div className="min-h-screen pb-24">
        <header className="bg-white border-b border-heritage-green/10 px-5 py-4 safe-top">
          <div className="flex items-center justify-between">
            <Skeleton width={150} height={28} />
            <div className="flex gap-2">
              <Skeleton variant="rounded" width={40} height={36} />
              <Skeleton variant="rounded" width={40} height={36} />
            </div>
          </div>
        </header>
        <div className="px-5 py-6">
          <Skeleton variant="rounded" height={300} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-ivory-linen/30">
      {/* Header */}
      <header className="bg-white border-b border-heritage-green/10 px-5 py-4 safe-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={calendar.goToPrevMonth}
              className="p-2 hover:bg-charcoal-ink/5 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-charcoal-ink" />
            </button>
            <h1 className="heading-3 text-charcoal-ink min-w-[140px] text-center">
              {MONTHS[calendar.currentMonth.getMonth()]} {calendar.currentMonth.getFullYear()}
            </h1>
            <button
              onClick={calendar.goToNextMonth}
              className="p-2 hover:bg-charcoal-ink/5 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-charcoal-ink" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => calendar.goToToday()}
              className="body-sm text-heritage-green font-medium px-3 py-1.5 rounded-lg hover:bg-heritage-green/5 transition-colors"
            >
              Today
            </button>
            <div className="flex bg-charcoal-ink/5 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'calendar' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Grid className="w-4 h-4 text-charcoal-ink" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <List className="w-4 h-4 text-charcoal-ink" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-5 py-6">
        {viewMode === 'calendar' ? (
          <Card variant="elevated" padding="sm" className="animate-fade-in">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center caption text-charcoal-ink/50 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendar.calendarDays.map((day, index) => {
                const hasStories = day.stories.length > 0;
                const hasEvents = day.events.length > 0;

                return (
                  <button
                    key={index}
                    onClick={() => handleDayClick(day.date)}
                    className={`
                      relative aspect-square rounded-lg p-1 transition-colors
                      ${day.isCurrentMonth ? '' : 'opacity-40'}
                      ${day.isToday ? 'bg-heritage-green text-white' : 'hover:bg-charcoal-ink/5'}
                      ${calendar.selectedDate && day.date.toDateString() === calendar.selectedDate.toDateString() && !day.isToday
                        ? 'ring-2 ring-heritage-green'
                        : ''
                      }
                    `}
                  >
                    <span className={`body-sm ${day.isToday ? 'font-semibold' : ''}`}>
                      {day.date.getDate()}
                    </span>

                    {/* Indicators */}
                    {(hasStories || hasEvents) && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {hasStories && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              day.isToday ? 'bg-white' : 'bg-heritage-green'
                            }`}
                          />
                        )}
                        {hasEvents && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              day.isToday ? 'bg-heirloom-gold' : 'bg-heirloom-gold'
                            }`}
                          />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-charcoal-ink/10">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-heritage-green" />
                <span className="caption text-charcoal-ink/50">Stories</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-heirloom-gold" />
                <span className="caption text-charcoal-ink/50">Events</span>
              </div>
            </div>
          </Card>
        ) : (
          /* List View */
          <div className="space-y-4 animate-fade-in">
            {calendar.calendarDays
              .filter(day => day.isCurrentMonth && (day.stories.length > 0 || day.events.length > 0))
              .map((day, index) => (
                <div key={index}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`body-sm font-medium ${day.isToday ? 'text-heritage-green' : 'text-charcoal-ink/60'}`}>
                      {day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    {day.isToday && (
                      <Badge variant="gold" size="sm">Today</Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    {day.events.map((event) => (
                      <Card key={event.id} variant="default" padding="sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-heirloom-gold/10 flex items-center justify-center">
                            <span className="text-lg">{getEventEmoji(event.event_type)}</span>
                          </div>
                          <div className="flex-1">
                            <p className="body-md font-medium text-charcoal-ink">{event.title}</p>
                            <p className="caption text-charcoal-ink/50">{event.event_type}</p>
                          </div>
                        </div>
                      </Card>
                    ))}

                    {day.stories.map((story) => (
                      <Card
                        key={story.id}
                        variant="interactive"
                        padding="sm"
                        onClick={() => navigate(`/story/${story.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-heritage-green/10 flex items-center justify-center">
                            {getMediaIcon(story.media_type)}
                          </div>
                          <div className="flex-1">
                            <p className="body-md font-medium text-charcoal-ink">{story.title || 'Untitled'}</p>
                            <p className="caption text-charcoal-ink/50">{story.category}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}

            {calendar.calendarDays.filter(d => d.isCurrentMonth && (d.stories.length > 0 || d.events.length > 0)).length === 0 && (
              <EmptyState
                icon={<CalendarIcon className="w-8 h-8 text-heritage-green" />}
                title="No stories this month"
                description="Record a story to see it appear on your calendar"
                action={{ label: 'Record Story', onClick: () => navigate('/record') }}
              />
            )}
          </div>
        )}
      </div>

      {/* Day Detail Bottom Sheet */}
      <BottomSheet
        isOpen={showDayDetail}
        onClose={() => setShowDayDetail(false)}
        title={calendar.selectedDate?.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
      >
        <div className="space-y-4">
          {/* Events */}
          {calendar.selectedDayEvents.length > 0 && (
            <div>
              <h4 className="label-uppercase mb-2">Events</h4>
              <div className="space-y-2">
                {calendar.selectedDayEvents.map((event) => (
                  <Card key={event.id} variant="default" padding="sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-heirloom-gold/10 flex items-center justify-center">
                        <span className="text-lg">{getEventEmoji(event.event_type)}</span>
                      </div>
                      <div>
                        <p className="body-md font-medium text-charcoal-ink">{event.title}</p>
                        {event.description && (
                          <p className="caption text-charcoal-ink/50">{event.description}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Stories */}
          {calendar.selectedDayStories.length > 0 && (
            <div>
              <h4 className="label-uppercase mb-2">Stories Recorded</h4>
              <div className="space-y-2">
                {calendar.selectedDayStories.map((story) => (
                  <Card
                    key={story.id}
                    variant="interactive"
                    padding="sm"
                    onClick={() => {
                      setShowDayDetail(false);
                      navigate(`/story/${story.id}`);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-heritage-green/10 flex items-center justify-center text-heritage-green">
                        {getMediaIcon(story.media_type)}
                      </div>
                      <div className="flex-1">
                        <p className="body-md font-medium text-charcoal-ink">{story.title || 'Untitled'}</p>
                        <p className="caption text-charcoal-ink/50">{story.category}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-charcoal-ink/30" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {calendar.selectedDayStories.length === 0 && calendar.selectedDayEvents.length === 0 && (
            <EmptyState
              icon={<CalendarIcon className="w-8 h-8 text-heritage-green" />}
              title="Nothing recorded"
              description="No stories or events on this day"
              action={{
                label: 'Record a Story',
                onClick: () => {
                  setShowDayDetail(false);
                  navigate('/record');
                },
              }}
            />
          )}

          {/* Record Button */}
          <Button
            variant="primary"
            fullWidth
            icon={<Plus className="w-5 h-5" />}
            onClick={() => {
              setShowDayDetail(false);
              navigate('/record');
            }}
          >
            Record New Story
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
