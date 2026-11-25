/**
 * Creates a strictly typed `fetch` test double without `as unknown as` type assertions.
 */
export function createMockFetch(
  handler: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
): typeof fetch {
  return Object.assign(
    (input: RequestInfo | URL, init?: RequestInit) => handler(input, init),
    {
      preconnect: () => {},
    }
  );
}
