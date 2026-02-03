import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if we have a valid session from the reset link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // No session, redirect to forgot password
        navigate('/forgot-password');
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-heritage-green/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-heritage-green" />
          </div>
          <h1 className="text-2xl font-serif text-heritage-green mb-3">
            Password Reset!
          </h1>
          <p className="text-charcoal-ink/60">
            Your password has been successfully reset. Redirecting you now...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        {/* Header */}
        <h1 className="text-2xl font-serif text-heritage-green mb-2">
          Reset Your Password
        </h1>
        <p className="text-charcoal-ink/60 mb-8">
          Enter your new password below.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-charcoal-ink mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-ink/40" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10"
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-charcoal-ink mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-ink/40" />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input pl-10"
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
