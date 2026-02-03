import Link from 'next/link'

export default function Hero() {
  return (
    <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          {/* Eyebrow */}
          <p className="text-heirloom-gold font-medium tracking-wide uppercase text-sm mb-6">
            Preserve What Matters Most
          </p>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-heritage-green leading-tight mb-6">
            Your Story Is Worth{' '}
            <span className="italic">Preserving</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-charcoal-ink/70 font-light leading-relaxed mb-10 max-w-2xl mx-auto">
            Capture your family&apos;s memories with guided prompts, secure storage,
            and effortless sharing across generations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#waitlist" className="btn-primary text-lg px-10 py-4">
              Start Your Legacy
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-lg px-10 py-4">
              See How It Works
            </Link>
          </div>

          {/* Trust Indicator */}
          <p className="mt-10 text-charcoal-ink/50 text-sm">
            Join families preserving their stories for future generations
          </p>
        </div>

        {/* Hero Video */}
        <div className="mt-16 max-w-sm mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-heritage-green/20">
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/heirloom-poster.jpg"
              className="w-full h-auto"
            >
              <source src="/heirloom2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </section>
  )
}
