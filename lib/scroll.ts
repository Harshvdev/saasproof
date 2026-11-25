/**
 * Smooth-scrolling helpers that honor the user's `prefers-reduced-motion` setting.
 */

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scrolls the viewport to the top while respecting reduced-motion preferences.
 */
export function scrollToTop(): void {
  if (typeof window === "undefined") return;
  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

/**
 * Scrolls an element into view while respecting reduced-motion preferences.
 *
 * @param element - Target DOM element to scroll into view.
 * @param options - Alignment options (`block`, `inline`).
 */
export function scrollElementIntoView(
  element: Element | null | undefined,
  options: { block?: ScrollLogicalPosition; inline?: ScrollLogicalPosition } = {}
): void {
  if (!element) return;
  element.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: options.block ?? "nearest",
    inline: options.inline ?? "nearest",
  });
}
