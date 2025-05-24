/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1e7f38",
        primaryDark: "#176430",
        secondary: "#28a745",
      },
    },
  },
  plugins: [],
};
