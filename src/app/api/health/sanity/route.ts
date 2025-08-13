export async function GET() {
  const sanityToken = process.env.SANITY_API_TOKEN;
  const sanityProjectId = process.env.SANITY_PROJECT_ID;
  if (!sanityToken || !sanityProjectId) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing SANITY_API_TOKEN or SANITY_PROJECT_ID' }), { status: 500 });
  }
  try {
    // Try fetching project info as a health check
    const res = await fetch(`https://${sanityProjectId}.api.sanity.io/v2021-06-07/projects/${sanityProjectId}`, {
      headers: { Authorization: `Bearer ${sanityToken}` }
    });
    const data = await res.json();
    if (data && data.id) {
      return new Response(JSON.stringify({ ok: true, projectId: data.id }), { status: 200 });
    }
    return new Response(JSON.stringify({ ok: false, error: 'Sanity API error' }), { status: 500 });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: errorMsg }), { status: 500 });
  }
}
