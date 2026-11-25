import type { z } from "zod";

/**
 * Safely reads a plain string value from browser localStorage.
 */
export function readStorageString(key: string): string | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
  } catch {
    // Storage access may be blocked in restricted browser contexts
    return null;
  }
}

/**
 * Safely writes a plain string value to browser localStorage.
 */
export function writeStorageString(key: string, value: string): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage quota or private-browsing write errors
  }
}

/**
 * Reads, JSON-parses, and Zod-validates an array payload from localStorage.
 */
export function readStorageValidatedList<T>(
  key: string,
  itemSchema: z.ZodType<T>
): T[] {
  const raw = readStorageString(key);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => {
      const checked = itemSchema.safeParse(entry);
      return checked.success ? [checked.data] : [];
    });
  } catch {
    // Discard corrupted storage payloads safely
    return [];
  }
}
