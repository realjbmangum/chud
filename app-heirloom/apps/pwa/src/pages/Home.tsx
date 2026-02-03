import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, Folder, ChevronRight, RefreshCw, Video, FileText, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface Prompt {
  id: string;
  text: string;
  category: string;
}

interface Story {
  id: string;
  title: string;
  media_type: string;
  media_url: string;
  duration_seconds: number;
  category: string;
  created_at: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Load random prompt
    const { data: prompts } = await supabase
      .from('prompts')
      .select('*')
      .eq('is_active', true);

    if (prompts && prompts.length > 0) {
      const randomIndex = Math.floor(Math.random() * prompts.length);
      setPrompt(prompts[randomIndex]);
    }

    // Load user's stories
    if (user) {
      const { data: vaults } = await supabase
        .from('vaults')
        .select('id')
        .eq('owner_user_id', user.id)
        .eq('type', 'personal')
        .single();

      if (vaults) {
        const { data: storiesData } = await supabase
          .from('stories')
          .select('*')
          .eq('vault_id', vaults.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (storiesData) {
          setStories(storiesData);
        }
      }
    }

    setLoading(false);
  };

  const shufflePrompt = async () => {
    const { data: prompts } = await supabase
      .from('prompts')
      .select('*')
      .eq('is_active', true);

    if (prompts && prompts.length > 0) {
      const randomIndex = Math.floor(Math.random() * prompts.length);
      setPrompt(prompts[randomIndex]);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      early_life: 'Early Life',
      school_years: 'School Years',
      young_adulthood: 'Young Adult',
      relationships: 'Relationships',
      career: 'Career',
      challenges: 'Challenges',
      personal_growth: 'Growth',
      legacy: 'Legacy',
      gratitude: 'Gratitude',
      final_thoughts: 'Final Words',
    };
    return labels[category] || category;
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

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-white border-b border-heritage-green/10 px-5 py-4 safe-top">
        <h1 className="font-script text-3xl text-heritage-green">Heirloom</h1>
      </header>

      <div className="px-5 py-6 space-y-8">
        {/* Daily Prompt Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-heirloom-gold">
              Today's Prompt
            </span>
            <button
              onClick={shufflePrompt}
              className="p-2 rounded-full hover:bg-heritage-green/5 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-heritage-green" />
            </button>
          </div>

          {prompt ? (
            <>
              <p className="text-lg text-charcoal-ink font-medium mb-4 leading-relaxed">
                {prompt.text}
              </p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(prompt.category)}`}>
                {getCategoryLabel(prompt.category)}
              </span>
            </>
          ) : (
            <p className="text-charcoal-ink/60">Loading prompt...</p>
          )}

          <div className="grid grid-cols-4 gap-2 mt-5">
            <button
              onClick={() => navigate('/record', { state: { prompt } })}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-heritage-green/10 hover:bg-heritage-green/20 transition-colors"
            >
              <Mic className="w-6 h-6 text-heritage-green" />
              <span className="text-xs text-heritage-green font-medium">Audio</span>
            </button>
            <button
              onClick={() => navigate('/record/video', { state: { prompt } })}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-heritage-green/10 hover:bg-heritage-green/20 transition-colors"
            >
              <Video className="w-6 h-6 text-heritage-green" />
              <span className="text-xs text-heritage-green font-medium">Video</span>
            </button>
            <button
              onClick={() => navigate('/record/text', { state: { prompt } })}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-heritage-green/10 hover:bg-heritage-green/20 transition-colors"
            >
              <FileText className="w-6 h-6 text-heritage-green" />
              <span className="text-xs text-heritage-green font-medium">Write</span>
            </button>
            <button
              onClick={() => navigate('/record/photo', { state: { prompt } })}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-heritage-green/10 hover:bg-heritage-green/20 transition-colors"
            >
              <ImageIcon className="w-6 h-6 text-heritage-green" />
              <span className="text-xs text-heritage-green font-medium">Photo</span>
            </button>
          </div>
        </div>

        {/* My Vault Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-heritage-green" />
              <h2 className="font-semibold text-charcoal-ink">My Vault</h2>
            </div>
            <Link
              to="/vault"
              className="flex items-center gap-1 text-sm text-heritage-green font-medium"
            >
              See all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="card">
              <p className="text-charcoal-ink/60 text-center py-4">Loading...</p>
            </div>
          ) : stories.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5">
              {stories.map((story) => {
                const getMediaIcon = () => {
                  switch (story.media_type) {
                    case 'video': return <Video className="w-8 h-8 text-purple-500/50" />;
                    case 'photo': return <ImageIcon className="w-8 h-8 text-blue-500/50" />;
                    case 'text': return <FileText className="w-8 h-8 text-amber-500/50" />;
                    default: return <Mic className="w-8 h-8 text-heritage-green/40" />;
                  }
                };
                const getMediaBg = () => {
                  switch (story.media_type) {
                    case 'video': return 'bg-purple-100';
                    case 'photo': return 'bg-blue-100';
                    case 'text': return 'bg-amber-100';
                    default: return 'bg-heritage-green/10';
                  }
                };
                return (
                  <Link
                    key={story.id}
                    to={`/story/${story.id}`}
                    className="card flex-shrink-0 w-40 story-card"
                  >
                    <div className={`w-full h-20 rounded-lg mb-3 flex items-center justify-center ${getMediaBg()}`}>
                      {story.media_type === 'photo' && story.media_url ? (
                        <img
                          src={story.media_url}
                          alt={story.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        getMediaIcon()
                      )}
                    </div>
                    <p className="font-medium text-sm text-charcoal-ink truncate">
                      {story.title || 'Untitled'}
                    </p>
                    <p className="text-xs text-charcoal-ink/50 mt-1">
                      {story.duration_seconds > 0 ? formatDuration(story.duration_seconds) : story.media_type}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="card text-center py-8">
              <Folder className="w-10 h-10 text-heritage-green/20 mx-auto mb-3" />
              <p className="text-charcoal-ink/60">Your stories will appear here</p>
              <p className="text-sm text-charcoal-ink/40 mt-1">
                Record your first memory to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
