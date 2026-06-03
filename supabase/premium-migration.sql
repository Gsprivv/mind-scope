-- Mind Scope Premium — run in Supabase SQL Editor after schema.sql
-- Safe to run more than once.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'premium')),
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT
    CHECK (subscription_plan IS NULL OR subscription_plan IN ('monthly', 'yearly')),
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

CREATE OR REPLACE FUNCTION public.is_premium_active(
  p_tier TEXT,
  p_expires_at TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_tier = 'premium'
    AND p_expires_at IS NOT NULL
    AND p_expires_at > NOW();
$$;

-- Used by Stripe webhook (service role) to activate or extend premium
CREATE OR REPLACE FUNCTION public.set_premium_subscription(
  p_user_id UUID,
  p_plan TEXT,
  p_expires_at TIMESTAMPTZ,
  p_stripe_customer_id TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_plan NOT IN ('monthly', 'yearly') THEN
    RAISE EXCEPTION 'Invalid plan';
  END IF;

  UPDATE public.profiles
  SET
    subscription_tier = 'premium',
    subscription_plan = p_plan,
    subscription_started_at = COALESCE(subscription_started_at, NOW()),
    subscription_expires_at = p_expires_at,
    stripe_customer_id = COALESCE(p_stripe_customer_id, stripe_customer_id)
  WHERE id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_premium_subscription(UUID, TEXT, TIMESTAMPTZ, TEXT) FROM PUBLIC;
