import Stripe from 'stripe';

export async function GET() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing STRIPE_SECRET_KEY' }), { status: 500 });
  }
  try {
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-07-30.basil' });
    // Try fetching account info as a health check
    const account = await stripe.accounts.retrieve();
    return new Response(JSON.stringify({ ok: true, accountId: account.id }), { status: 200 });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: errorMsg }), { status: 500 });
  }
}
