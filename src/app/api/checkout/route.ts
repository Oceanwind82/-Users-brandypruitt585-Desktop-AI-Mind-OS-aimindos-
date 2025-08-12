import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

interface PlanConfig {
  priceId: string;
  name: string;
  features: string[];
}

const plans: Record<string, PlanConfig> = {
  thinker: {
    priceId: process.env.STRIPE_THINKER_PRICE_ID!,
    name: 'Thinker',
    features: ['Unlimited AI workbench access', 'Advanced analytics', 'Email support']
  },
  dangerous: {
    priceId: process.env.STRIPE_DANGEROUS_PRICE_ID!,
    name: 'Dangerous Thinker',
    features: ['Everything in Thinker', 'Team collaboration', 'Priority support']
  },
  master: {
    priceId: process.env.STRIPE_MASTER_PRICE_ID!,
    name: 'Mind Master',
    features: ['Everything in Dangerous Thinker', 'White-label access', 'API access']
  }
};

export async function POST(request: NextRequest) {
  try {
    const { planId, email, name } = await request.json();

    if (!planId || !plans[planId]) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const plan = plans[planId];
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email || '')}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      customer_email: email,
      metadata: {
        planId,
        planName: plan.name,
        userEmail: email || '',
        userName: name || '',
      },
      subscription_data: {
        metadata: {
          planId,
          planName: plan.name,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_creation: 'always',
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
