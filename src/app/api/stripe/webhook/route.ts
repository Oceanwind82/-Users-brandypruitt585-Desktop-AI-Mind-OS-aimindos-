import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-07-30.basil",
  });

  const sig = req.headers.get("stripe-signature") as string;
  const buf = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    console.error(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return new NextResponse(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`, { status: 400 });
  }

  // Handle events
  switch (event.type) {
    case "checkout.session.completed":
      console.log("� Payment successful!", event.data.object);
      break;
    case "customer.subscription.created":
      console.log("🆕 New subscription started", event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new NextResponse("Received", { status: 200 });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
