/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A",
        secondary: "#334155",
        success: "#22C55E",
        warning: "#FACC15",
        danger: "#EF4444",
        background: "#F8FAFC",
      },
    },
  },
  plugins: [],
}