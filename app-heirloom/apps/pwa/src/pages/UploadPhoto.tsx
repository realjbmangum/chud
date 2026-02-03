import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Check, Image, Camera, Upload } from 'lucide-react';
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

export default function UploadPhoto() {
  const navigate = useNavigate();
  const location = useLocation();
  const prompt = location.state?.prompt;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState(prompt?.category || 'legacy');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!photoFile || !user) return;

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

      // Upload photo
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(fileName, photoFile, {
          contentType: photoFile.type,
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
          title: title || prompt?.text?.slice(0, 50) || 'Untitled Photo',
          media_type: 'photo',
          media_url: urlData.publicUrl,
          transcript: caption, // Store caption in transcript field
          category,
          prompt_id: prompt?.id || null,
        });

      if (insertError) throw insertError;

      navigate('/vault');
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save photo. Please try again.');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-ivory-linen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 safe-top">
        <button
          onClick={handleCancel}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
        >
          <X className="w-5 h-5 text-charcoal-ink" />
        </button>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
          <Image className="w-4 h-4 text-heritage-green" />
          <span className="text-sm font-medium">Add Photo</span>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !photoFile}
          className="w-10 h-10 rounded-full bg-heritage-green shadow-sm flex items-center justify-center disabled:opacity-50"
        >
          <Check className="w-5 h-5 text-white" />
        </button>
      </header>

      <div className="flex-1 px-5 py-4">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {/* Prompt */}
        {prompt && (
          <div className="card mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-heirloom-gold mb-2">
              Prompt
            </p>
            <p className="text-charcoal-ink leading-relaxed">{prompt.text}</p>
          </div>
        )}

        {/* Photo Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        {photoPreview ? (
          <div className="mb-4">
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full rounded-xl object-cover"
              style={{ maxHeight: '300px' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary w-full mt-3"
            >
              Change Photo
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-heritage-green/30 rounded-xl flex flex-col items-center justify-center gap-3 bg-white"
            >
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-full bg-heritage-green/10 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-heritage-green" />
                </div>
                <div className="w-14 h-14 rounded-full bg-heritage-green/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-heritage-green" />
                </div>
              </div>
              <p className="text-charcoal-ink/60 text-sm">
                Take a photo or choose from library
              </p>
            </button>
          </div>
        )}

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-charcoal-ink mb-2">
            Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder={prompt?.text?.slice(0, 40) || 'Name your photo'}
          />
        </div>

        {/* Caption */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-charcoal-ink mb-2">
            Caption (optional)
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="input min-h-[80px] resize-none"
            placeholder="Add a caption or story about this photo..."
          />
        </div>

        {/* Category */}
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
          disabled={saving || !photoFile}
          className="btn-primary w-full"
        >
          {saving ? 'Saving...' : 'Save to Vault'}
        </button>
      </div>
    </div>
  );
}
