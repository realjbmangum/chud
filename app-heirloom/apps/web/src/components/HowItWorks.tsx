const steps = [
  {
    number: '01',
    title: 'Create Your Account',
    description: 'Sign up in seconds. No credit card required to start preserving your memories.',
  },
  {
    number: '02',
    title: 'Record Your Stories',
    description: 'Answer guided prompts with voice, video, or photos. Just tap and share what matters.',
  },
  {
    number: '03',
    title: 'Share With Family',
    description: 'Invite loved ones to view, contribute, and build your family legacy together.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding bg-heritage-green">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-heirloom-gold font-medium tracking-wide uppercase text-sm mb-4">
            How It Works
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-ivory-linen mb-4">
            Start in Minutes, Not Hours
          </h2>
          <p className="text-ivory-linen/70 text-lg max-w-2xl mx-auto">
            We&apos;ve made preserving your legacy as simple as having a conversation.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-16">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Step Number */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-heirloom-gold text-heirloom-gold font-display text-2xl mb-6">
                {step.number}
              </div>

              {/* Step Content */}
              <h3 className="font-serif text-xl text-ivory-linen mb-3">
                {step.title}
              </h3>
              <p className="text-ivory-linen/70 leading-relaxed">
                {step.description}
              </p>

              {/* Connector Line (not on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-heirloom-gold/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
