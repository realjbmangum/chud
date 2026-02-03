/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
        script: ['Great Vibes', 'cursive'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
