import type { SubscriptionPlan } from "../../constants/premium";

export async function startPremiumCheckout(
  plan: SubscriptionPlan
): Promise<{ url?: string; error?: string }> {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    return { error: "Cloud database is not configured." };
  }

  const {
    data: { session },
  } = await (await import("../supabase")).requireSupabase().auth.getSession();

  if (!session?.access_token) {
    return { error: "Please sign in to subscribe." };
  }

  const response = await fetch(`${url}/functions/v1/stripe-checkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ plan }),
  });

  const payload = (await response.json()) as { url?: string; error?: string };
  if (!response.ok) {
    return { error: payload.error ?? "Could not start checkout." };
  }
  return { url: payload.url };
}
