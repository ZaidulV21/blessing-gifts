/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B1F3A",
        "navy-2": "#1A2F5B",
        gold: "#D4AF37",
        "gold-soft": "#E6C76A",
        orange: "#FF6B00",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "Inter", "sans-serif"],
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["'Jost'", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 60px rgba(212, 175, 55, 0.35)",
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #D4AF37 0%, #E6C76A 100%)",
        "gradient-mesh":
          "radial-gradient(at 27% 37%, rgba(212,175,55,0.18) 0, transparent 50%), radial-gradient(at 97% 21%, rgba(255,107,0,0.18) 0, transparent 50%), radial-gradient(at 52% 99%, rgba(255,77,141,0.18) 0, transparent 50%), radial-gradient(at 10% 90%, rgba(26,47,91,0.4) 0, transparent 50%)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "scroll-pulse": "scrollPulse 2s infinite",
        signal: "signal 3s ease-out infinite",
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
        signal: {
          "0%": { transform: "scale(0.3)", opacity: "1" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
