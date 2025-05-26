// tailwind.config.js
export default {
  content: [
    "./index.html",           // 👈 Root index.html
    "./src/**/*.{js,ts,jsx,tsx}", // 👈 All React files
  ],
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
