import type { Config } from "tailwindcss";
import { COLORS } from "./src/branding/colors";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dm: COLORS.dm,
        primary: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#2E7D32",   // main brand green
          800: "#166534",
          900: "#14532D",
          DEFAULT: "#2E7D32",
        },
        secondary: {
          50: "#FFF8E1",
          100: "#FFECB3",
          200: "#FFE082",
          300: "#FFD54F",
          400: "#FFCA28",
          500: "#F0C832",   // splash yellow
          600: "#FFA000",
          DEFAULT: "#F0C832",
        },
        splash: "#F0C832",
        footerBar: "#D4A017",
        footerBg: "#F5F0E8",
      },
      fontFamily: {
        sans: ["Nunito", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.1)",
        nav: "0 2px 8px rgba(0,0,0,0.08)",
      },
      borderRadius: { xl: "0.75rem", "2xl": "1rem" },
    },
  },
  plugins: [],
};

export default config;
