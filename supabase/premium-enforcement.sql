-- Mind Scope — enforce premium at database level (run after premium-migration.sql)
-- Free users can only read their latest check-in; premium/staff see all.

CREATE OR REPLACE FUNCTION public.is_profile_premium(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = p_user_id
      AND (
        p.is_staff = true
        OR (
          p.subscription_tier = 'premium'
          AND p.subscription_expires_at IS NOT NULL
          AND p.subscription_expires_at > NOW()
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.get_my_premium_status()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_profile_premium(auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.get_my_premium_status() TO authenticated;

-- Align is_premium_active with client (premium requires valid expiry)
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

-- Reset accounts that are marked premium without a valid subscription
UPDATE public.profiles
SET
  subscription_tier = 'free',
  subscription_plan = NULL,
  subscription_started_at = NULL,
  subscription_expires_at = NULL
WHERE is_staff = false
  AND NOT (
    subscription_tier = 'premium'
    AND subscription_expires_at IS NOT NULL
    AND subscription_expires_at > NOW()
  );

-- Free users: own check-ins only, latest row unless premium/staff
DROP POLICY IF EXISTS "check_ins_select_own" ON public.check_ins;
CREATE POLICY "check_ins_select_own"
  ON public.check_ins FOR SELECT
  USING (
    auth.uid() = user_id
    AND (
      public.is_profile_premium(auth.uid())
      OR id = (
        SELECT c.id
        FROM public.check_ins c
        WHERE c.user_id = auth.uid()
        ORDER BY c.completed_at DESC
        LIMIT 1
      )
    )
  );

-- New sign-ups always start on free tier
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    date_of_birth,
    telephone,
    city,
    postcode,
    is_staff,
    subscription_tier
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    LOWER(COALESCE(NEW.email, '')),
    COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::date, '2000-01-01'::date),
    COALESCE(NEW.raw_user_meta_data->>'telephone', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'postcode', ''),
    COALESCE((NEW.raw_user_meta_data->>'is_staff')::boolean, false),
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
