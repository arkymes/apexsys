import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Main dark backgrounds - Solo Leveling style
        shadow: {
          900: "#061422",
          800: "#0a1929",
          700: "#0c2d48",
          600: "#1a3a5c",
          500: "#1a4a6e",
        },
        // Neon blue accent (primary)
        neon: {
          blue: "#00d4ff",
          cyan: "#00f5ff",
          glow: "#4da6ff",
        },
        // Panel backgrounds
        panel: {
          dark: "rgba(10, 25, 45, 0.9)",
          medium: "rgba(20, 50, 80, 0.8)",
          light: "rgba(30, 70, 110, 0.7)",
        },
        // Rank colors
        rank: {
          e: "#9ca3af",
          d: "#22c55e",
          c: "#eab308",
          b: "#f97316",
          a: "#ef4444",
          s: "#bf00ff",
        },
        // Stat colors
        stat: {
          strength: "#ef4444",
          agility: "#22c55e",
          endurance: "#eab308",
          vitality: "#3b82f6",
        },
        // Accent colors
        gold: "#ffd700",
        "warning-red": "#ff3333",
        "success-green": "#00ff88",
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        body: ["Rajdhani", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "scan-line": "scan-line 8s linear infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "spin-slow": "spin 20s linear infinite",
        "particle": "particle 15s linear infinite",
        "border-glow": "border-glow 3s ease-in-out infinite",
        "text-shimmer": "text-shimmer 3s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        "typing": "typing 2s steps(20) forwards",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.2)",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "particle": {
          "0%": { transform: "translateY(100vh) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(-100vh) rotate(720deg)", opacity: "0" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(0, 212, 255, 0.3)" },
          "50%": { borderColor: "rgba(0, 212, 255, 0.8)" },
        },
        "text-shimmer": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
        "typing": {
          "0%": { width: "0" },
          "100%": { width: "100%" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cyber-grid": "linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        "cyber-grid": "50px 50px",
      },
    },
  },
  plugins: [],
} satisfies Config;
