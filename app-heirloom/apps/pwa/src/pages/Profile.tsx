import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, LogOut, User, Mail, Users } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface FamilyInfo {
  id: string;
  name: string;
  role: string;
  member_count: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [families, setFamilies] = useState<FamilyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);

    // Load user profile
    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setFullName(profileData.full_name || '');
    }

    // Load user's families
    const { data: memberships } = await supabase
      .from('family_members')
      .select(`
        role,
        family:families (
          id,
          name
        )
      `)
      .eq('user_id', user.id);

    if (memberships) {
      const familyInfos: FamilyInfo[] = [];
      for (const m of memberships) {
        if (m.family) {
          // Get member count for each family
          const { count } = await supabase
            .from('family_members')
            .select('*', { count: 'exact', head: true })
            .eq('family_id', (m.family as any).id);

          familyInfos.push({
            id: (m.family as any).id,
            name: (m.family as any).name,
            role: m.role,
            member_count: count || 1,
          });
        }
      }
      setFamilies(familyInfos);
    }

    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (!error && profile) {
      setProfile({ ...profile, full_name: fullName });
      setIsEditing(false);
    }

    setSaving(false);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);

    try {
      // Upload avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          avatar_url: urlData.publicUrl + '?t=' + Date.now(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (!updateError && profile) {
        setProfile({ ...profile, avatar_url: urlData.publicUrl + '?t=' + Date.now() });
      }
    } catch (err) {
      console.error('Photo upload error:', err);
    }

    setUploadingPhoto(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-charcoal-ink/60">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-white border-b border-heritage-green/10 px-5 py-4 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ChevronLeft className="w-6 h-6 text-charcoal-ink" />
          </button>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-heritage-green" />
            <h1 className="font-semibold text-lg">Profile</h1>
          </div>
        </div>
      </header>

      <div className="px-5 py-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="relative"
          >
            <div className="w-24 h-24 rounded-full bg-heritage-green/10 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-heritage-green/40" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-heritage-green text-white flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4" />
            </div>
          </button>
          {uploadingPhoto && (
            <p className="text-sm text-charcoal-ink/60 mt-2">Uploading...</p>
          )}
        </div>

        {/* Profile Info */}
        <div className="card">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-ink/60 mb-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </div>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-charcoal-ink font-medium">
                  {profile?.full_name || 'Not set'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-ink/60 mb-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
              </label>
              <p className="text-charcoal-ink">{profile?.email}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-heritage-green/10">
            {isEditing ? (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFullName(profile?.full_name || '');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary w-full"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Families Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-charcoal-ink flex items-center gap-2">
              <Users className="w-5 h-5 text-heritage-green" />
              My Families
            </h2>
            <button
              onClick={() => navigate('/family/invite')}
              className="text-sm text-heritage-green font-medium"
            >
              + Create/Join
            </button>
          </div>

          {families.length > 0 ? (
            <div className="space-y-3">
              {families.map((family) => (
                <div
                  key={family.id}
                  className="flex items-center justify-between p-3 bg-heritage-green/5 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-charcoal-ink">{family.name}</p>
                    <p className="text-sm text-charcoal-ink/60">
                      {family.member_count} member{family.member_count !== 1 ? 's' : ''} • {family.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Users className="w-10 h-10 text-heritage-green/20 mx-auto mb-2" />
              <p className="text-charcoal-ink/60 text-sm">
                No family connections yet
              </p>
              <button
                onClick={() => navigate('/family/invite')}
                className="btn-primary mt-4"
              >
                Create or Join a Family
              </button>
            </div>
          )}
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3 text-red-600 font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
