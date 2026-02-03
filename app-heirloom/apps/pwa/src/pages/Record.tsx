import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Mic, Square, Check } from 'lucide-react';
import { useRecorder } from '../hooks/useRecorder';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
  { id: 'early_life', label: 'Early Life', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'school_years', label: 'School Years', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { id: 'young_adulthood', label: 'Young Adult', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { id: 'relationships', label: 'Relationships', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { id: 'career', label: 'Career', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'challenges', label: 'Challenges', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'personal_growth', label: 'Growth', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'legacy', label: 'Legacy', color: 'bg-heritage-green/10 text-heritage-green border-heritage-green/20' },
  { id: 'gratitude', label: 'Gratitude', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'final_thoughts', label: 'Final Words', color: 'bg-rose-100 text-rose-700 border-rose-200' },
];

export default function Record() {
  const navigate = useNavigate();
  const location = useLocation();
  const prompt = location.state?.prompt;

  const { user } = useAuth();
  const { isRecording, seconds, audioBlob, startRecording, stopRecording, resetRecording } = useRecorder();

  const [step, setStep] = useState<'record' | 'save'>('record');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(prompt?.category || 'legacy');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecord = async () => {
    if (isRecording) {
      await stopRecording();
      setStep('save');
    } else {
      await startRecording();
    }
  };

  const handleSave = async () => {
    if (!audioBlob || !user) return;

    setSaving(true);
    setError('');

    try {
      // Get user's personal vault
      const { data: vault } = await supabase
        .from('vaults')
        .select('id')
        .eq('owner_user_id', user.id)
        .eq('type', 'personal')
        .single();

      if (!vault) {
        throw new Error('Vault not found');
      }

      // Upload audio to storage
      const fileName = `${user.id}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(fileName, audioBlob, {
          contentType: audioBlob.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName);

      // Save story record
      const { error: insertError } = await supabase
        .from('stories')
        .insert({
          vault_id: vault.id,
          created_by: user.id,
          title: title || prompt?.text?.slice(0, 50) || 'Untitled Recording',
          media_type: 'audio',
          media_url: urlData.publicUrl,
          duration_seconds: seconds,
          category,
          prompt_id: prompt?.id || null,
        });

      if (insertError) throw insertError;

      navigate('/vault');
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save recording. Please try again.');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    resetRecording();
    navigate(-1);
  };

  const handleBack = () => {
    resetRecording();
    setStep('record');
  };

  return (
    <div className="min-h-screen bg-ivory-linen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 safe-top">
        <button
          onClick={step === 'save' ? handleBack : handleCancel}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
        >
          <X className="w-5 h-5 text-charcoal-ink" />
        </button>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
          <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-charcoal-ink/30'}`} />
          <span className="text-sm font-medium">
            {isRecording ? 'Recording' : step === 'save' ? 'Review' : 'Ready'}
          </span>
        </div>

        {step === 'save' && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-10 h-10 rounded-full bg-heritage-green shadow-sm flex items-center justify-center"
          >
            <Check className="w-5 h-5 text-white" />
          </button>
        )}
        {step === 'record' && <div className="w-10" />}
      </header>

      {step === 'record' ? (
        <>
          {/* Timer */}
          <div className="flex-1 flex flex-col items-center justify-center px-5">
            <p className={`text-7xl font-light tracking-tight ${isRecording ? 'text-heirloom-gold' : 'text-charcoal-ink'}`}>
              {formatTime(seconds)}
            </p>
            <p className="mt-3 text-charcoal-ink/60">
              {isRecording ? 'Recording your story...' : 'Tap the button to start'}
            </p>
          </div>

          {/* Prompt Reminder */}
          {prompt && (
            <div className="mx-5 mb-8 card">
              <p className="text-xs font-semibold uppercase tracking-wider text-heirloom-gold mb-2">
                Your Prompt
              </p>
              <p className="text-charcoal-ink leading-relaxed">{prompt.text}</p>
            </div>
          )}

          {/* Record Button */}
          <div className="flex flex-col items-center pb-12 safe-bottom">
            <button
              onClick={handleRecord}
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                isRecording
                  ? 'bg-red-500 shadow-red-500/30'
                  : 'bg-heirloom-gold shadow-heirloom-gold/30'
              }`}
            >
              {isRecording ? (
                <Square className="w-8 h-8 text-white fill-white" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </button>
            <p className="mt-4 text-charcoal-ink font-medium">
              {isRecording ? 'Tap to stop' : 'Tap to record'}
            </p>
          </div>
        </>
      ) : (
        /* Save Form */
        <div className="flex-1 px-5 py-6">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="card mb-4">
            <p className="text-sm text-charcoal-ink/60 mb-1">Duration</p>
            <p className="text-2xl font-light text-heritage-green">{formatTime(seconds)}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-charcoal-ink mb-2">
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder={prompt?.text?.slice(0, 40) || 'Name your recording'}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-charcoal-ink mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    category === cat.id
                      ? cat.color + ' ring-2 ring-offset-1 ring-heritage-green/30'
                      : 'bg-white text-charcoal-ink/60 border-charcoal-ink/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? 'Saving...' : 'Save to Vault'}
          </button>
        </div>
      )}
    </div>
  );
}
