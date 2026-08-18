/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#0B0F14',
          900: '#12171E',
          850: '#181E26',
          800: '#1E242C',
          700: '#2A323D',
          600: '#384352',
        },
        limeAccent: {
          400: '#C7FF85',
          500: '#B5FF57',
          600: '#9EE642',
          700: '#82CC2E',
        },
      },
    },
  },
  plugins: [],
}
