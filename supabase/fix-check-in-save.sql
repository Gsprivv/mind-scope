-- Fix: saving a wellness test failed because free users could not SELECT their new row
-- after INSERT (first test especially). Run in Supabase SQL Editor.

DROP POLICY IF EXISTS "check_ins_select_own" ON public.check_ins;
CREATE POLICY "check_ins_select_own"
  ON public.check_ins FOR SELECT
  USING (
    auth.uid() = user_id
    AND (
      public.is_profile_premium(auth.uid())
      OR completed_at >= ALL (
        SELECT c.completed_at
        FROM public.check_ins c
        WHERE c.user_id = auth.uid()
      )
    )
  );
