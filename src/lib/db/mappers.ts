import type { RiskLevel } from "../risk";
import type { AccountStatus, CheckIn, JournalEntry, QuestionAnswer, User } from "../../types";

export interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  date_of_birth: string;
  telephone: string;
  city: string;
  postcode: string;
  status: AccountStatus;
  status_changed_at: string | null;
  created_at: string;
}

export interface CheckInRow {
  id: string;
  user_id: string;
  answers: QuestionAnswer[];
  note: string;
  score: number;
  risk_level: RiskLevel;
  sleep_hours: number | null;
  completed_at: string;
}

export interface JournalRow {
  id: string;
  user_id: string;
  title: string;
  body: string;
  mood_tag: string;
  created_at: string;
}

export function profileToUser(row: ProfileRow): User {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    dateOfBirth: row.date_of_birth,
    telephone: row.telephone,
    city: row.city,
    postcode: row.postcode,
    status: row.status,
    statusChangedAt: row.status_changed_at,
    createdAt: row.created_at,
    password: "",
    passwordHash: "",
  };
}

export function checkInFromRow(row: CheckInRow): CheckIn {
  return {
    id: row.id,
    userId: row.user_id,
    answers: row.answers ?? [],
    note: row.note ?? "",
    score: Number(row.score),
    riskLevel: row.risk_level,
    sleepHours: row.sleep_hours != null ? Number(row.sleep_hours) : null,
    completedAt: row.completed_at,
  };
}

export function journalFromRow(row: JournalRow): JournalEntry {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    body: row.body,
    moodTag: row.mood_tag,
    createdAt: row.created_at,
  };
}
