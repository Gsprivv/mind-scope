import type { JournalEntry } from "../types";

const KEY = "mind_scope_journal";

export function getJournalEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as JournalEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveJournalEntries(entries: JournalEntry[]): void {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function getJournalForUser(userId: string): JournalEntry[] {
  return getJournalEntries()
    .filter((e) => e.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function addJournalEntry(entry: JournalEntry): void {
  const all = getJournalEntries();
  saveJournalEntries([entry, ...all]);
}

export function deleteJournalEntry(id: string): void {
  saveJournalEntries(getJournalEntries().filter((e) => e.id !== id));
}

export function deleteJournalEntriesForUser(userId: string): void {
  saveJournalEntries(getJournalEntries().filter((e) => e.userId !== userId));
}
