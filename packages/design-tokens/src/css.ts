import { radii, themes, typeScale, type Theme, type ThemeName } from "./themes.ts";

const rem = (pixels: number): string => `${pixels / 16}rem`;

const lines = (items: string[]): string => items.map((item) => `  ${item}`).join("\n");

const colours = Object.keys(themes.light).map((token) => `--color-${token}: var(--${token});`);

const type = Object.entries(typeScale).flatMap(([name, { size, line, weight }]) => [
  `--text-${name}: ${rem(size)};`,
  `--text-${name}--line-height: ${rem(line)};`,
  `--text-${name}--font-weight: ${weight};`,
]);

const radius = Object.entries(radii).map(([name, pixels]) => `--radius-${name}: ${rem(pixels)};`);

const declarations = (name: ThemeName, theme: Theme): string[] => [
  `color-scheme: ${name};`,
  ...Object.entries(theme).map(([token, value]) => `--${token}: ${value};`),
];

const indent = (block: string): string => block.replaceAll(/^/gm, "  ");

export const renderTokensCss =
  (): string => `/* Generated from packages/design-tokens. Run npm run generate:tokens. */
@theme inline {
${lines(["--color-*: initial;", "--text-*: initial;", "--radius-*: initial;"])}
  --font-sans: "Poppins", ui-sans-serif, system-ui, sans-serif;
  --radius-pill: 999rem;
${lines([...colours, ...type, ...radius])}
}

:root {
${lines(declarations("light", themes.light))}
}

@media (prefers-color-scheme: dark) {
  :root {
${indent(lines(declarations("dark", themes.dark)))}
  }
}
`;
