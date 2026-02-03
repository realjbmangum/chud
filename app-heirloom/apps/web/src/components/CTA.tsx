'use client'

import { useState } from 'react'

export default function CTA() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="waitlist" className="section-padding bg-gradient-to-br from-heritage-green to-heritage-green/90">
      <div className="max-w-3xl mx-auto text-center">
        {/* Main Message */}
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-ivory-linen mb-6 leading-tight">
          Your life is a story worth telling<br />
          <span className="text-heirloom-gold italic">and preserving for generations.</span>
        </h2>

        <p className="text-ivory-linen/80 text-lg md:text-xl mb-10 max-w-xl mx-auto">
          Join the waitlist and be the first to start building your family&apos;s legacy.
        </p>

        {/* Email Signup Form */}
        {status === 'success' ? (
          <div className="bg-ivory-linen/10 rounded-lg p-8 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-heirloom-gold/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-heirloom-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl text-ivory-linen mb-2">You&apos;re on the list!</h3>
            <p className="text-ivory-linen/70">
              We&apos;ll be in touch soon with early access to Heirloom.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <label htmlFor="waitlist-email" className="sr-only">Email address</label>
            <input
              id="waitlist-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-6 py-4 rounded-sm bg-ivory-linen text-charcoal-ink placeholder-charcoal-ink/50 focus:outline-none focus:ring-2 focus:ring-heirloom-gold"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-8 py-4 bg-heirloom-gold text-heritage-green font-medium rounded-sm hover:bg-heirloom-gold/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
            </button>
          </form>
          {status === 'error' && (
            <p className="text-red-300 text-sm mt-4">
              Something went wrong. Please try again.
            </p>
          )}
        )}

        {/* Privacy Note */}
        <p className="text-ivory-linen/50 text-sm mt-6">
          No spam, ever. We respect your privacy.
        </p>
      </div>
    </section>
  )
}
