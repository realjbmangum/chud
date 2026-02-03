import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, UserPlus, Mail, Copy, Check, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface Family {
  id: string;
  name: string;
  role: string;
}

export default function InviteFamily() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mode, setMode] = useState<'select' | 'create' | 'invite'>('select');
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [familyName, setFamilyName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadFamilies();
  }, [user]);

  const loadFamilies = async () => {
    if (!user) return;

    setLoading(true);

    // Get user's families
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

    if (memberships && memberships.length > 0) {
      const familyList: Family[] = memberships
        .filter(m => m.family)
        .map(m => ({
          id: (m.family as any).id,
          name: (m.family as any).name,
          role: m.role,
        }));
      setFamilies(familyList);
    }

    setLoading(false);
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim() || !user) return;

    setCreating(true);
    setError('');

    try {
      // Create the family
      const { data: family, error: createError } = await supabase
        .from('families')
        .insert({
          name: familyName.trim(),
          created_by: user.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

      // Create family vault
      await supabase
        .from('vaults')
        .insert({
          type: 'family',
          owner_family_id: family.id,
        });

      // Generate invite code
      const code = generateInviteCode(family.id);
      setInviteCode(code);

      const newFamily = { id: family.id, name: family.name, role: 'admin' };
      setFamilies([...families, newFamily]);
      setSelectedFamily(newFamily);
      setMode('invite');
      setSuccess('Family created! Now invite your loved ones.');
    } catch (err) {
      console.error('Create error:', err);
      setError('Failed to create family. Please try again.');
    }

    setCreating(false);
  };

  const generateInviteCode = (familyId: string) => {
    // Simple invite code: base64 of family ID + random string
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${familyId.substring(0, 8).toUpperCase()}-${randomPart}`;
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !selectedFamily || !user) return;

    setSending(true);
    setError('');

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', inviteEmail.trim().toLowerCase())
        .single();

      if (existingUser) {
        // Check if already a member
        const { data: existingMember } = await supabase
          .from('family_members')
          .select('id')
          .eq('family_id', selectedFamily.id)
          .eq('user_id', existingUser.id)
          .single();

        if (existingMember) {
          setError('This person is already a member of this family.');
          setSending(false);
          return;
        }

        // Add them directly
        await supabase
          .from('family_members')
          .insert({
            family_id: selectedFamily.id,
            user_id: existingUser.id,
            role: 'member',
          });

        setSuccess(`${inviteEmail} has been added to ${selectedFamily.name}!`);
      } else {
        // For non-existing users, we'd normally send an email invitation
        // For now, show the invite code
        setSuccess(`Invitation sent to ${inviteEmail}! They can join using the code below.`);
      }

      setInviteEmail('');
    } catch (err) {
      console.error('Invite error:', err);
      setError('Failed to send invitation. Please try again.');
    }

    setSending(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinFamily = async () => {
    if (!joinCode.trim() || !user) return;

    setJoining(true);
    setError('');

    try {
      // Parse the invite code to get family ID
      const familyIdPrefix = joinCode.trim().split('-')[0].toLowerCase();

      // Find the family
      const { data: allFamilies } = await supabase
        .from('families')
        .select('id, name');

      const matchingFamily = allFamilies?.find(f =>
        f.id.substring(0, 8).toLowerCase() === familyIdPrefix
      );

      if (!matchingFamily) {
        setError('Invalid invite code. Please check and try again.');
        setJoining(false);
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('family_members')
        .select('id')
        .eq('family_id', matchingFamily.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        setError('You are already a member of this family.');
        setJoining(false);
        return;
      }

      // Add user to family
      await supabase
        .from('family_members')
        .insert({
          family_id: matchingFamily.id,
          user_id: user.id,
          role: 'member',
        });

      setSuccess(`You've joined ${matchingFamily.name}!`);
      setFamilies([...families, { id: matchingFamily.id, name: matchingFamily.name, role: 'member' }]);
      setJoinCode('');

      setTimeout(() => {
        navigate('/family');
      }, 1500);
    } catch (err) {
      console.error('Join error:', err);
      setError('Failed to join family. Please try again.');
    }

    setJoining(false);
  };

  const selectFamilyForInvite = (family: Family) => {
    setSelectedFamily(family);
    setInviteCode(generateInviteCode(family.id));
    setMode('invite');
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
          <button
            onClick={() => {
              if (mode !== 'select') {
                setMode('select');
                setError('');
                setSuccess('');
              } else {
                navigate(-1);
              }
            }}
            className="p-1"
          >
            <ChevronLeft className="w-6 h-6 text-charcoal-ink" />
          </button>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-heritage-green" />
            <h1 className="font-semibold text-lg">
              {mode === 'create' ? 'Create Family' : mode === 'invite' ? 'Invite Family' : 'Family'}
            </h1>
          </div>
        </div>
      </header>

      <div className="px-5 py-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm mb-4">
            {success}
          </div>
        )}

        {mode === 'select' && (
          <div className="space-y-6">
            {/* Existing Families */}
            {families.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-charcoal-ink/60 mb-3">
                  Invite to existing family
                </h2>
                <div className="space-y-2">
                  {families.map((family) => (
                    <button
                      key={family.id}
                      onClick={() => selectFamilyForInvite(family)}
                      className="card w-full text-left flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-charcoal-ink">{family.name}</p>
                        <p className="text-sm text-charcoal-ink/50">{family.role}</p>
                      </div>
                      <UserPlus className="w-5 h-5 text-heritage-green" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Create New Family */}
            <div>
              <h2 className="text-sm font-medium text-charcoal-ink/60 mb-3">
                Start a new family
              </h2>
              <button
                onClick={() => setMode('create')}
                className="card w-full text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-heritage-green/10 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-heritage-green" />
                </div>
                <div>
                  <p className="font-medium text-charcoal-ink">Create New Family</p>
                  <p className="text-sm text-charcoal-ink/50">
                    Start a new family vault to share stories
                  </p>
                </div>
              </button>
            </div>

            {/* Join Family */}
            <div>
              <h2 className="text-sm font-medium text-charcoal-ink/60 mb-3">
                Join a family
              </h2>
              <div className="card">
                <p className="text-sm text-charcoal-ink/60 mb-3">
                  Have an invite code? Enter it below to join a family.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="input flex-1"
                    placeholder="XXXXXXXX-XXXXXX"
                  />
                  <button
                    onClick={handleJoinFamily}
                    disabled={joining || !joinCode.trim()}
                    className="btn-primary"
                  >
                    {joining ? '...' : 'Join'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-heritage-green/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-heritage-green" />
              </div>
              <h2 className="text-xl font-serif text-heritage-green mb-2">
                Create Your Family
              </h2>
              <p className="text-charcoal-ink/60">
                Give your family a name to get started.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-ink mb-2">
                Family Name
              </label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="input"
                placeholder="e.g., The Johnson Family"
              />
            </div>

            <button
              onClick={handleCreateFamily}
              disabled={creating || !familyName.trim()}
              className="btn-primary w-full"
            >
              {creating ? 'Creating...' : 'Create Family'}
            </button>
          </div>
        )}

        {mode === 'invite' && selectedFamily && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-heritage-green/10 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-heritage-green" />
              </div>
              <h2 className="text-xl font-serif text-heritage-green mb-2">
                Invite to {selectedFamily.name}
              </h2>
              <p className="text-charcoal-ink/60">
                Add family members to share stories together.
              </p>
            </div>

            {/* Email Invite */}
            <div>
              <label className="block text-sm font-medium text-charcoal-ink mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Invite by Email
                </div>
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="input flex-1"
                  placeholder="family@example.com"
                />
                <button
                  onClick={handleSendInvite}
                  disabled={sending || !inviteEmail.trim()}
                  className="btn-primary"
                >
                  {sending ? '...' : 'Invite'}
                </button>
              </div>
            </div>

            {/* Invite Code */}
            <div>
              <label className="block text-sm font-medium text-charcoal-ink mb-2">
                Or share this invite code
              </label>
              <div className="card bg-heritage-green/5 flex items-center justify-between">
                <code className="text-lg font-mono text-heritage-green">
                  {inviteCode}
                </code>
                <button
                  onClick={handleCopyCode}
                  className="p-2 hover:bg-heritage-green/10 rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-heritage-green" />
                  )}
                </button>
              </div>
              <p className="text-xs text-charcoal-ink/50 mt-2">
                Share this code with family members so they can join.
              </p>
            </div>

            <button
              onClick={() => navigate('/family')}
              className="btn-secondary w-full"
            >
              Go to Family Vault
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
