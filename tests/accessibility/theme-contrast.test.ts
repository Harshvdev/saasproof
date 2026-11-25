import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.03928
      ? srgb / 12.92
      : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fgHex: string, bgHex: string): number {
  const l1 = relativeLuminance(fgHex);
  const l2 = relativeLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function extractCssVar(block: string, varName: string): string {
  const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = block.match(new RegExp(`${escaped}:\\s*(#[0-9a-fA-F]{3,6})\\s*;`));
  if (!match?.[1]) {
    throw new Error(`Missing CSS hex token ${varName}`);
  }
  return match[1];
}

describe("Accessibility Suite: Theme Contrast & Design Token Contracts", () => {
  const cssPath = resolve(__dirname, "../../app/globals.css");
  const cssContent = readFileSync(cssPath, "utf-8");

  const lightBlock = cssContent.slice(
    cssContent.indexOf(":root"),
    cssContent.indexOf('[data-theme="dark"]')
  );
  const darkBlock = cssContent.slice(
    cssContent.indexOf('[data-theme="dark"]'),
    cssContent.indexOf("@media (prefers-reduced-motion: no-preference)")
  );

  test("defines high-contrast canvas, surface, and text tokens for light mode", () => {
    expect(cssContent).toContain("--bg-canvas: #faf9f6;");
    expect(cssContent).toContain("--bg-surface: #ffffff;");
    expect(cssContent).toContain("--text-primary: #141311;");
    expect(cssContent).toContain("--text-secondary: #524e48;");
    expect(cssContent).toContain("--orange-600: #ea580c;");
    expect(cssContent).toContain("--orange-700: #c2410c;");
  });

  test("defines high-contrast canvas, surface, and text tokens for dark mode", () => {
    expect(cssContent).toContain('[data-theme="dark"]');
    expect(cssContent).toContain("--bg-canvas: #0d0c0b;");
    expect(cssContent).toContain("--bg-surface: #151412;");
    expect(cssContent).toContain("--text-primary: #f5f4f0;");
    expect(cssContent).toContain("--text-secondary: #b5afa6;");
  });

  test("meets WCAG 2.1 AA (>= 4.5:1) contrast across light and dark text/surface tokens", () => {
    const lightSurfaces = [
      extractCssVar(lightBlock, "--bg-canvas"),
      extractCssVar(lightBlock, "--bg-surface"),
      extractCssVar(lightBlock, "--bg-subtle"),
    ];
    const lightTextTokens = [
      extractCssVar(lightBlock, "--text-primary"),
      extractCssVar(lightBlock, "--text-secondary"),
      extractCssVar(lightBlock, "--text-muted"),
      extractCssVar(lightBlock, "--orange-700"),
      extractCssVar(lightBlock, "--emerald-text"),
      extractCssVar(lightBlock, "--amber-text"),
      extractCssVar(lightBlock, "--rose-text"),
      extractCssVar(lightBlock, "--blue-text"),
    ];

    for (const bg of lightSurfaces) {
      for (const fg of lightTextTokens) {
        expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
      }
    }

    const darkSurfaces = [
      extractCssVar(darkBlock, "--bg-canvas"),
      extractCssVar(darkBlock, "--bg-surface"),
      extractCssVar(darkBlock, "--bg-subtle"),
    ];
    const darkTextTokens = [
      extractCssVar(darkBlock, "--text-primary"),
      extractCssVar(darkBlock, "--text-secondary"),
      extractCssVar(darkBlock, "--text-muted"),
      extractCssVar(darkBlock, "--orange-700"),
      extractCssVar(darkBlock, "--emerald-text"),
      extractCssVar(darkBlock, "--amber-text"),
      extractCssVar(darkBlock, "--rose-text"),
      extractCssVar(darkBlock, "--blue-text"),
    ];

    for (const bg of darkSurfaces) {
      for (const fg of darkTextTokens) {
        expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
      }
    }

    // Primary button white-on-orange contrast
    expect(contrastRatio("#ffffff", "#c2410c")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#ffffff", "#9a3412")).toBeGreaterThanOrEqual(4.5);
  });

  test("defines WCAG compliant keyboard navigation focus, switch track, and reduced motion rules", () => {
    expect(cssContent).toContain(":focus-visible");
    expect(cssContent).toContain("outline: 2px solid var(--border-focus);");
    expect(cssContent).toContain(".skip-to-content");
    expect(cssContent).toContain(".skip-to-content:focus");
    expect(cssContent).toContain(".switch-track");
    expect(cssContent).toContain(".checklist-item:has(input:focus-visible)");
    expect(cssContent).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
