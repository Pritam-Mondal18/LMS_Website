/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#090040',
          violet: '#471396',
          purple: '#B13BFF',
          pink: '#FF2E93',
          surface: '#0F0052',
          card: '#140c5c',
          textMuted: '#9e97e2',
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #090040 0%, #471396 50%, #B13BFF 100%)',
        'pink-purple': 'linear-gradient(to right, #FF2E93, #B13BFF)',
        'purple-blue': 'linear-gradient(to right, #B13BFF, #0070F3)',
        'hero-gradient': 'radial-gradient(circle at top, #471396 0%, #090040 60%)',
      }
    },
  },
  plugins: [],
}
