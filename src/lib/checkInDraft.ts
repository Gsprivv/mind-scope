const DRAFT_KEY = "mind_scope_check_in_draft";

export interface CheckInDraft {
  userId: string;
  step: number;
  answers: Record<string, number>;
  sleepHours: string;
  note: string;
  savedAt: string;
}

export function loadCheckInDraft(userId: string): CheckInDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as CheckInDraft;
    if (draft.userId !== userId) return null;
    return draft;
  } catch {
    return null;
  }
}

export function saveCheckInDraft(draft: CheckInDraft): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearCheckInDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

export function hasMeaningfulDraft(draft: CheckInDraft | null): boolean {
  if (!draft) return false;
  return (
    Object.keys(draft.answers).length > 0 ||
    draft.step > 0 ||
    draft.note.trim().length > 0
  );
}
