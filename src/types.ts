import type { RiskLevel } from "./lib/risk";

export type AccountStatus = "active" | "deactivated";

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  passwordHash: string;
  dateOfBirth: string;
  telephone: string;
  city: string;
  postcode: string;
  status: AccountStatus;
  statusChangedAt: string | null;
  createdAt: string;
  /** @deprecated legacy field */
  name?: string;
}

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  telephone: string;
  city: string;
  postcode: string;
}

export interface QuestionAnswer {
  questionId: string;
  value: number;
}

export interface CheckIn {
  id: string;
  userId: string;
  answers: QuestionAnswer[];
  note: string;
  score: number;
  riskLevel: RiskLevel;
  sleepHours: number | null;
  completedAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  body: string;
  moodTag: string;
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  lowLabel: string;
  highLabel: string;
  reverseScore?: boolean;
  /** Short label for analytics */
  label?: string;
}
