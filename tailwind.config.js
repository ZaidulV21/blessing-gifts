/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["'Jost'", "sans-serif"],
      },
      colors: {
        gold: {
          DEFAULT: "#B8912A",
          light: "#D4A843",
          pale: "#F5EDD6",
          xpale: "#FBF7EE",
          dark: "#8B6914",
        },
        cream: {
          DEFAULT: "#FDFBF8",
          2: "#F7F3EC",
          3: "#EDE7DB",
        },
        ink: {
          DEFAULT: "#111010",
          soft: "#2A2520",
          muted: "#6B6057",
          faint: "#9A9088",
        },
        border: {
          DEFAULT: "#E8E0D0",
          soft: "#F0EAE0",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "scroll-pulse": "scrollPulse 2s infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: "translateY(24px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        scrollPulse: {
          "0%,100%": { opacity: 0.3 },
          "50%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
