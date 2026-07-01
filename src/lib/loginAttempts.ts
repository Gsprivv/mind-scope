const KEY = "mind_scope_login_attempts";
export const MAX_LOGIN_ATTEMPTS = 3;
export const LOCKOUT_DURATION_MS = 3 * 60 * 1000;

type AttemptEntry = {
  count: number;
  lockedAt: number | null;
};

type AttemptStore = Record<string, AttemptEntry>;

function normalizeEntry(value: unknown): AttemptEntry {
  if (typeof value === "number") {
    return {
      count: value,
      lockedAt: value >= MAX_LOGIN_ATTEMPTS ? Date.now() : null,
    };
  }
  if (
    value &&
    typeof value === "object" &&
    "count" in value &&
    typeof (value as AttemptEntry).count === "number"
  ) {
    const entry = value as AttemptEntry;
    return {
      count: entry.count,
      lockedAt:
        typeof entry.lockedAt === "number" ? entry.lockedAt : null,
    };
  }
  return { count: 0, lockedAt: null };
}

function read(): AttemptStore {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const store: AttemptStore = {};
    for (const [email, value] of Object.entries(parsed)) {
      store[email] = normalizeEntry(value);
    }
    return store;
  } catch {
    return {};
  }
}

function write(store: AttemptStore): void {
  localStorage.setItem(KEY, JSON.stringify(store));
}

function emailKey(email: string): string {
  return email.trim().toLowerCase();
}

export function getAttempts(email: string): number {
  return read()[emailKey(email)]?.count ?? 0;
}

export function incrementAttempts(email: string): number {
  const key = emailKey(email);
  const store = read();
  const entry = store[key] ?? { count: 0, lockedAt: null };
  const next = entry.count + 1;
  entry.count = next;
  if (next >= MAX_LOGIN_ATTEMPTS) {
    entry.lockedAt = Date.now();
  }
  store[key] = entry;
  write(store);
  return next;
}

export function clearAttempts(email: string): void {
  const key = emailKey(email);
  const store = read();
  delete store[key];
  write(store);
}

export function getLockoutRemainingMs(email: string): number {
  const key = emailKey(email);
  const entry = read()[key];
  if (!entry || entry.count < MAX_LOGIN_ATTEMPTS || entry.lockedAt == null) {
    return 0;
  }

  const remaining = LOCKOUT_DURATION_MS - (Date.now() - entry.lockedAt);
  if (remaining <= 0) {
    clearAttempts(email);
    return 0;
  }
  return remaining;
}

export function isLocked(email: string): boolean {
  return getLockoutRemainingMs(email) > 0;
}

export function formatLockoutRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}
