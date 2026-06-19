export const COLORS = {
  primary: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    200: "#BBF7D0",
    300: "#86EFAC",
    400: "#4ADE80",
    500: "#22C55E",
    600: "#16A34A",
    700: "#2E7D32",
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
    500: "#F0C832",
    600: "#FFA000",
    DEFAULT: "#F0C832",
  },
  splash: "#F0C832",
  footerBar: "#D4A017",
  footerBg: "#ddcc891f",
  background: "#F8F9FA",
  white: "#FFFFFF",
  black: "#000000",
  red: "#EF4444",
  textPrimary: "#111827",
  textSecondary: "#6B7280",

  /* ── Dark-mode palette (used via Tailwind `dark:bg-dm-*` classes) ── */
  dm: {
    primary: "#399C18",
    secondary: "#ECC750",
    background: "#0D0D0D",
    bg: "#0f1a0f",
    footerBg: "#191711",  // page body
    surface: "#171717",   // cards / panels
    surface2: "#202020",   // slightly raised surfaces, hover states
    border: "#2f2f2f",   // dividers & borders
    text: "#e8f5e8",   // primary text
    muted: "#ffffff",   // secondary / muted text
  },
} as const;
