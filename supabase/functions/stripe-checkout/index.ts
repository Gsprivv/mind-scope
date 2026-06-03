import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not signed in." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { plan } = await req.json();
    if (plan !== "monthly" && plan !== "yearly") {
      return new Response(JSON.stringify({ error: "Invalid plan." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const priceMonthly = Deno.env.get("STRIPE_PRICE_MONTHLY");
    const priceYearly = Deno.env.get("STRIPE_PRICE_YEARLY");
    const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";

    if (!stripeKey || !priceMonthly || !priceYearly) {
      return new Response(
        JSON.stringify({
          error:
            "Payments are not configured yet. Add STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY, and STRIPE_PRICE_YEARLY to Supabase Edge Function secrets.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Not signed in." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const priceId = plan === "monthly" ? priceMonthly : priceYearly;

    const params = new URLSearchParams({
      mode: "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      success_url: `${siteUrl}/premium?success=1`,
      cancel_url: `${siteUrl}/premium?cancelled=1`,
      client_reference_id: user.id,
      "metadata[user_id]": user.id,
      "metadata[plan]": plan,
      "subscription_data[metadata][user_id]": user.id,
      "subscription_data[metadata][plan]": plan,
    });

    if (user.email) {
      params.set("customer_email", user.email);
    }

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) {
      return new Response(
        JSON.stringify({ error: session.error?.message ?? "Stripe error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unexpected error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
