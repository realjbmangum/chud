/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'heritage-green': '#0C3B2E',
        'heirloom-gold': '#C4A464',
        'ivory-linen': '#F8F5EE',
        'memory-blue': '#91A8C0',
        'charcoal-ink': '#2A2A2A',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        script: ['Great Vibes', 'cursive'],
      },
    },
  },
  plugins: [],
};
