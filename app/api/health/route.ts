/**
 * GET /api/health
 * Lightweight readiness and liveness probe returning service status without exposing internals.
 *
 * @returns JSON healthcheck response with `Cache-Control: no-store`.
 */
export async function GET() {
  return Response.json(
    {
      status: "ok",
      service: "saasproof",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
