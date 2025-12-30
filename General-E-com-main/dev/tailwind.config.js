/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
   darkMode: 'class', // enables class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',   // main blue
        secondary: '#60A5FA', // lighter blue
        milk: '#FAFAFA',      // soft white (light mode)
        darkblack: '#000000', // black (dark mode)
      },
      fontFamily: {
        // use Inter as the primary UI font with sensible fallbacks
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

