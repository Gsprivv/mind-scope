import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CheckIn } from "../types";
import { fetchCheckInsForUser } from "../lib/db/checkIns";
import { isSupabaseConfigured } from "../lib/supabase";

interface CheckInsContextValue {
  checkIns: CheckIn[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const CheckInsContext = createContext<CheckInsContextValue | null>(null);

export function CheckInsProvider({
  userId,
  children,
}: {
  userId: string | undefined;
  children: ReactNode;
}) {
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
      setCheckIns([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo(
    () => ({ checkIns, loading, error, reload }),
    [checkIns, loading, error, reload]
  );

  return (
    <CheckInsContext.Provider value={value}>{children}</CheckInsContext.Provider>
  );
}

export function useCheckIns(): CheckInsContextValue {
  const ctx = useContext(CheckInsContext);
  if (!ctx) {
    throw new Error("useCheckIns must be used within CheckInsProvider");
  }
  return ctx;
}
