const KEY = "mind_scope_bmi_profile";

export interface BmiProfile {
  heightCm: number;
  weightKg: number;
  updatedAt: string;
}

export function getBmiProfile(): BmiProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BmiProfile) : null;
  } catch {
    return null;
  }
}

export function saveBmiProfile(heightCm: number, weightKg: number): void {
  const profile: BmiProfile = {
    heightCm,
    weightKg,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify(profile));
}
