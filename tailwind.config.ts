import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF8F3",
          100: "#FEEDDF",
          200: "#FDCFB3",
          300: "#FBAB82",
          400: "#F58245",
          500: "#E85D04", // Primary: #E85D04 (Vibrant Orange)
          600: "#D04B00",
          700: "#AA3900",
          800: "#872E03",
          900: "#6E2606",
        },
        sage: {
          50: "#F2F7F5",
          100: "#DEECE8",
          200: "#BFD9D2",
          300: "#98C0B6",
          400: "#6DA497",
          500: "#40796C", // Secondary/Accent: #40796C (Deep Sage Green)
          600: "#326156",
          700: "#284E45",
          800: "#203F38",
          900: "#19312B",
        },
        accent: {
          50: "#F2F7F5",
          100: "#DEECE8",
          200: "#BFD9D2",
          300: "#98C0B6",
          400: "#6DA497",
          500: "#40796C", // Secondary/Accent: #40796C
          600: "#326156",
          700: "#284E45",
          800: "#203F38",
          900: "#19312B",
        },
        ivory: {
          DEFAULT: "#F4F1DE", // Background: #F4F1DE (Ivory / Putih Tulang)
          50: "#FDFDF9",
          100: "#FAF8EE",
          200: "#F4F1DE",
          300: "#EAE5C7",
          400: "#DFD8AF",
          500: "#D4CB97",
        },
        espresso: {
          DEFAULT: "#2B1E16", // Text & Sidebar: #2B1E16 (Deep Espresso)
          50: "#F6F3F1",
          100: "#E8E2DE",
          200: "#D1C3BC",
          300: "#B49E93",
          400: "#8F7466",
          500: "#6B5345",
          600: "#543F33",
          700: "#423026",
          800: "#33241C",
          900: "#2B1E16",
          950: "#1D140E",
        },
        warm: {
          50: "#FFF8F3",
          100: "#FEEDDF",
          200: "#FDCFB3",
          300: "#FBAB82",
          400: "#F58245",
          500: "#E85D04",
          600: "#D04B00",
          700: "#AA3900",
          800: "#872E03",
          900: "#6E2606",
        },
        surface: {
          cream: "#F4F1DE",
          card: "#FFFFFF",
          muted: "#EDE9D5",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Inter'", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(43, 30, 22, 0.04)',
        'subtle': '0 4px 20px -2px rgba(43, 30, 22, 0.06), 0 2px 6px -1px rgba(43, 30, 22, 0.03)',
        'premium': '0 10px 30px -5px rgba(232, 93, 4, 0.12), 0 4px 8px -2px rgba(43, 30, 22, 0.05)',
        'card': '0 2px 12px -2px rgba(43, 30, 22, 0.06), 0 1px 3px 0 rgba(43, 30, 22, 0.04)',
        'card-hover': '0 12px 28px -4px rgba(43, 30, 22, 0.1), 0 4px 10px -2px rgba(43, 30, 22, 0.04)',
        'brand': '0 8px 24px -4px rgba(232, 93, 4, 0.35)',
        'sage': '0 8px 24px -4px rgba(64, 121, 108, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
