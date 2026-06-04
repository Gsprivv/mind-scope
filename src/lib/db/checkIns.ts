import { requireSupabase } from "../supabase";
import { checkInFromRow, type CheckInRow } from "./mappers";
import type { CheckIn } from "../../types";

export async function fetchCheckInsForUser(userId: string): Promise<CheckIn[]> {
  const client = requireSupabase();

  const { data: rpcData, error: rpcError } = await client.rpc(
    "fetch_my_check_ins"
  );

  if (!rpcError && rpcData) {
    return ((rpcData as CheckInRow[]) ?? []).map(checkInFromRow);
  }

  const { data, error } = await client
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

  const client = requireSupabase();
  const { data, error } = await client
    .from("check_ins")
    .insert(row)
    .select("*")
    .single();

  if (!error && data) {
    return checkInFromRow(data as CheckInRow);
  }

  if (error) {
    const { error: insertOnlyError } = await client.from("check_ins").insert(row);
    if (insertOnlyError) throw insertOnlyError;
  }

  return {
    id: row.id,
    userId: record.userId,
    answers: record.answers,
    note: record.note,
    score: Number(record.score),
    riskLevel: record.riskLevel,
    sleepHours: record.sleepHours,
    completedAt: record.completedAt,
  };
}

export async function staffFetchAllCheckIns(): Promise<CheckIn[]> {
  const { data, error } = await requireSupabase().rpc("staff_list_check_ins");

  if (error) throw error;
  return ((data as CheckInRow[]) ?? []).map(checkInFromRow);
}
