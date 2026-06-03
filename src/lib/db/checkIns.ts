import { requireSupabase } from "../supabase";
import { checkInFromRow, type CheckInRow } from "./mappers";
import type { CheckIn } from "../../types";

export async function fetchCheckInsForUser(userId: string): Promise<CheckIn[]> {
  const { data, error } = await requireSupabase()
    .from("check_ins")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return ((data as CheckInRow[]) ?? []).map(checkInFromRow);
}

export async function createCheckIn(
  record: Omit<CheckIn, "id"> & { id?: string }
): Promise<CheckIn> {
  const row = {
    id: record.id ?? crypto.randomUUID(),
    user_id: record.userId,
    answers: record.answers,
    note: record.note,
    score: record.score,
    risk_level: record.riskLevel,
    sleep_hours: record.sleepHours,
    completed_at: record.completedAt,
  };

  const { data, error } = await requireSupabase()
    .from("check_ins")
    .insert(row)
    .select("*")
    .single();

  if (error) throw error;
  return checkInFromRow(data as CheckInRow);
}

export async function staffFetchAllCheckIns(
  staffCode: string
): Promise<CheckIn[]> {
  const { data, error } = await requireSupabase().rpc("staff_list_check_ins", {
    p_staff_code: staffCode,
  });

  if (error) throw error;
  return ((data as CheckInRow[]) ?? []).map(checkInFromRow);
}
