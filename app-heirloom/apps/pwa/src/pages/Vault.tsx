import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Play, Folder, ChevronLeft, Video, FileText, Image, Grid, List, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface Story {
  id: string;
  title: string;
  media_type: string;
  media_url: string;
  duration_seconds: number;
  category: string;
  created_at: string;
  is_shared_to_family: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'early_life', label: 'Early Life' },
  { id: 'school_years', label: 'School' },
  { id: 'young_adulthood', label: 'Young Adult' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'career', label: 'Career' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'personal_growth', label: 'Growth' },
  { id: 'legacy', label: 'Legacy' },
  { id: 'gratitude', label: 'Gratitude' },
  { id: 'final_thoughts', label: 'Final Words' },
];

export default function Vault() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { user } = useAuth();

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-6 h-6" />;
      case 'photo': return <Image className="w-6 h-6" />;
      case 'text': return <FileText className="w-6 h-6" />;
      default: return <Mic className="w-6 h-6" />;
    }
  };

  const getMediaBgColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-purple-100';
      case 'photo': return 'bg-blue-100';
      case 'text': return 'bg-amber-100';
      default: return 'bg-heritage-green/10';
    }
  };

  const getMediaIconColor = (type: string) => {
    switch (type) {
      case 'video': return 'text-purple-600';
      case 'photo': return 'text-blue-600';
      case 'text': return 'text-amber-600';
      default: return 'text-heritage-green';
    }
  };

  useEffect(() => {
    loadStories();
  }, [user]);

  const loadStories = async () => {
    if (!user) return;

    setLoading(true);

    const { data: vault } = await supabase
      .from('vaults')
      .select('id')
      .eq('owner_user_id', user.id)
      .eq('type', 'personal')
      .single();

    if (vault) {
      const { data } = await supabase
        .from('stories')
        .select('*')
        .eq('vault_id', vault.id)
        .order('created_at', { ascending: false });

      if (data) {
        setStories(data);
      }
    }

    setLoading(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryLabel = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      early_life: 'bg-blue-100 text-blue-700',
      school_years: 'bg-cyan-100 text-cyan-700',
      young_adulthood: 'bg-indigo-100 text-indigo-700',
      relationships: 'bg-pink-100 text-pink-700',
      career: 'bg-green-100 text-green-700',
      challenges: 'bg-orange-100 text-orange-700',
      personal_growth: 'bg-purple-100 text-purple-700',
      legacy: 'bg-heritage-green/10 text-heritage-green',
      gratitude: 'bg-amber-100 text-amber-700',
      final_thoughts: 'bg-rose-100 text-rose-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const filteredStories = filter === 'all'
    ? stories
    : stories.filter((s) => s.category === filter);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-white border-b border-heritage-green/10 px-5 py-4 safe-top">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-1">
            <ChevronLeft className="w-6 h-6 text-charcoal-ink" />
          </Link>
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-heritage-green" />
            <h1 className="font-semibold text-lg">My Vault</h1>
          </div>
        </div>
      </header>

      {/* Filter & View Toggle */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-charcoal-ink/60">
            {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
          </span>
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-heritage-green/10 text-heritage-green' : 'text-charcoal-ink/40'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-heritage-green/10 text-heritage-green' : 'text-charcoal-ink/40'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto no-scrollbar -mx-5 px-5">
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filter === cat.id
                    ? 'bg-heritage-green text-white'
                    : 'bg-white text-charcoal-ink/60 border border-charcoal-ink/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stories */}
      <div className="px-5">
        {loading ? (
          <div className="text-center py-12 text-charcoal-ink/60">
            Loading your stories...
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-heritage-green/20 mx-auto mb-4" />
            <p className="text-charcoal-ink/60">
              {filter === 'all' ? 'No stories yet' : `No ${filter} stories`}
            </p>
            <Link to="/record" className="btn-primary inline-block mt-4">
              Record Your First Story
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-2 gap-3">
            {filteredStories.map((story) => (
              <Link
                key={story.id}
                to={`/story/${story.id}`}
                className="card story-card p-3"
              >
                <div className={`w-full aspect-square rounded-xl mb-3 flex items-center justify-center ${getMediaBgColor(story.media_type)}`}>
                  {story.media_type === 'photo' && story.media_url ? (
                    <img
                      src={story.media_url}
                      alt={story.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className={getMediaIconColor(story.media_type)}>
                      {getMediaIcon(story.media_type)}
                    </div>
                  )}
                </div>
                <p className="font-medium text-sm text-charcoal-ink truncate">
                  {story.title || 'Untitled'}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(story.category)}`}>
                    {getCategoryLabel(story.category)}
                  </span>
                  {story.is_shared_to_family && (
                    <Share2 className="w-3 h-3 text-heritage-green ml-auto" />
                  )}
                </div>
                <p className="text-xs text-charcoal-ink/40 mt-1">
                  {formatDate(story.created_at)}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="grid grid-cols-1 gap-3">
            {filteredStories.map((story) => (
              <Link
                key={story.id}
                to={`/story/${story.id}`}
                className="card story-card flex items-center gap-4"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${getMediaBgColor(story.media_type)}`}>
                  {story.media_type === 'photo' && story.media_url ? (
                    <img
                      src={story.media_url}
                      alt={story.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className={getMediaIconColor(story.media_type)}>
                      {getMediaIcon(story.media_type)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal-ink truncate">
                    {story.title || 'Untitled'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(story.category)}`}>
                      {getCategoryLabel(story.category)}
                    </span>
                    {story.duration_seconds > 0 && (
                      <span className="text-xs text-charcoal-ink/40">
                        {formatDuration(story.duration_seconds)}
                      </span>
                    )}
                    {story.is_shared_to_family && (
                      <Share2 className="w-3 h-3 text-heritage-green" />
                    )}
                  </div>
                  <p className="text-xs text-charcoal-ink/40 mt-1">
                    {formatDate(story.created_at)}
                  </p>
                </div>
                <Play className="w-5 h-5 text-heritage-green flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
