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
        background: "#f7f5f0",
        foreground: "#171713",
        primary: {
          DEFAULT: "#171713",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#d05732",
          foreground: "#ffffff",
        },
        surface: "#ffffff",
        border: "#e3ded4",
        muted: "#77746c",
        error: "#a0341f",
        "error-bg": "#fff1ee",
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
    },
  },
  plugins: [],
};
export default config;
