import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Type for Stripe subscription with period info
interface StripeSubscriptionWithPeriod extends Stripe.Subscription {
  current_period_start: number
  current_period_end: number
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-07-30.basil' })

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')
    let event: Stripe.Event

    // Mock mode for development
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key') {
      console.log('💳 MOCK STRIPE WEBHOOK:', {
        body: body.substring(0, 100) + '...',
        signature: signature?.substring(0, 20) + '...',
        timestamp: new Date().toISOString()
      })

      // Mock webhook event processing
      const mockEvent = {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_mock_' + Date.now(),
            customer: 'cus_mock_customer',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
            items: {
              data: [{
                price: {
                  id: 'price_mock_pro',
                  unit_amount: 2900, // $29.00
                  currency: 'usd'
                }
              }]
            }
          }
        }
      }

      console.log('💳 MOCK SUBSCRIPTION EVENT:', mockEvent)

      return NextResponse.json({ 
        received: true, 
        status: 'MOCK_WEBHOOK_PROCESSED',
        event_type: mockEvent.type
      })
    }

    // Production mode - verify Stripe webhook
    try {
      event = stripe.webhooks.constructEvent(
        body, 
        signature!, 
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Process webhook events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as StripeSubscriptionWithPeriod
        
        console.log(`💳 Processing ${event.type}:`, subscription.id)

        // Update subscriptions table
        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert({
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            plan_id: subscription.items.data[0].price?.id || '',
            plan_name: 'AI Mind OS Pro',
            amount: subscription.items.data[0].price?.unit_amount || 0,
            currency: subscription.items.data[0].price?.currency || 'usd',
            updated_at: new Date().toISOString()
          })

        if (subError) {
          console.error('Subscription upsert error:', subError)
          throw subError
        }

        // Update user subscription status
        const { error: userError } = await supabase
          .from('users')
          .update({ 
            subscription_status: subscription.status === 'active' ? 'active' : 'inactive',
            stripe_customer_id: subscription.customer as string,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', subscription.customer as string)

        if (userError) {
          console.error('User update error:', userError)
          throw userError
        }

        console.log(`✅ Subscription ${subscription.id} processed successfully`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as StripeSubscriptionWithPeriod
        
        console.log('💳 Processing subscription deletion:', subscription.id)

        // Update user to cancelled status
        const { error } = await supabase
          .from('users')
          .update({ 
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', subscription.customer as string)

        if (error) {
          console.error('User cancellation update error:', error)
          throw error
        }

        console.log(`✅ Subscription ${subscription.id} cancelled successfully`)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        console.log('💳 Processing successful payment:', invoice.id)

        // Could trigger analytics event or send notification
        // await trackAnalyticsEvent('payment_succeeded', invoice.customer as string)
        
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        console.log('💳 Processing failed payment:', invoice.id)

        // Could trigger alerts or retry logic
        // await handlePaymentFailure(invoice.customer as string)
        
        break
      }

      default:
        console.log(`💳 Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Stripe webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
