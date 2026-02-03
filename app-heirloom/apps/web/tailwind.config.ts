import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Heirloom Brand Colors
        'heritage-green': '#0C3B2E',
        'heirloom-gold': '#C4A464',
        'ivory-linen': '#F8F5EE',
        'memory-blue': '#91A8C0',
        'charcoal-ink': '#2A2A2A',
      },
      fontFamily: {
        // Heirloom Typography
        'serif': ['var(--font-cormorant)', 'Georgia', 'serif'],
        'sans': ['var(--font-inter)', 'system-ui', 'sans-serif'],
        'display': ['var(--font-playfair)', 'Georgia', 'serif'],
        'script': ['var(--font-great-vibes)', 'cursive'],
      },
    },
  },
  plugins: [],
}

export default config
