-- Mind Scope — run this in Supabase SQL Editor (Dashboard → SQL → New query)
-- Safe to run more than once (drops policies before recreating them).

-- Profiles (one row per signed-up user)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  date_of_birth DATE NOT NULL,
  telephone TEXT NOT NULL,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
  status_changed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_staff BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'premium')),
  subscription_plan TEXT
    CHECK (subscription_plan IS NULL OR subscription_plan IN ('monthly', 'yearly')),
  subscription_started_at TIMESTAMPTZ,
  subscription_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT
);

CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  note TEXT NOT NULL DEFAULT '',
  score NUMERIC NOT NULL,
  risk_level TEXT NOT NULL,
  sleep_hours NUMERIC,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  mood_tag TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS check_ins_user_id_idx ON public.check_ins(user_id);
CREATE INDEX IF NOT EXISTS check_ins_completed_at_idx ON public.check_ins(completed_at DESC);
CREATE INDEX IF NOT EXISTS journal_entries_user_id_idx ON public.journal_entries(user_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Users read/update their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Check-ins: own data only (staff uses RPC below)
DROP POLICY IF EXISTS "check_ins_select_own" ON public.check_ins;
CREATE POLICY "check_ins_select_own"
  ON public.check_ins FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "check_ins_insert_own" ON public.check_ins;
CREATE POLICY "check_ins_insert_own"
  ON public.check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Journal: own data only
DROP POLICY IF EXISTS "journal_select_own" ON public.journal_entries;
CREATE POLICY "journal_select_own"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "journal_insert_own" ON public.journal_entries;
CREATE POLICY "journal_insert_own"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "journal_delete_own" ON public.journal_entries;
CREATE POLICY "journal_delete_own"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-create profile when a user signs up via Supabase Auth
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
    is_staff
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    LOWER(COALESCE(NEW.email, '')),
    COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::date, '2000-01-01'::date),
    COALESCE(NEW.raw_user_meta_data->>'telephone', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'postcode', ''),
    COALESCE((NEW.raw_user_meta_data->>'is_staff')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Staff access: run supabase/staff-migration.sql after this file for
-- named staff accounts (is_staff column + session-based admin RPCs).

CREATE OR REPLACE FUNCTION public.deactivate_own_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET status = 'deactivated', status_changed_at = NOW()
  WHERE id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_account_status(p_email TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status FROM public.profiles WHERE LOWER(email) = LOWER(TRIM(p_email)) LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_account_status(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.verify_profile_phone(
  p_email TEXT,
  p_telephone TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  matched BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE LOWER(email) = LOWER(TRIM(p_email))
      AND regexp_replace(telephone, '[^0-9+]', '', 'g')
        = regexp_replace(p_telephone, '[^0-9+]', '', 'g')
      AND status = 'active'
  ) INTO matched;
  RETURN matched;
END;
$$;

GRANT EXECUTE ON FUNCTION public.deactivate_own_account() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_profile_phone(TEXT, TEXT) TO anon, authenticated;
