import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing Supabase environment variables' }), { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Try a simple query to check DB health
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: errorMsg }), { status: 500 });
  }
}
