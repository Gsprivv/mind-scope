import { useEffect, useState } from "react";
import { recordAppVisit } from "../lib/visitStreak";

export function useVisitStreak(userId: string | undefined) {
  const [streak, setStreak] = useState({ current: 0, longest: 0 });

  useEffect(() => {
    if (!userId) {
      setStreak({ current: 0, longest: 0 });
      return;
    }
    setStreak(recordAppVisit(userId));
  }, [userId]);

  return streak;
}
