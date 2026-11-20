import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("Accessibility Suite: Theme Contrast & Design Token Contracts", () => {
  const cssPath = resolve(__dirname, "../../app/globals.css");
  const cssContent = readFileSync(cssPath, "utf-8");

  test("defines high-contrast canvas, surface, and text tokens for light mode", () => {
    expect(cssContent).toContain("--bg-canvas: #faf9f6;");
    expect(cssContent).toContain("--bg-surface: #ffffff;");
    expect(cssContent).toContain("--text-primary: #141311;");
    expect(cssContent).toContain("--text-secondary: #524e48;");
    expect(cssContent).toContain("--orange-600: #ea580c;");
  });

  test("defines high-contrast canvas, surface, and text tokens for dark mode", () => {
    expect(cssContent).toContain('[data-theme="dark"]');
    expect(cssContent).toContain("--bg-canvas: #0d0c0b;");
    expect(cssContent).toContain("--bg-surface: #151412;");
    expect(cssContent).toContain("--text-primary: #f5f4f0;");
    expect(cssContent).toContain("--text-secondary: #b5afa6;");
  });

  test("defines WCAG compliant keyboard navigation focus styles", () => {
    expect(cssContent).toContain(":focus-visible");
    expect(cssContent).toContain("outline:");
    expect(cssContent).toContain("outline-offset:");
  });

  test("defines visible focus indicators for all interactive elements", () => {
    expect(cssContent).toContain(":focus-visible");
    expect(cssContent).toContain("outline: 2px solid var(--border-focus);");
  });
});
