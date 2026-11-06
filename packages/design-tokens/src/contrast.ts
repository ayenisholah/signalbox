import type { SemanticToken } from "./themes.ts";

export interface ContrastPair {
  foreground: SemanticToken;
  background: SemanticToken;
  minimum: number;
}

const TEXT = 4.5;
const NON_TEXT = 3;

const pairs = (
  foreground: SemanticToken,
  backgrounds: SemanticToken[],
  minimum = TEXT,
): ContrastPair[] => backgrounds.map((background) => ({ foreground, background, minimum }));

const surfaces: SemanticToken[] = ["canvas", "surface", "surface-sunken"];

export const contrastPairs: ContrastPair[] = [
  ...pairs("fg", surfaces),
  ...pairs("fg-muted", surfaces),
  ...pairs("fg-subtle", surfaces, NON_TEXT),
  ...pairs("brand", surfaces, NON_TEXT),
  ...pairs("focus-ring", surfaces, NON_TEXT),
  ...pairs("on-brand", ["brand"]),
  ...pairs("brand-fg", ["surface", "brand-soft"]),
  ...pairs("danger", ["surface", "danger-soft"]),
  ...pairs("success", ["surface", "success-soft"]),
  ...pairs("warning", ["surface", "warning-soft"]),
  ...pairs("info", ["surface", "info-soft"]),
];

const channel = (hex: string, start: number): number => {
  const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string): number =>
  0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);

/** The WCAG 2.2 contrast ratio of two `#rrggbb` colours. */
export const contrastRatio = (first: string, second: string): number => {
  const [darker, lighter] = [luminance(first), luminance(second)].sort((a, b) => a - b) as [
    number,
    number,
  ];
  return (lighter + 0.05) / (darker + 0.05);
};
