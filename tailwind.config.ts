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
        background: "#F8F9FC",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#315CF5",
          hover: "#2449D8",
          subtle: "#EEF2FF",
        },
        navy: {
          900: "#111827",
          800: "#172033",
          700: "#1E293B",
          600: "#334155",
          500: "#475569",
        },
        muted: {
          DEFAULT: "#64748B",
          light: "#94A3B8",
          border: "#E2E8F0",
        },
        status: {
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          info: "#0EA5E9",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        lifted: "0 10px 25px -5px rgba(23, 32, 51, 0.08), 0 8px 10px -6px rgba(23, 32, 51, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
