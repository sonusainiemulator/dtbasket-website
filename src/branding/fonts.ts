/**
 * BRANDING — Fonts
 * ─────────────────────────────────────────────────────────────
 * Client-editable font names and CSS variable references.
 *
 * NOTE: Font weights in src/app/layout.tsx must remain hardcoded literals
 * because Next.js font loader requires static values at build time.
 * Update both this file AND layout.tsx if changing fonts.
 */

export const FONTS = {
  /** Body / paragraph font — loaded as --font-nunito CSS variable */
  primary: "Nunito",

  /** Display / heading font — loaded as --font-poppins CSS variable */
  display: "Poppins",

  /** CSS variable references used in inline styles & JS */
  vars: {
    primary: "var(--font-nunito, sans-serif)",
    display: "var(--font-poppins, sans-serif)",
  },
} as const;
