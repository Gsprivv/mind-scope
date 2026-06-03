import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });

Deno.serve(async (req) => {
  if (!stripeKey || !webhookSecret) {
    return new Response("Webhook not configured", { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  async function activatePremium(
    userId: string,
    plan: string,
    customerId: string | null
  ) {
    const safePlan = plan === "yearly" ? "yearly" : "monthly";
    const expires = new Date();
    if (safePlan === "yearly") {
      expires.setFullYear(expires.getFullYear() + 1);
    } else {
      expires.setMonth(expires.getMonth() + 1);
    }

    await admin.rpc("set_premium_subscription", {
      p_user_id: userId,
      p_plan: safePlan,
      p_expires_at: expires.toISOString(),
      p_stripe_customer_id: customerId,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId =
      session.metadata?.user_id ?? session.client_reference_id ?? null;
    const plan = session.metadata?.plan ?? "monthly";
    if (userId) {
      await activatePremium(
        userId,
        plan,
        typeof session.customer === "string" ? session.customer : null
      );
    }
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const userId = invoice.metadata?.user_id ?? null;
    const plan = invoice.metadata?.plan ?? "monthly";
    if (userId) {
      await activatePremium(
        userId,
        plan,
        typeof invoice.customer === "string" ? invoice.customer : null
      );
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
