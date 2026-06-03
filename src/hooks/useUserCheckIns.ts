import { useCallback, useEffect, useState } from "react";
import type { CheckIn } from "../types";
import { fetchCheckInsForUser } from "../lib/db/checkIns";
import { isSupabaseConfigured } from "../lib/supabase";

export function useUserCheckIns(userId: string | undefined) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId || !isSupabaseConfigured()) {
      setCheckIns([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchCheckInsForUser(userId);
      setCheckIns(rows);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load check-ins"
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { checkIns, loading, error, reload };
}
