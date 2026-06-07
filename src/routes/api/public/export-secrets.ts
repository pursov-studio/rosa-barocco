import { createFileRoute } from "@tanstack/react-router";

// TEMPORARY one-time endpoint to export server env vars to VPS deployment.
// DELETE this file immediately after use.
const TOKEN = "84e1337f91381bf404068d20ba3d1bd36c66d9126eb6a911ecb38cf1314a6f9f";

export const Route = createFileRoute("/api/public/export-secrets")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        if (!token || token !== TOKEN) {
          return new Response("Unauthorized", { status: 401 });
        }
        return Response.json({
          SUPABASE_URL: process.env.SUPABASE_URL ?? null,
          SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY ?? null,
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? null,
          SUPABASE_DB_URL: process.env.SUPABASE_DB_URL ?? null,
        });
      },
    },
  },
});
