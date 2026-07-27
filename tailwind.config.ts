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
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
          muted: "var(--color-primary-muted)",
          foreground: "var(--color-primary-foreground)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          elevated: "var(--color-surface-elevated)",
          secondary: "var(--color-surface-secondary)",
          glass: "var(--color-surface-glass)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          focus: "var(--color-border-focus)",
        },
        muted: "var(--color-muted)",
        error: {
          DEFAULT: "var(--color-error)",
          bg: "var(--color-error-bg)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        disabled: {
          DEFAULT: "var(--color-disabled)",
          text: "var(--color-disabled-text)",
        },
        overlay: "var(--color-overlay)",
        skeleton: "var(--color-skeleton)",
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
