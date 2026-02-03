import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mic,
  Video,
  FileText,
  Image as ImageIcon,
  ChevronRight,
  RefreshCw,
  Flame,
  Trophy,
  Calendar as CalendarIcon,
  Users,
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { getCategoryInfo } from '../hooks/useProgress';
import { getStreakEmoji } from '../hooks/useStreaks';
import { Avatar } from '../components/ui/Avatar';
import { Card } from '../components/ui/Card';
import { ProgressRing, ProgressBar } from '../components/ui/Progress';
import { Badge } from '../components/ui/Badge';
import { SkeletonDashboard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

type ActivityTab = 'my' | 'family';

export default function Dashboard() {
  const navigate = useNavigate();
  const dashboard = useDashboard();
  const [activityTab, setActivityTab] = useState<ActivityTab>('my');

  if (dashboard.loading) {
    return (
      <div className="min-h-screen pb-24">
        <header className="bg-white border-b border-heritage-green/10 px-5 py-4 safe-top">
          <div className="h-8" />
        </header>
        <div className="px-5 py-6">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  const activityItems = activityTab === 'my' ? dashboard.activityFeed : dashboard.familyActivityFeed;

  return (
    <div className="min-h-screen pb-24 bg-ivory-linen/30">
      {/* Header */}
      <header className="bg-white border-b border-heritage-green/10 px-5 py-4 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <p className="body-sm text-charcoal-ink/60">{dashboard.greeting}</p>
            <h1 className="heading-2 text-heritage-green">{dashboard.userName}</h1>
          </div>
          <Link to="/profile">
            <Avatar name={dashboard.userName} size="lg" ring="green" />
          </Link>
        </div>
      </header>

      <div className="px-5 py-6 space-y-6">
        {/* Progress Overview Card */}
        <Card variant="elevated" className="animate-fade-in">
          <div className="flex items-center gap-5">
            <div className="relative">
              <ProgressRing
                value={dashboard.overallPercentage}
                size={88}
                strokeWidth={7}
                color="green"
                showValue={true}
              />
            </div>
            <div className="flex-1">
              <h3 className="heading-4 text-charcoal-ink mb-1">Your Legacy Journey</h3>
              <p className="body-sm text-charcoal-ink/60">
                {dashboard.totalStories} of {dashboard.totalPrompts} stories recorded
              </p>
              <Link
                to="/vault"
                className="inline-flex items-center gap-1 body-sm text-heritage-green font-medium mt-2"
              >
                View Vault
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
          {/* Streak */}
          <Card variant="interactive" className="text-center">
            <div className="text-2xl mb-1">
              {dashboard.dailyStreak > 0 ? getStreakEmoji(dashboard.dailyStreak) : '💤'}
            </div>
            <p className="heading-4 text-charcoal-ink">{dashboard.dailyStreak}</p>
            <p className="caption text-charcoal-ink/50">Day Streak</p>
          </Card>

          {/* Weekly Goal */}
          <Card variant="interactive" className="text-center">
            <div className="text-2xl mb-1">🎯</div>
            <p className="heading-4 text-charcoal-ink">
              {Math.min(dashboard.dailyStreak % 7, 7)}/7
            </p>
            <p className="caption text-charcoal-ink/50">This Week</p>
          </Card>

          {/* Achievement */}
          <Card variant="interactive" className="text-center">
            <div className="text-2xl mb-1">
              {dashboard.recentAchievement ? '🏆' : '⭐'}
            </div>
            <p className="heading-4 text-charcoal-ink">
              {dashboard.achievements.length}
            </p>
            <p className="caption text-charcoal-ink/50">Badges</p>
          </Card>
        </div>

        {/* Today's Prompt */}
        {dashboard.todayPrompt && (
          <Card variant="floating" className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-3">
              <Badge variant="gold" icon={<span>{dashboard.todayPrompt.icon}</span>}>
                {dashboard.todayPrompt.categoryName}
              </Badge>
              <button
                onClick={() => dashboard.refresh()}
                className="p-2 rounded-full hover:bg-heritage-green/5 transition-colors"
                aria-label="Shuffle prompt"
              >
                <RefreshCw className="w-4 h-4 text-heritage-green" />
              </button>
            </div>

            <p className="heading-3 text-charcoal-ink mb-5 leading-relaxed">
              {dashboard.todayPrompt.prompt}
            </p>

            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => navigate('/record', { state: { prompt: dashboard.todayPrompt } })}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-heritage-green/10 hover:bg-heritage-green/20 transition-all active:scale-95"
              >
                <Mic className="w-6 h-6 text-heritage-green" />
                <span className="caption text-heritage-green font-medium">Audio</span>
              </button>
              <button
                onClick={() => navigate('/record/video', { state: { prompt: dashboard.todayPrompt } })}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-heritage-green/10 hover:bg-heritage-green/20 transition-all active:scale-95"
              >
                <Video className="w-6 h-6 text-heritage-green" />
                <span className="caption text-heritage-green font-medium">Video</span>
              </button>
              <button
                onClick={() => navigate('/record/text', { state: { prompt: dashboard.todayPrompt } })}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-heritage-green/10 hover:bg-heritage-green/20 transition-all active:scale-95"
              >
                <FileText className="w-6 h-6 text-heritage-green" />
                <span className="caption text-heritage-green font-medium">Write</span>
              </button>
              <button
                onClick={() => navigate('/record/photo', { state: { prompt: dashboard.todayPrompt } })}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-heritage-green/10 hover:bg-heritage-green/20 transition-all active:scale-95"
              >
                <ImageIcon className="w-6 h-6 text-heritage-green" />
                <span className="caption text-heritage-green font-medium">Photo</span>
              </button>
            </div>
          </Card>
        )}

        {/* Category Progress */}
        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="heading-4 text-charcoal-ink">Categories</h3>
            <Link
              to="/vault"
              className="body-sm text-heritage-green font-medium flex items-center gap-1"
            >
              See all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
            {dashboard.categoryProgress.map((cat) => {
              const info = getCategoryInfo(cat.category);

              return (
                <div
                  key={cat.category}
                  className="flex-shrink-0 w-32"
                >
                  <Card variant="interactive" padding="sm" className="h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{info?.icon}</span>
                      <span className="body-sm font-medium text-charcoal-ink truncate">
                        {info?.name}
                      </span>
                    </div>
                    <ProgressBar
                      value={cat.stories_count}
                      max={cat.total_prompts}
                      size="sm"
                      className="mb-1"
                    />
                    <span className="caption text-charcoal-ink/50">
                      {cat.stories_count}/{cat.total_prompts}
                    </span>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        {dashboard.upcomingEvents.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-heirloom-gold" />
                <h3 className="heading-4 text-charcoal-ink">Upcoming</h3>
              </div>
              <Link
                to="/calendar"
                className="body-sm text-heritage-green font-medium flex items-center gap-1"
              >
                Calendar
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-2">
              {dashboard.upcomingEvents.slice(0, 3).map((event) => (
                <Card key={event.id} variant="default" padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-heirloom-gold/10 flex items-center justify-center">
                      <span className="text-lg">
                        {event.event_type === 'birthday' ? '🎂' :
                         event.event_type === 'anniversary' ? '💍' :
                         event.event_type === 'holiday' ? '🎄' :
                         event.event_type === 'memorial' ? '🕯️' : '📅'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="body-md font-medium text-charcoal-ink truncate">
                        {event.title}
                      </p>
                      <p className="caption text-charcoal-ink/50">
                        {new Date(event.event_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/record', { state: { event } })}
                      className="btn-ghost btn-sm"
                    >
                      Record
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Activity Feed */}
        <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="heading-4 text-charcoal-ink">Activity</h3>
          </div>

          {/* Tab Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActivityTab('my')}
              className={`px-4 py-2 rounded-full body-sm font-medium transition-colors ${
                activityTab === 'my'
                  ? 'bg-heritage-green text-white'
                  : 'bg-charcoal-ink/5 text-charcoal-ink/60 hover:bg-charcoal-ink/10'
              }`}
            >
              My Activity
            </button>
            <button
              onClick={() => setActivityTab('family')}
              className={`px-4 py-2 rounded-full body-sm font-medium transition-colors flex items-center gap-1.5 ${
                activityTab === 'family'
                  ? 'bg-heritage-green text-white'
                  : 'bg-charcoal-ink/5 text-charcoal-ink/60 hover:bg-charcoal-ink/10'
              }`}
            >
              <Users className="w-4 h-4" />
              Family
            </button>
          </div>

          {activityItems.length > 0 ? (
            <div className="space-y-2">
              {activityItems.slice(0, 5).map((activity) => (
                <Card key={activity.id} variant="default" padding="sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-heritage-green/10 flex items-center justify-center flex-shrink-0">
                      {activity.activity_type === 'story_created' ? (
                        <Mic className="w-4 h-4 text-heritage-green" />
                      ) : activity.activity_type === 'streak_achieved' ? (
                        <Flame className="w-4 h-4 text-orange-500" />
                      ) : activity.activity_type === 'achievement_earned' ? (
                        <Trophy className="w-4 h-4 text-heirloom-gold" />
                      ) : (
                        <Users className="w-4 h-4 text-heritage-green" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="body-sm text-charcoal-ink">{activity.title}</p>
                      {activity.description && (
                        <p className="caption text-charcoal-ink/50 truncate">
                          {activity.description}
                        </p>
                      )}
                      <p className="caption text-charcoal-ink/40 mt-1">
                        {new Date(activity.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card variant="default">
              <EmptyState
                icon={activityTab === 'my' ? <Mic className="w-8 h-8 text-heritage-green" /> : <Users className="w-8 h-8 text-heritage-green" />}
                title={activityTab === 'my' ? 'No activity yet' : 'No family activity'}
                description={
                  activityTab === 'my'
                    ? 'Record your first story to see your activity here'
                    : 'Invite family members to see their activity'
                }
                action={
                  activityTab === 'my'
                    ? { label: 'Record Story', onClick: () => navigate('/record') }
                    : { label: 'Invite Family', onClick: () => navigate('/invite') }
                }
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
