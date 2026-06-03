-- Run this in Supabase SQL Editor AFTER the main schema.sql
-- Adds staff accounts support + profile contact updates

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_staff BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS profiles_is_staff_idx ON public.profiles(is_staff);

-- Profile trigger: honour is_staff from auth metadata
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
  ON CONFLICT (id) DO UPDATE SET
    is_staff = COALESCE(EXCLUDED.is_staff, public.profiles.is_staff);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_staff = true
      AND status = 'active'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_active_staff() TO authenticated;

-- Replace code-based staff RPCs with session-based staff checks
DROP FUNCTION IF EXISTS public.staff_list_profiles(TEXT);
DROP FUNCTION IF EXISTS public.staff_list_check_ins(TEXT);
DROP FUNCTION IF EXISTS public.staff_set_profile_status(TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS public.staff_delete_user(TEXT, UUID);

CREATE OR REPLACE FUNCTION public.staff_list_profiles()
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_active_staff() THEN
    RAISE EXCEPTION 'Staff access required';
  END IF;
  RETURN QUERY SELECT * FROM public.profiles ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.staff_list_check_ins()
RETURNS SETOF public.check_ins
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_active_staff() THEN
    RAISE EXCEPTION 'Staff access required';
  END IF;
  RETURN QUERY SELECT * FROM public.check_ins ORDER BY completed_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.staff_set_profile_status(
  p_user_id UUID,
  p_status TEXT
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated public.profiles;
BEGIN
  IF NOT public.is_active_staff() THEN
    RAISE EXCEPTION 'Staff access required';
  END IF;
  IF p_status NOT IN ('active', 'deactivated') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  UPDATE public.profiles
  SET status = p_status, status_changed_at = NOW()
  WHERE id = p_user_id
  RETURNING * INTO updated;
  IF updated IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  RETURN updated;
END;
$$;

CREATE OR REPLACE FUNCTION public.staff_delete_user(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.is_active_staff() THEN
    RAISE EXCEPTION 'Staff access required';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id AND is_staff = true
  ) THEN
    RAISE EXCEPTION 'Staff accounts cannot be deleted from the admin panel';
  END IF;
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_own_contact(
  p_email TEXT,
  p_telephone TEXT
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated public.profiles;
  trimmed_email TEXT;
BEGIN
  trimmed_email := LOWER(TRIM(p_email));
  IF trimmed_email = '' OR TRIM(p_telephone) = '' THEN
    RAISE EXCEPTION 'Email and telephone are required';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE LOWER(email) = trimmed_email AND id != auth.uid()
  ) THEN
    RAISE EXCEPTION 'Email already in use';
  END IF;
  UPDATE public.profiles
  SET email = trimmed_email, telephone = TRIM(p_telephone)
  WHERE id = auth.uid()
  RETURNING * INTO updated;
  IF updated IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
  RETURN updated;
END;
$$;

GRANT EXECUTE ON FUNCTION public.staff_list_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.staff_list_check_ins() TO authenticated;
GRANT EXECUTE ON FUNCTION public.staff_set_profile_status(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.staff_delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_own_contact(TEXT, TEXT) TO authenticated;
