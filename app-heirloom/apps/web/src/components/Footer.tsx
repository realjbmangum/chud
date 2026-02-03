import Link from 'next/link'

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'How It Works', href: '#how-it-works' },
  ],
  company: [
    { label: 'About', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'FAQ', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Security', href: '#' },
  ],
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-charcoal-ink text-ivory-linen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <span className="font-script text-3xl text-ivory-linen">
                Heirloom
              </span>
            </Link>
            <p className="text-ivory-linen/60 text-sm leading-relaxed">
              Preserve your family&apos;s stories for generations to come.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-medium text-ivory-linen mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-ivory-linen/60 hover:text-heirloom-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-medium text-ivory-linen mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-ivory-linen/60 hover:text-heirloom-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-medium text-ivory-linen mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-ivory-linen/60 hover:text-heirloom-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-ivory-linen/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-ivory-linen/50 text-sm">
            &copy; {currentYear} Heirloom. All rights reserved.
          </p>
          <p className="text-ivory-linen/30 text-xs">
            Built with love for families everywhere.
          </p>
        </div>
      </div>
    </footer>
  )
}
