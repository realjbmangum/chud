import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-heritage-green/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-heritage-green" />
          </div>
          <h1 className="text-2xl font-serif text-heritage-green mb-3">
            Check Your Email
          </h1>
          <p className="text-charcoal-ink/60 mb-8">
            We've sent a password reset link to <strong>{email}</strong>.
            Click the link in the email to reset your password.
          </p>
          <Link to="/login" className="btn-primary inline-block">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-charcoal-ink/60 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>

        {/* Header */}
        <h1 className="text-2xl font-serif text-heritage-green mb-2">
          Forgot Password?
        </h1>
        <p className="text-charcoal-ink/60 mb-8">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-charcoal-ink mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-ink/40" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
