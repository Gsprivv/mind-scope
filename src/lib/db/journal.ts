import { requireSupabase } from "../supabase";
import { journalFromRow, type JournalRow } from "./mappers";
import type { JournalEntry } from "../../types";

export async function fetchJournalForUser(
  userId: string
): Promise<JournalEntry[]> {
  const { data, error } = await requireSupabase()
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data as JournalRow[]) ?? []).map(journalFromRow);
}

export async function createJournalEntry(
  entry: Omit<JournalEntry, "id"> & { id?: string }
): Promise<JournalEntry> {
  const row = {
    id: entry.id ?? crypto.randomUUID(),
    user_id: entry.userId,
    title: entry.title,
    body: entry.body,
    mood_tag: entry.moodTag,
    created_at: entry.createdAt,
  };

  const { data, error } = await requireSupabase()
    .from("journal_entries")
    .insert(row)
    .select("*")
    .single();

  if (error) throw error;
  return journalFromRow(data as JournalRow);
}

export async function removeJournalEntry(id: string): Promise<void> {
  const { error } = await requireSupabase()
    .from("journal_entries")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
