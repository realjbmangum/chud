import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Play, ChevronLeft, UserPlus, Mic, Video, FileText, Image, GitBranch } from 'lucide-react';
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
  created_by: string;
  creator_name?: string;
  creator_avatar?: string;
}

interface Family {
  id: string;
  name: string;
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

export default function FamilyVault() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadFamilies();
  }, [user]);

  useEffect(() => {
    if (selectedFamily) {
      loadFamilyStories(selectedFamily);
    }
  }, [selectedFamily]);

  const loadFamilies = async () => {
    if (!user) return;

    setLoading(true);

    // Get user's families
    const { data: memberships } = await supabase
      .from('family_members')
      .select(`
        family:families (
          id,
          name
        )
      `)
      .eq('user_id', user.id);

    if (memberships && memberships.length > 0) {
      const familyList: Family[] = memberships
        .filter(m => m.family)
        .map(m => ({
          id: (m.family as any).id,
          name: (m.family as any).name,
        }));
      setFamilies(familyList);
      if (familyList.length > 0) {
        setSelectedFamily(familyList[0].id);
      }
    }

    setLoading(false);
  };

  const loadFamilyStories = async (familyId: string) => {
    setLoading(true);

    // Get family vault
    const { data: vault } = await supabase
      .from('vaults')
      .select('id')
      .eq('owner_family_id', familyId)
      .eq('type', 'family')
      .single();

    if (vault) {
      // Get stories shared to family vault
      const { data: storiesData } = await supabase
        .from('stories')
        .select('*')
        .eq('vault_id', vault.id)
        .order('created_at', { ascending: false });

      if (storiesData) {
        // Get creator info for each story
        const storiesWithCreators = await Promise.all(
          storiesData.map(async (story) => {
            const { data: creator } = await supabase
              .from('users')
              .select('full_name, avatar_url')
              .eq('id', story.created_by)
              .single();

            return {
              ...story,
              creator_name: creator?.full_name || 'Unknown',
              creator_avatar: creator?.avatar_url,
            };
          })
        );
        setStories(storiesWithCreators);
      }
    } else {
      // Also get stories from personal vaults that are shared to family
      const { data: sharedStories } = await supabase
        .from('stories')
        .select('*')
        .eq('is_shared_to_family', true);

      if (sharedStories) {
        // Filter to only stories from family members
        const { data: members } = await supabase
          .from('family_members')
          .select('user_id')
          .eq('family_id', familyId);

        const memberIds = members?.map(m => m.user_id) || [];
        const familyStories = sharedStories.filter(s => memberIds.includes(s.created_by));

        // Get creator info
        const storiesWithCreators = await Promise.all(
          familyStories.map(async (story) => {
            const { data: creator } = await supabase
              .from('users')
              .select('full_name, avatar_url')
              .eq('id', story.created_by)
              .single();

            return {
              ...story,
              creator_name: creator?.full_name || 'Unknown',
              creator_avatar: creator?.avatar_url,
            };
          })
        );
        setStories(storiesWithCreators);
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

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'photo': return <Image className="w-5 h-5" />;
      case 'text': return <FileText className="w-5 h-5" />;
      default: return <Mic className="w-5 h-5" />;
    }
  };

  const filteredStories = filter === 'all'
    ? stories
    : stories.filter((s) => s.category === filter);

  // No families state
  if (!loading && families.length === 0) {
    return (
      <div className="min-h-screen pb-24">
        <header className="bg-white border-b border-heritage-green/10 px-5 py-4 safe-top">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1">
              <ChevronLeft className="w-6 h-6 text-charcoal-ink" />
            </button>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-heritage-green" />
              <h1 className="font-semibold text-lg">Family Vault</h1>
            </div>
          </div>
        </header>

        <div className="px-5 py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-heritage-green/10 flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-heritage-green/40" />
          </div>
          <h2 className="text-xl font-serif text-heritage-green mb-2">
            No Family Connected
          </h2>
          <p className="text-charcoal-ink/60 mb-8">
            Create a family or join one to share stories with your loved ones.
          </p>
          <button
            onClick={() => navigate('/family/invite')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Create or Join Family
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-white border-b border-heritage-green/10 px-5 py-4 safe-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1">
              <ChevronLeft className="w-6 h-6 text-charcoal-ink" />
            </button>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-heritage-green" />
              <h1 className="font-semibold text-lg">Family Vault</h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/family/tree')}
              className="p-2 text-heritage-green hover:bg-heritage-green/5 rounded-lg transition-colors"
              title="Family Tree"
            >
              <GitBranch className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/family/invite')}
              className="p-2 text-heritage-green hover:bg-heritage-green/5 rounded-lg transition-colors"
              title="Invite Family"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Family Selector */}
      {families.length > 1 && (
        <div className="px-5 py-3 border-b border-heritage-green/10">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {families.map((family) => (
              <button
                key={family.id}
                onClick={() => setSelectedFamily(family.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedFamily === family.id
                    ? 'bg-heritage-green text-white'
                    : 'bg-white text-charcoal-ink/60 border border-charcoal-ink/10'
                }`}
              >
                {family.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="px-5 py-4 overflow-x-auto no-scrollbar">
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

      {/* Stories */}
      <div className="px-5">
        {loading ? (
          <div className="text-center py-12 text-charcoal-ink/60">
            Loading family stories...
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-heritage-green/20 mx-auto mb-4" />
            <p className="text-charcoal-ink/60">
              {filter === 'all' ? 'No family stories yet' : `No ${filter} stories`}
            </p>
            <p className="text-sm text-charcoal-ink/40 mt-2">
              Share a story from your vault or ask family members to share theirs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredStories.map((story) => (
              <Link
                key={story.id}
                to={`/story/${story.id}`}
                className="card"
              >
                <div className="flex items-start gap-3 mb-3">
                  {/* Creator Avatar */}
                  <div className="w-10 h-10 rounded-full bg-heritage-green/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {story.creator_avatar ? (
                      <img
                        src={story.creator_avatar}
                        alt={story.creator_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-heritage-green font-medium">
                        {story.creator_name?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal-ink truncate">
                      {story.title || 'Untitled'}
                    </p>
                    <p className="text-sm text-charcoal-ink/50">
                      by {story.creator_name} • {formatDate(story.created_at)}
                    </p>
                  </div>
                  <div className="text-heritage-green/50">
                    {getMediaIcon(story.media_type)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(story.category)}`}>
                      {getCategoryLabel(story.category)}
                    </span>
                    {story.duration_seconds > 0 && (
                      <span className="text-xs text-charcoal-ink/40">
                        {formatDuration(story.duration_seconds)}
                      </span>
                    )}
                  </div>
                  <Play className="w-5 h-5 text-heritage-green" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
