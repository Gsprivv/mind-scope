const STORAGE_KEY = "mind_scope_visit_days";

type VisitStore = Record<string, string[]>;

function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function loadStore(): VisitStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as VisitStore;
  } catch {
    return {};
  }
}

function saveStore(store: VisitStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function computeFromDays(days: string[]): { current: number; longest: number } {
  if (days.length === 0) return { current: 0, longest: 0 };

  const sorted = [...new Set(days)].sort();
  let longest = 1;
  let run = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T12:00:00");
    const curr = new Date(sorted[i] + "T12:00:00");
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  const today = localDateKey();
  const yesterday = localDateKey(new Date(Date.now() - 86400000));
  const set = new Set(sorted);

  let current = 0;
  if (set.has(today) || set.has(yesterday)) {
    let cursor = set.has(today) ? today : yesterday;
    current = 1;
    while (true) {
      const d = new Date(cursor + "T12:00:00");
      d.setDate(d.getDate() - 1);
      const prev = localDateKey(d);
      if (set.has(prev)) {
        current += 1;
        cursor = prev;
      } else break;
    }
  }

  return { current, longest: Math.max(longest, current) };
}

/** Record today's app visit and return streak counts. */
export function recordAppVisit(userId: string): { current: number; longest: number } {
  const store = loadStore();
  const today = localDateKey();
  const days = store[userId] ?? [];
  if (!days.includes(today)) {
    store[userId] = [...days, today].sort();
    saveStore(store);
  }
  return computeFromDays(store[userId]);
}

export function getAppVisitStreak(userId: string): { current: number; longest: number } {
  const store = loadStore();
  return computeFromDays(store[userId] ?? []);
}
