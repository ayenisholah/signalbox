/**
 * The Frox scale, resolved to semantic tokens. Raw values stay here, so components can't reach them.
 * Design source: https://www.figma.com/design/jWHhIpI52m6ABnQpcTzZkG/Frox_dashboard_v5?node-id=1169-12005
 * Where a Frox pairing fails AA, the token holds an adjusted value. ADR 0010 says AA wins.
 */
const light = {
  canvas: "#f5f5fa",
  surface: "#ffffff",
  "surface-sunken": "#f5f5fa",
  fg: "#16161e",
  "fg-muted": "#636373",
  "fg-subtle": "#7e7e8f",
  line: "#e2e2ea",
  brand: "#7364db",
  "on-brand": "#ffffff",
  "brand-fg": "#5b4cc6",
  "brand-soft": "#eeecfb",
  danger: "#b8292b",
  "danger-soft": "#fde8e8",
  success: "#0f7a5f",
  "success-soft": "#e3f7f1",
  warning: "#9c4a14",
  "warning-soft": "#fdefe6",
  info: "#1d5fd6",
  "info-soft": "#e7efff",
  "focus-ring": "#7364db",
};

export type SemanticToken = keyof typeof light;
export type Theme = Record<SemanticToken, string>;

const dark: Theme = {
  canvas: "#1f2128",
  surface: "#282a33",
  "surface-sunken": "#1e1e24",
  fg: "#eaeaf4",
  "fg-muted": "#a9a9b7",
  "fg-subtle": "#8b8b93",
  line: "#363844",
  brand: "#7364db",
  "on-brand": "#ffffff",
  "brand-fg": "#b2a7ff",
  "brand-soft": "#2f2a52",
  danger: "#ff8a8a",
  "danger-soft": "#3d2024",
  success: "#6ee0c4",
  "success-soft": "#1c3631",
  warning: "#f4ad85",
  "warning-soft": "#3d2a20",
  info: "#8cb3ff",
  "info-soft": "#1e2a45",
  "focus-ring": "#b2a7ff",
};

export const themes = { light, dark };
export type ThemeName = keyof typeof themes;

/** Frox sizes in design pixels, written out as rem by the generator. */
export const typeScale = {
  h1: { size: 40, line: 60, weight: 700 },
  h2: { size: 32, line: 39, weight: 800 },
  h4: { size: 28, line: 34, weight: 600 },
  h5: { size: 24, line: 30, weight: 700 },
  // Frox has a line height of 18 here, which clips the text.
  h6: { size: 20, line: 24, weight: 600 },
  h7: { size: 18, line: 22, weight: 700 },
  subtitle: { size: 16, line: 20, weight: 600 },
  // Frox has a line height of 16 here, which is too tight for reading.
  body: { size: 14, line: 20, weight: 400 },
  caption: { size: 12, line: 16, weight: 400 },
};

export const radii = { sm: 8, md: 12, lg: 16 };
