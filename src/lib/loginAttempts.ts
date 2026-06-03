const KEY = "mind_scope_login_attempts";
export const MAX_LOGIN_ATTEMPTS = 3;

type AttemptStore = Record<string, number>;

function read(): AttemptStore {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AttemptStore) : {};
  } catch {
    return {};
  }
}

function write(store: AttemptStore): void {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function getAttempts(email: string): number {
  return read()[email.trim().toLowerCase()] ?? 0;
}

export function incrementAttempts(email: string): number {
  const key = email.trim().toLowerCase();
  const store = read();
  const next = (store[key] ?? 0) + 1;
  store[key] = next;
  write(store);
  return next;
}

export function clearAttempts(email: string): void {
  const key = email.trim().toLowerCase();
  const store = read();
  delete store[key];
  write(store);
}

export function isLocked(email: string): boolean {
  return getAttempts(email) >= MAX_LOGIN_ATTEMPTS;
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}
