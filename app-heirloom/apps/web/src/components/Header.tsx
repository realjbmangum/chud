'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ivory-linen/95 backdrop-blur-sm border-b border-heritage-green/10">
      <nav className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-script text-3xl lg:text-4xl text-heritage-green">
              Heirloom
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-charcoal-ink/70 hover:text-heritage-green transition-colors font-medium"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-charcoal-ink/70 hover:text-heritage-green transition-colors font-medium"
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="text-charcoal-ink/70 hover:text-heritage-green transition-colors font-medium"
            >
              Pricing
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="#"
              className="text-heritage-green font-medium hover:text-heritage-green/80 transition-colors"
            >
              Sign In
            </Link>
            <Link href="#waitlist" className="btn-primary">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-heritage-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-heritage-green/10">
            <div className="flex flex-col gap-4">
              <Link href="#features" className="text-charcoal-ink/70 hover:text-heritage-green transition-colors font-medium py-2">
                Features
              </Link>
              <Link href="#how-it-works" className="text-charcoal-ink/70 hover:text-heritage-green transition-colors font-medium py-2">
                How It Works
              </Link>
              <Link href="#pricing" className="text-charcoal-ink/70 hover:text-heritage-green transition-colors font-medium py-2">
                Pricing
              </Link>
              <div className="flex flex-col gap-3 pt-4 border-t border-heritage-green/10">
                <Link href="#" className="text-heritage-green font-medium">
                  Sign In
                </Link>
                <Link href="#waitlist" className="btn-primary text-center">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
