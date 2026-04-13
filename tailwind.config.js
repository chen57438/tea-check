/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07111f",
        panel: "#0d1728",
        line: "#1e3354",
        cyan: "#7dd3fc",
        rose: "#fb7185",
        amber: "#fbbf24",
        mint: "#6ee7b7",
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "'PingFang SC'", "'Microsoft YaHei'", "sans-serif"],
        display: ["'Space Grotesk'", "'IBM Plex Sans'", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(125, 211, 252, 0.15), 0 18px 60px rgba(3, 7, 18, 0.55)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(125, 211, 252, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(125, 211, 252, 0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
