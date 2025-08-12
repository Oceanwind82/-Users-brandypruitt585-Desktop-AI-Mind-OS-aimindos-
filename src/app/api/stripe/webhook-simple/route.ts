import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-07-30.basil' });
};

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')
    let event: Stripe.Event

    // Mock mode for development
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key') {
      console.log('💳 MOCK STRIPE WEBHOOK (Simple):', {
        body: body.substring(0, 50) + '...',
        signature: signature?.substring(0, 20) + '...',
        timestamp: new Date().toISOString()
      })

      return NextResponse.json({ 
        received: true,
        status: 'MOCK_WEBHOOK_PROCESSED'
      })
    }

    // Verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log(`💳 Processing ${event.type}:`, subscription.id)

        await supabase.from('subscriptions').upsert({
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          status: subscription.status,
          current_period_start: new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
          current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
          plan_id: subscription.items.data[0].price?.id || '',
          plan_name: 'AI Mind OS Pro',
          amount: subscription.items.data[0].price?.unit_amount || 0,
          currency: subscription.items.data[0].price?.currency || 'usd',
          updated_at: new Date().toISOString()
        })

        await supabase.from('users')
          .update({ 
            subscription_status: subscription.status === 'active' ? 'active' : 'inactive', 
            stripe_customer_id: subscription.customer as string 
          })
          .eq('stripe_customer_id', subscription.customer as string)
        
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('💳 Processing subscription deletion:', subscription.id)

        await supabase.from('users')
          .update({ subscription_status: 'cancelled' })
          .eq('stripe_customer_id', subscription.customer as string)
        
        break
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing failed:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
