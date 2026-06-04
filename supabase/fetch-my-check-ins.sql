-- Reliable check-in fetch for dashboard/history (run in Supabase SQL Editor)

CREATE OR REPLACE FUNCTION public.fetch_my_check_ins()
RETURNS SETOF public.check_ins
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.*
  FROM public.check_ins c
  WHERE c.user_id = auth.uid()
    AND (
      public.is_profile_premium(auth.uid())
      OR c.completed_at >= ALL (
        SELECT c2.completed_at
        FROM public.check_ins c2
        WHERE c2.user_id = auth.uid()
      )
    )
  ORDER BY c.completed_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.fetch_my_check_ins() TO authenticated;
