/**
 * Combines a per-request timeout with an optional caller AbortSignal so
 * downstream HTTP calls abort cleanly on either deadline or upstream cancel.
 */
export function combineSignal(
  timeoutMs: number,
  externalSignal?: AbortSignal
): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  return externalSignal
    ? AbortSignal.any([externalSignal, timeoutSignal])
    : timeoutSignal;
}
