import { createHash } from "crypto";
import type { AnalysisInput, StartupReport } from "./types";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_ENTRIES = 120;

class MemoryCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private hits = 0;
  private misses = 0;

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses += 1;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses += 1;
      return null;
    }

    this.hits += 1;
    // Re-insert to keep LRU order
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T, ttlMs = DEFAULT_TTL_MS): void {
    if (this.store.size >= MAX_ENTRIES) {
      // Evict oldest entry (first key in map iterator)
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  stats(): { size: number; hits: number; misses: number } {
    return {
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
    };
  }
}

const analysisCache = new MemoryCache<StartupReport>();
const copilotCache = new MemoryCache<string>();

export function hashAnalysisInput(input: AnalysisInput): string {
  const normalized = [
    input.idea.trim().toLowerCase(),
    (input.region || "India").trim().toLowerCase(),
    (input.businessModel || "Auto-detect").trim().toLowerCase(),
    input.enableDeepScrape ? "1" : "0",
  ].join("|");

  return createHash("sha256").update(normalized).digest("hex");
}

export function getCachedAnalysis(key: string): StartupReport | null {
  return analysisCache.get(key);
}

export function setCachedAnalysis(key: string, report: StartupReport): void {
  analysisCache.set(key, report);
}

export function hashCopilotQuestion(reportId: string, question: string): string {
  const normalized = `${reportId.trim()}:${question.trim().toLowerCase()}`;
  return createHash("sha256").update(normalized).digest("hex");
}

export function getCachedCopilot(reportId: string, question: string): string | null {
  return copilotCache.get(hashCopilotQuestion(reportId, question));
}

export function setCachedCopilot(
  reportId: string,
  question: string,
  answer: string
): void {
  copilotCache.set(hashCopilotQuestion(reportId, question), answer);
}

export function getCacheStats() {
  return {
    analysis: analysisCache.stats(),
    copilot: copilotCache.stats(),
  };
}

export function clearAllCaches(): void {
  analysisCache.clear();
  copilotCache.clear();
}
