/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32',   // Dark Green (e.g., buttons, headers)
          light: '#A5D6A7',     // Light Green (e.g., backgrounds, accents)
        },
        accent: '#66BB6A',       // Optional vibrant accent green
      },
    },
  },
  plugins: [
  require('@tailwindcss/typography'),
],
};
