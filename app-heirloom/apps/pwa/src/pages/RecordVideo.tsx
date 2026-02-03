import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Square, Check, SwitchCamera } from 'lucide-react';
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

export default function RecordVideo() {
  const navigate = useNavigate();
  const location = useLocation();
  const prompt = location.state?.prompt;

  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [step, setStep] = useState<'preview' | 'record' | 'save'>('preview');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(prompt?.category || 'legacy');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => window.clearInterval(interval);
  }, [isRecording]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStep('record');
    } catch (err) {
      console.error('Camera error:', err);
      setError('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm',
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setVideoBlob(blob);
      setVideoUrl(URL.createObjectURL(blob));
      stopCamera();
      setStep('save');
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setSeconds(0);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    if (!videoBlob || !user) return;

    setSaving(true);
    setError('');

    try {
      const { data: vault } = await supabase
        .from('vaults')
        .select('id')
        .eq('owner_user_id', user.id)
        .eq('type', 'personal')
        .single();

      if (!vault) {
        throw new Error('Vault not found');
      }

      const fileName = `${user.id}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(fileName, videoBlob, {
          contentType: 'video/webm',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('stories')
        .insert({
          vault_id: vault.id,
          created_by: user.id,
          title: title || prompt?.text?.slice(0, 50) || 'Untitled Video',
          media_type: 'video',
          media_url: urlData.publicUrl,
          duration_seconds: seconds,
          category,
          prompt_id: prompt?.id || null,
        });

      if (insertError) throw insertError;

      navigate('/vault');
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save video. Please try again.');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    stopCamera();
    navigate(-1);
  };

  const handleBack = () => {
    setVideoBlob(null);
    setVideoUrl(null);
    setSeconds(0);
    startCamera();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-4 safe-top">
        <button
          onClick={step === 'save' ? handleBack : handleCancel}
          className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
          <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white/50'}`} />
          <span className="text-sm font-medium text-white">
            {formatTime(seconds)}
          </span>
        </div>

        {step === 'record' && !isRecording && (
          <button
            onClick={switchCamera}
            className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
          >
            <SwitchCamera className="w-5 h-5 text-white" />
          </button>
        )}
        {step === 'save' && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-10 h-10 rounded-full bg-heritage-green flex items-center justify-center"
          >
            <Check className="w-5 h-5 text-white" />
          </button>
        )}
        {(step === 'record' && isRecording) && <div className="w-10" />}
      </header>

      {step !== 'save' ? (
        <>
          {/* Camera Preview */}
          <div className="flex-1 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />
          </div>

          {/* Prompt */}
          {prompt && (
            <div className="absolute bottom-32 left-5 right-5 bg-black/50 rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-heirloom-gold mb-1">
                Prompt
              </p>
              <p className="text-white text-sm leading-relaxed">{prompt.text}</p>
            </div>
          )}

          {/* Record Button */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center safe-bottom">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-500'
                  : 'bg-white border-4 border-white'
              }`}
            >
              {isRecording ? (
                <Square className="w-8 h-8 text-white fill-white" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-red-500" />
              )}
            </button>
          </div>

          {error && (
            <div className="absolute top-20 left-5 right-5 bg-red-500 text-white px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </>
      ) : (
        /* Save Form */
        <div className="flex-1 bg-ivory-linen px-5 py-6 pt-20">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {/* Video Preview */}
          {videoUrl && (
            <div className="mb-4 rounded-xl overflow-hidden bg-black">
              <video
                src={videoUrl}
                controls
                className="w-full"
                style={{ maxHeight: '200px' }}
              />
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
              placeholder={prompt?.text?.slice(0, 40) || 'Name your video'}
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
