const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Up to 10 recordings',
      'Basic guided prompts',
      '1 GB storage',
      'Personal vault only',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '$9',
    period: 'per month',
    description: 'For individuals serious about their legacy',
    features: [
      'Unlimited recordings',
      'Full prompt library',
      '50 GB storage',
      'Family vault sharing',
      'Time capsules',
      'Priority support',
    ],
    cta: 'Join Waitlist',
    highlighted: true,
  },
  {
    name: 'Family',
    price: '$19',
    period: 'per month',
    description: 'Unite your entire family',
    features: [
      'Everything in Premium',
      'Up to 6 family members',
      '200 GB shared storage',
      'Family tree features',
      'Collaborative stories',
      'Premium support',
    ],
    cta: 'Join Waitlist',
    highlighted: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="section-padding bg-ivory-linen">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-heirloom-gold font-medium tracking-wide uppercase text-sm mb-4">
            Pricing
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-heritage-green mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-charcoal-ink/60 text-lg max-w-2xl mx-auto">
            Start free. Upgrade when you&apos;re ready to unlock the full power of your family vault.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-lg p-8 ${
                plan.highlighted
                  ? 'bg-heritage-green text-ivory-linen ring-4 ring-heirloom-gold md:scale-105'
                  : 'bg-white border border-heritage-green/10'
              }`}
            >
              {/* Plan Header */}
              <div className="mb-6">
                <h3 className={`font-serif text-2xl mb-2 ${plan.highlighted ? 'text-ivory-linen' : 'text-heritage-green'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.highlighted ? 'text-ivory-linen/70' : 'text-charcoal-ink/60'}`}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className={`font-display text-4xl ${plan.highlighted ? 'text-ivory-linen' : 'text-heritage-green'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ml-2 ${plan.highlighted ? 'text-ivory-linen/70' : 'text-charcoal-ink/60'}`}>
                  {plan.period}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <svg
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-heirloom-gold' : 'text-heritage-green'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={plan.highlighted ? 'text-ivory-linen/90' : 'text-charcoal-ink/70'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#waitlist"
                className={`block text-center py-3 px-6 rounded-sm font-medium transition-all duration-200 ${
                  plan.highlighted
                    ? 'bg-heirloom-gold text-heritage-green hover:bg-heirloom-gold/90'
                    : 'bg-heritage-green text-ivory-linen hover:bg-heritage-green/90'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-charcoal-ink/50 text-sm mt-10">
          Prices shown are early adopter rates. Join the waitlist to lock in these prices.
        </p>
      </div>
    </section>
  )
}
