import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#f5f5f5",
        primary: {
          DEFAULT: "#d4af37",
          foreground: "#0a0a0a",
        },
        accent: {
          DEFAULT: "#f3e5ab",
          foreground: "#0a0a0a",
        },
        surface: "#141414",
        border: "#2a2a2a",
        muted: "#888888",
        error: "#ef4444",
        "error-bg": "#3f1616",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "Helvetica", "sans-serif"],
        serif: ["var(--font-georgia)", "Georgia", "serif"],
      },
      borderRadius: {
        lg: "24px",
        md: "16px",
        sm: "10px",
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        }
      },
      animation: {
        shake: 'shake 0.5s ease-in-out',
      }
    },
  },
  plugins: [],
};
export default config;
