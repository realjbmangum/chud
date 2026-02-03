import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Pause, Trash2, Mic, Video, FileText, Image, Share2, Users, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface Story {
  id: string;
  title: string;
  media_type: string;
  media_url: string;
  duration_seconds: number;
  category: string;
  transcript: string | null;
  created_at: string;
  is_shared_to_family: boolean;
}

interface Family {
  id: string;
  name: string;
}

const CATEGORIES = [
  { id: 'early_life', label: 'Early Life' },
  { id: 'school_years', label: 'School Years' },
  { id: 'young_adulthood', label: 'Young Adult' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'career', label: 'Career' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'personal_growth', label: 'Growth' },
  { id: 'legacy', label: 'Legacy' },
  { id: 'gratitude', label: 'Gratitude' },
  { id: 'final_thoughts', label: 'Final Words' },
];

export default function StoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [families, setFamilies] = useState<Family[]>([]);
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    loadStory();
    loadFamilies();
  }, [id, user]);

  const loadStory = async () => {
    if (!id) return;

    const { data } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      setStory(data);
    }
    setLoading(false);
  };

  const loadFamilies = async () => {
    if (!user) return;

    const { data: memberships } = await supabase
      .from('family_members')
      .select(`
        family:families (
          id,
          name
        )
      `)
      .eq('user_id', user.id);

    if (memberships) {
      const familyList: Family[] = memberships
        .filter(m => m.family)
        .map(m => ({
          id: (m.family as any).id,
          name: (m.family as any).name,
        }));
      setFamilies(familyList);
    }
  };

  const handleShare = async () => {
    if (!story) return;

    setSharing(true);

    try {
      // Toggle the share status
      const newShareStatus = !story.is_shared_to_family;

      const { error } = await supabase
        .from('stories')
        .update({ is_shared_to_family: newShareStatus })
        .eq('id', story.id);

      if (error) throw error;

      setStory({ ...story, is_shared_to_family: newShareStatus });
      setShareSuccess(true);
      setTimeout(() => {
        setShareSuccess(false);
        setShowShareModal(false);
      }, 1500);
    } catch (err) {
      console.error('Share error:', err);
    }

    setSharing(false);
  };

  const togglePlay = () => {
    const mediaEl = story?.media_type === 'video' ? videoRef.current : audioRef.current;
    if (!mediaEl) return;

    if (isPlaying) {
      mediaEl.pause();
    } else {
      mediaEl.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const mediaEl = story?.media_type === 'video' ? videoRef.current : audioRef.current;
    if (mediaEl) {
      setCurrentTime(mediaEl.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    const mediaEl = story?.media_type === 'video' ? videoRef.current : audioRef.current;
    if (mediaEl) {
      mediaEl.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleDelete = async () => {
    if (!story || !confirm('Are you sure you want to delete this story?')) return;

    setDeleting(true);

    // Delete from storage (if has media URL)
    if (story.media_url) {
      const path = story.media_url.split('/stories/')[1];
      if (path) {
        await supabase.storage.from('stories').remove([path]);
      }
    }

    // Delete from database
    await supabase.from('stories').delete().eq('id', story.id);

    navigate('/vault');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'photo': return <Image className="w-5 h-5" />;
      case 'text': return <FileText className="w-5 h-5" />;
      default: return <Mic className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-charcoal-ink/60">Loading...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-charcoal-ink/60">Story not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-heritage-green/10 px-5 py-4 safe-top">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-1">
            <ChevronLeft className="w-6 h-6 text-charcoal-ink" />
          </button>
          <div className="flex items-center gap-2 text-charcoal-ink/60">
            {getMediaIcon(story.media_type)}
            <span className="text-sm capitalize">{story.media_type}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowShareModal(true)}
              className={`p-2 ${story.is_shared_to_family ? 'text-heritage-green' : 'text-charcoal-ink/60'}`}
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 text-red-500"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl w-full max-w-lg p-5 pb-8 safe-bottom animate-slide-up">
            <div className="w-12 h-1 bg-charcoal-ink/20 rounded-full mx-auto mb-4" />

            {shareSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-heritage-green/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-heritage-green" />
                </div>
                <p className="text-lg font-medium text-heritage-green">
                  {story.is_shared_to_family ? 'Shared with family!' : 'Removed from family'}
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-charcoal-ink mb-2">
                  Share with Family
                </h3>

                {families.length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="w-12 h-12 text-heritage-green/20 mx-auto mb-3" />
                    <p className="text-charcoal-ink/60 mb-4">
                      You're not part of any family yet.
                    </p>
                    <button
                      onClick={() => {
                        setShowShareModal(false);
                        navigate('/family/invite');
                      }}
                      className="btn-primary"
                    >
                      Create or Join Family
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-charcoal-ink/60 text-sm mb-4">
                      {story.is_shared_to_family
                        ? 'This story is currently shared with your family. Tap below to make it private.'
                        : 'Share this story with your family members.'}
                    </p>

                    <div className="space-y-2 mb-4">
                      {families.map((family) => (
                        <div
                          key={family.id}
                          className="flex items-center gap-3 p-3 bg-heritage-green/5 rounded-lg"
                        >
                          <div className="w-10 h-10 rounded-full bg-heritage-green/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-heritage-green" />
                          </div>
                          <span className="font-medium text-charcoal-ink">{family.name}</span>
                          {story.is_shared_to_family && (
                            <Check className="w-5 h-5 text-heritage-green ml-auto" />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowShareModal(false)}
                        className="btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleShare}
                        disabled={sharing}
                        className={`flex-1 ${story.is_shared_to_family ? 'btn-secondary' : 'btn-primary'}`}
                      >
                        {sharing
                          ? '...'
                          : story.is_shared_to_family
                          ? 'Make Private'
                          : 'Share'}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="px-5 py-6">
        {/* Title & Meta */}
        <h1 className="text-2xl font-serif text-heritage-green mb-2">
          {story.title || 'Untitled Story'}
        </h1>
        <div className="flex items-center gap-3 mb-6">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(story.category)}`}>
            {getCategoryLabel(story.category)}
          </span>
          <span className="text-sm text-charcoal-ink/50">
            {formatDate(story.created_at)}
          </span>
        </div>

        {/* Media Content */}
        {story.media_type === 'audio' && (
          <div className="card">
            <audio
              ref={audioRef}
              src={story.media_url}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
            />

            <div className="flex justify-center mb-6">
              <button
                onClick={togglePlay}
                className="w-20 h-20 rounded-full bg-heritage-green text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={story.duration_seconds || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-heritage-green/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-heritage-green"
              />
              <div className="flex justify-between text-sm text-charcoal-ink/50">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(story.duration_seconds || 0)}</span>
              </div>
            </div>
          </div>
        )}

        {story.media_type === 'video' && (
          <div className="card">
            <video
              ref={videoRef}
              src={story.media_url}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              controls
              className="w-full rounded-lg mb-4"
            />
            <div className="text-sm text-charcoal-ink/50 text-center">
              Duration: {formatTime(story.duration_seconds || 0)}
            </div>
          </div>
        )}

        {story.media_type === 'photo' && (
          <div className="card">
            <img
              src={story.media_url}
              alt={story.title || 'Photo'}
              className="w-full rounded-lg mb-4"
            />
            {story.transcript && (
              <div className="pt-4 border-t border-heritage-green/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-heirloom-gold mb-2">
                  Caption
                </p>
                <p className="text-charcoal-ink leading-relaxed whitespace-pre-wrap">
                  {story.transcript}
                </p>
              </div>
            )}
          </div>
        )}

        {story.media_type === 'text' && (
          <div className="card">
            <p className="text-charcoal-ink leading-relaxed whitespace-pre-wrap">
              {story.transcript || 'No content'}
            </p>
            <div className="mt-4 pt-4 border-t border-heritage-green/10 text-sm text-charcoal-ink/50">
              {story.transcript?.length || 0} characters
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
