import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { notify, sendTelegram } from "@/lib/notify";
import { retry } from "@/lib/utils";

// Mock mode for development
const MOCK_MODE = !process.env.STRIPE_SECRET_KEY || 
                  process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key' ||
                  !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                  process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url' ||
                  !process.env.SUPABASE_SERVICE_ROLE_KEY ||
                  process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_supabase_service_role_key' ||
                  process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_new_service_role_key' ||
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_new_anon_key';

const stripe = MOCK_MODE ? null : new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

const supabase = MOCK_MODE ? null : createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  if (MOCK_MODE) {
    // Mock response for development
    console.log(`[MOCK] Stripe webhook received`);

    await notify(`💰 [MOCK] Checkout Completed\n` +
      `👤 mock@user.com\n` +
      `💵 $29.00\n` +
      `📊 Mock subscription activated`);

    return NextResponse.json({ 
      received: true, 
      message: 'Webhook processed successfully (mock mode)',
      mock: true 
    });
  }

  const sig = req.headers.get("stripe-signature") as string;
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe!.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    await notify(`❌ Webhook signature failed\n${message}`);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  try {
    // Idempotency check - prevent double-processing of events
    const id = event.id;
    console.log(`Processing Stripe event ${id} of type ${event.type}`);
    
    const seen = await retry(async () => {
      const result = await supabase!.from("stripe_events").select("id, processed_at").eq("id", id).maybeSingle();
      if (result.error) {
        throw new Error(`Event check failed: ${result.error.message}`);
      }
      return result;
    }, 2, 300);

    if (!seen.data) {
      // Store the event to mark it as processed
      await retry(async () => {
        const result = await supabase!.from("stripe_events").insert({ 
          id, 
          type: event.type, 
          payload: event,
          created_at: new Date().toISOString()
        });
        if (result.error) {
          throw new Error(`Event storage failed: ${result.error.message}`);
        }
        return result;
      }, 2, 300);
      
      console.log(`✅ New Stripe event ${id} stored and ready for processing`);
    } else {
      // Event already processed, return early
      const processedAt = seen.data.processed_at;
      console.log(`⚠️ Duplicate Stripe event ${id} of type ${event.type}, originally processed at ${processedAt}`);
      
      // Send notification for duplicate events (could indicate webhook retry issues)
      await retry(() => notify(
        `🔄 <b>Duplicate Stripe Event</b>\n` +
        `🆔 Event: <code>${id}</code>\n` +
        `📋 Type: <code>${event.type}</code>\n` +
        `⏰ Originally processed: ${processedAt}\n` +
        `💡 This may indicate webhook retries or double-delivery`
      ), 1, 0); // Single attempt for duplicate notifications
      
      return new NextResponse("Event already processed", { status: 200 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const customerId = s.customer as string | null;
        const email =
          s.customer_details?.email || (s.customer_email as string | null) || null;

        if (email) {
          const { error } = await retry(async () => {
            const result = await supabase!.from("users").upsert(
              {
                email,
                stripe_customer_id: customerId ?? undefined,
                subscription_status: "active",
                updated_at: new Date().toISOString(),
              },
              { onConflict: "email" }
            );
            
            if (result.error) {
              throw new Error(`User upsert failed: ${result.error.message}`);
            }
            
            return result;
          }, 3, 500); // 3 retries for database operations
          
          if (error) console.warn("users upsert warning:", error);
        }

        await retry(() => notify(
          `💰 <b>Checkout Completed</b>\n` +
          `👤 ${email ?? "unknown"}\n` +
          `🧾 Customer: <code>${customerId ?? "n/a"}</code>`
        ), 2, 500); // 2 retries for notifications
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const item = sub.items.data[0]?.price;

        const subWithPeriods = sub as Stripe.Subscription & {
          current_period_start: number;
          current_period_end: number;
        };

        await retry(async () => {
          const result = await supabase!.from("subscriptions").upsert({
            stripe_subscription_id: sub.id,
            user_id: sub.customer as string,
            status: sub.status,
            current_period_start: new Date(subWithPeriods.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subWithPeriods.current_period_end * 1000).toISOString(),
            price_id: item?.id,
            updated_at: new Date().toISOString(),
          });
          
          if (result.error) {
            throw new Error(`Subscription upsert failed: ${result.error.message}`);
          }
          
          return result;
        }, 3, 500); // 3 retries for database operations

        await retry(async () => {
          const result = await supabase!
            .from("users")
            .update({
              subscription_status: sub.status === "active" ? "active" : sub.status,
              stripe_customer_id: sub.customer as string,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", sub.customer as string);
            
          if (result.error) {
            throw new Error(`User subscription update failed: ${result.error.message}`);
          }
          
          return result;
        }, 3, 500);

        await retry(() => notify(
          `🚀 <b>Subscription ${event.type.endsWith("created") ? "Started" : "Updated"}</b>\n` +
          `🧾 Sub: <code>${sub.id}</code>\n` +
          `📦 Status: <b>${sub.status}</b>\n` +
          `💵 ${(item?.unit_amount ?? 0) / 100} ${item?.currency?.toUpperCase() || ""}`
        ), 2, 500);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        await retry(async () => {
          const result = await supabase!
            .from("users")
            .update({ subscription_status: "cancelled", updated_at: new Date().toISOString() })
            .eq("stripe_customer_id", sub.customer as string);
            
          if (result.error) {
            throw new Error(`Subscription cancellation update failed: ${result.error.message}`);
          }
          
          return result;
        }, 3, 500);

        await retry(() => notify(
          `🛑 <b>Subscription Cancelled</b>\n🧾 Sub: <code>${sub.id}</code>`
        ), 2, 500);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const email = invoice.customer_email ?? "unknown";
        const amount = (invoice.amount_paid ?? 0) / 100;
        await retry(() => sendTelegram({
          text: `💸 *Payment Succeeded*\nCustomer: ${email}\nAmount: $${amount}`,
          parseMode: "Markdown"
        }), 2, 500);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const email = invoice.customer_email ?? "unknown";
        const amount = (invoice.amount_due ?? 0) / 100;
        const currency = invoice.currency?.toUpperCase() || "";
        const attempt = invoice.attempt_count ?? 0;
        await retry(() => sendTelegram({
          text: `⚠️ *Payment Failed*\nCustomer: ${email}\nAmount: $${amount} ${currency}\nAttempt: ${attempt}`,
          parseMode: "Markdown"
        }), 2, 500);
        break;
      }

      default:
        // quiet, but still log in Vercel
        console.log("Unhandled event:", event.type);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err: unknown) {
    await retry(() => notify(`🔥 <b>Webhook processing error</b>\n<code>${String(err instanceof Error ? err.message : err)}</code>`), 2, 500);
    return new NextResponse("Server error", { status: 500 });
  }
}

export const config = { api: { bodyParser: false } };
