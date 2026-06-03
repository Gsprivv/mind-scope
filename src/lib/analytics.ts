import { QUESTION_LABELS } from "../data/questionMeta";
import { CHECK_IN_QUESTIONS } from "../data/questions";
import type { CheckIn, User } from "../types";
import { UK_EMERGENCY } from "../constants/company";

function sortedAsc(checkIns: CheckIn[]): CheckIn[] {
  return [...checkIns].sort(
    (a, b) =>
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );
}

export function getAnswer(checkIn: CheckIn, questionId: string): number | undefined {
  return checkIn.answers.find((a) => a.questionId === questionId)?.value;
}

/** Normalised 0–100 where higher = better wellbeing for that dimension */
export function dimensionScore(questionId: string, raw: number): number {
  const q = CHECK_IN_QUESTIONS.find((x) => x.id === questionId);
  const v = q?.reverseScore ? 6 - raw : raw;
  return Math.round((v / 5) * 100);
}

export function computeStreak(checkIns: CheckIn[]): {
  current: number;
  longest: number;
} {
  if (checkIns.length === 0) return { current: 0, longest: 0 };

  const days = new Set(
    checkIns.map((c) => c.completedAt.slice(0, 10))
  );
  const sortedDays = [...days].sort();

  let longest = 0;
  let run = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1] + "T12:00:00");
    const curr = new Date(sortedDays[i] + "T12:00:00");
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      run += 1;
    } else {
      longest = Math.max(longest, run);
      run = 1;
    }
  }
  longest = Math.max(longest, run);

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let current = 0;
  if (days.has(today) || days.has(yesterday)) {
    let cursor = days.has(today) ? today : yesterday;
    current = 1;
    while (true) {
      const d = new Date(cursor + "T12:00:00");
      d.setDate(d.getDate() - 1);
      const prev = d.toISOString().slice(0, 10);
      if (days.has(prev)) {
        current += 1;
        cursor = prev;
      } else break;
    }
  }

  return { current, longest };
}

export function getPersonalAverages(
  checkIns: CheckIn[]
): Record<string, number> {
  const sums: Record<string, { total: number; count: number }> = {};
  for (const c of checkIns) {
    for (const a of c.answers) {
      if (!sums[a.questionId]) sums[a.questionId] = { total: 0, count: 0 };
      sums[a.questionId].total += dimensionScore(a.questionId, a.value);
      sums[a.questionId].count += 1;
    }
  }
  const avgs: Record<string, number> = {};
  for (const [id, { total, count }] of Object.entries(sums)) {
    avgs[id] = Math.round(total / count);
  }
  return avgs;
}

export interface SelfComparison {
  questionId: string;
  label: string;
  latest: number;
  personalAverage: number;
  percentVsSelf: number;
}

export function compareToPersonalAverage(
  checkIns: CheckIn[]
): SelfComparison[] {
  if (checkIns.length === 0) return [];
  const latest = checkIns[0];
  const avgs = getPersonalAverages(checkIns);
  if (checkIns.length < 2) return [];

  const results: SelfComparison[] = [];
  for (const q of CHECK_IN_QUESTIONS) {
    const raw = getAnswer(latest, q.id);
    if (raw == null || avgs[q.id] == null) continue;
    const latestNorm = dimensionScore(q.id, raw);
    const avg = avgs[q.id];
    const percentVsSelf =
      avg === 0
        ? 0
        : Math.round(((latestNorm - avg) / avg) * 100);
    results.push({
      questionId: q.id,
      label: QUESTION_LABELS[q.id] ?? q.id,
      latest: latestNorm,
      personalAverage: avg,
      percentVsSelf,
    });
  }
  return results.sort(
    (a, b) => Math.abs(b.percentVsSelf) - Math.abs(a.percentVsSelf)
  );
}

export interface CopingProfile {
  topStressors: string[];
  moodBoosters: string[];
  helpfulHabits: string[];
  summary: string;
}

export function generateCopingProfile(checkIns: CheckIn[]): CopingProfile | null {
  if (checkIns.length < 3) return null;

  const sorted = sortedAsc(checkIns);
  const highDays = sorted.filter((c) => c.score >= 65);
  const lowDays = sorted.filter((c) => c.score < 45);

  const avgWhenHigh = (id: string) => {
    if (highDays.length === 0) return null;
    const vals = highDays
      .map((c) => getAnswer(c, id))
      .filter((v): v is number => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };

  const avgWhenLow = (id: string) => {
    if (lowDays.length === 0) return null;
    const vals = lowDays
      .map((c) => getAnswer(c, id))
      .filter((v): v is number => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };

  const stressors: string[] = [];
  const boosters: string[] = [];
  const habits: string[] = [];

  const stressHigh = avgWhenLow("stress");
  if (stressHigh != null && stressHigh >= 3.5) {
    stressors.push("Higher stress levels often appear on your lower-scoring days.");
  }

  const sleepLow = avgWhenLow("sleep");
  const sleepHigh = avgWhenHigh("sleep");
  if (sleepLow != null && sleepHigh != null && sleepHigh - sleepLow >= 1) {
    stressors.push("Poor sleep quality is linked to your tougher check-ins.");
    boosters.push("Better sleep quality often aligns with your stronger wellness scores.");
  }

  const socialHigh = avgWhenHigh("social");
  const socialLow = avgWhenLow("social");
  if (socialHigh != null && socialLow != null && socialHigh - socialLow >= 1) {
    boosters.push("Stronger social connection tends to coincide with better days for you.");
  }

  const hobbyHigh = avgWhenHigh("hobbies");
  if (hobbyHigh != null && hobbyHigh >= 3.5) {
    habits.push("More time on hobbies correlates with your higher wellness scores.");
  }

  const balanceLow = avgWhenLow("balance");
  if (balanceLow != null && balanceLow <= 2.5) {
    stressors.push("Work/school balance difficulties show up on lower-scoring days.");
  }

  const energyLow = avgWhenLow("energy");
  if (energyLow != null && energyLow <= 2.5) {
    stressors.push("Low energy is a recurring theme when your overall score drops.");
  }

  const resilienceHigh = avgWhenHigh("resilience");
  if (resilienceHigh != null && resilienceHigh >= 3.5) {
    boosters.push("When you rate your recovery from setbacks higher, your overall wellness tends to improve.");
  }

  if (stressors.length === 0) {
    stressors.push("No single stressor dominates yet — keep checking in to refine this profile.");
  }
  if (boosters.length === 0) {
    boosters.push("Social connection, sleep, and hobbies are worth watching as your data grows.");
  }
  if (habits.length === 0) {
    habits.push("Regular check-ins and journaling will help identify habits that support you.");
  }

  return {
    topStressors: stressors.slice(0, 3),
    moodBoosters: boosters.slice(0, 3),
    helpfulHabits: habits.slice(0, 3),
    summary:
      "This profile compares your better and tougher check-ins — only against your own history, never other people.",
  };
}

export function generateWhyAnalysis(latest: CheckIn): string {
  const contributors: { label: string; weight: number }[] = [];

  for (const q of CHECK_IN_QUESTIONS) {
    const raw = getAnswer(latest, q.id);
    if (raw == null) continue;
    const norm = dimensionScore(q.id, raw);
    if (norm < 50) {
      contributors.push({
        label: QUESTION_LABELS[q.id] ?? q.id,
        weight: 100 - norm,
      });
    }
  }

  if (latest.sleepHours != null && latest.sleepHours < 6) {
    contributors.push({
      label: `Short sleep (${latest.sleepHours} hours)`,
      weight: 80,
    });
  }

  contributors.sort((a, b) => b.weight - a.weight);
  const top = contributors.slice(0, 3).map((c) => c.label);

  if (top.length === 0) {
    return "Based on your latest check-in, no single factor stands out as a major drag on your wellbeing — your scores are relatively balanced today.";
  }

  const list =
    top.length === 1
      ? top[0]
      : top.length === 2
        ? `${top[0]} and ${top[1]}`
        : `${top[0]}, ${top[1]}, and ${top[2]}`;

  const socialNorm = dimensionScore(
    "social",
    getAnswer(latest, "social") ?? 3
  );
  const socialNote =
    socialNorm >= 60
      ? " Social factors appear less influential than other areas right now."
      : " Social connection may also be playing a role.";

  return `Based on your responses, **${list}** appear to be contributing more to how you're feeling than other areas.${socialNote}`;
}

export interface RecoveryEstimate {
  text: string;
  disclaimer: string;
}

export function generateRecoveryEstimate(
  checkIns: CheckIn[]
): RecoveryEstimate | null {
  if (checkIns.length < 4) return null;
  const latest = checkIns[0];
  if (latest.score >= 55) return null;

  const sorted = sortedAsc(checkIns);
  const recoveries: number[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].score < 45 && sorted[i + 1].score >= sorted[i].score + 10) {
      const days =
        (new Date(sorted[i + 1].completedAt).getTime() -
          new Date(sorted[i].completedAt).getTime()) /
        86400000;
      if (days > 0 && days < 30) recoveries.push(days);
    }
  }

  const avgSleep =
    latest.sleepHours ??
    (() => {
      const withSleep = checkIns.filter((c) => c.sleepHours != null);
      if (!withSleep.length) return null;
      return (
        withSleep.reduce((s, c) => s + (c.sleepHours ?? 0), 0) /
        withSleep.length
      );
    })();

  let low = 3;
  let high = 7;
  if (recoveries.length >= 2) {
    const avg = recoveries.reduce((a, b) => a + b, 0) / recoveries.length;
    low = Math.max(2, Math.floor(avg * 0.7));
    high = Math.ceil(avg * 1.3);
  }

  let sleepClause =
    "if supportive habits improve (especially rest and balance)";
  if (avgSleep != null && avgSleep < 6) {
    sleepClause = "if sleep improves towards 7–8 hours per night";
  }

  return {
    text: `Based on your previous patterns, scores similar to today's have often moved back up within **${low}–${high} days** when conditions improve — particularly ${sleepClause}.`,
    disclaimer:
      "This is a personal estimate only, not medical advice. Everyone's recovery is different.",
  };
}

export function generateMoodTimelineStory(checkIns: CheckIn[]): string {
  if (checkIns.length < 2) {
    return "Your mood timeline will build as you complete more check-ins. Each entry adds context to your personal story.";
  }

  const sorted = sortedAsc(checkIns);
  const now = new Date();
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const recent = sorted.filter(
    (c) => new Date(c.completedAt) >= monthAgo
  );
  const slice = recent.length >= 2 ? recent : sorted;

  const scores = slice.map((c) => c.score);
  const first = scores.slice(0, Math.ceil(scores.length / 3));
  const mid = scores.slice(
    Math.ceil(scores.length / 3),
    Math.ceil((2 * scores.length) / 3)
  );
  const last = scores.slice(Math.ceil((2 * scores.length) / 3));

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const a1 = avg(first);
  const a2 = avg(mid);
  const a3 = avg(last);

  const parts: string[] = [];

  if (a1 >= 60) parts.push("You started this period on relatively positive footing");
  else if (a1 >= 40) parts.push("This period began with mixed wellbeing");
  else parts.push("This period began during a harder stretch");

  if (a2 < a1 - 8) {
    parts.push("then dipped through a more challenging phase");
  } else if (a2 > a1 + 8) {
    parts.push("then improved through the middle of the period");
  } else {
    parts.push("with fairly steady scores in the middle");
  }

  if (a3 > a2 + 8) {
    const socialUp =
      slice.length >= 2 &&
      dimensionScore(
        "social",
        getAnswer(slice[slice.length - 1], "social") ?? 3
      ) >
        dimensionScore(
          "social",
          getAnswer(slice[0], "social") ?? 3
        );
    parts.push(
      socialUp
        ? "before recovering recently — social connection and engagement look stronger in your latest entries"
        : "before recovering in your most recent check-ins"
    );
  } else if (a3 < a2 - 8) {
    parts.push("with a recent downward trend worth monitoring with care");
  } else {
    parts.push("and have remained fairly stable towards the present");
  }

  return parts.join(", ") + ".";
}

export function detectPatterns(checkIns: CheckIn[]): string[] {
  if (checkIns.length < 3) {
    return [
      "Complete a few more check-ins and Mind Scope will highlight personal patterns for you.",
    ];
  }

  const patterns: string[] = [];
  const withSleep = checkIns.filter((c) => c.sleepHours != null);
  if (withSleep.length >= 3) {
    const lowSleep = withSleep.filter((c) => (c.sleepHours ?? 0) < 6);
    const lowSleepScores = lowSleep.map((c) => c.score);
    const okSleep = withSleep.filter((c) => (c.sleepHours ?? 0) >= 7);
    if (lowSleep.length >= 2 && okSleep.length >= 2) {
      const avgLow =
        lowSleepScores.reduce((a, b) => a + b, 0) / lowSleepScores.length;
      const avgOk =
        okSleep.reduce((s, c) => s + c.score, 0) / okSleep.length;
      if (avgOk - avgLow >= 12) {
        patterns.push(
          `On days you log under 6 hours of sleep, your wellness score averages **${Math.round(avgLow)}%** — compared with **${Math.round(avgOk)}%** when you sleep 7+ hours.`
        );
      }
    }
  }

  const avgs = getPersonalAverages(checkIns);
  const stressAvg = avgs.stress;
  if (stressAvg != null && stressAvg < 45) {
    patterns.push(
      "Stress is frequently a lower-scoring dimension for you — it may be your most sensitive wellbeing indicator."
    );
  }

  const { current } = computeStreak(checkIns);
  if (current >= 3) {
    patterns.push(
      `You're on a **${current}-day check-in streak** — consistency helps Mind Scope detect trends earlier.`
    );
  }

  const comparisons = compareToPersonalAverage(checkIns);
  const improved = comparisons.filter((c) => c.percentVsSelf >= 15);
  if (improved.length > 0) {
    patterns.push(
      `Your **${improved[0].label}** is **${improved[0].percentVsSelf}%** above your personal average today — compare yourself to yourself, not others.`
    );
  }

  if (patterns.length === 0) {
    patterns.push(
      "Your data is becoming more consistent. Keep checking in to unlock deeper pattern insights."
    );
  }

  return patterns;
}

export type CrisisLevel = "none" | "elevated" | "severe";

export function assessCrisisFromCheckIn(checkIn: CheckIn): CrisisLevel {
  let lowCount = 0;
  for (const q of CHECK_IN_QUESTIONS) {
    const raw = getAnswer(checkIn, q.id);
    if (raw != null && raw <= 2) lowCount += 1;
  }

  const satisfaction = getAnswer(checkIn, "satisfaction") ?? 3;
  const optimism = getAnswer(checkIn, "optimism") ?? 3;
  const stress = getAnswer(checkIn, "stress") ?? 3;

  if (
    checkIn.score < 25 ||
    lowCount >= 8 ||
    (satisfaction <= 1 && optimism <= 1)
  ) {
    return "severe";
  }
  if (
    checkIn.score < 40 ||
    lowCount >= 5 ||
    stress >= 5 ||
    (satisfaction <= 2 && optimism <= 2)
  ) {
    return "elevated";
  }
  return "none";
}

export function getCrisisGuidance(
  level: CrisisLevel,
  user: User | null
): string[] {
  const location =
    user?.city && user?.postcode
      ? ` near **${user.city} (${user.postcode})**`
      : "";

  const lines: string[] = [];

  if (level === "severe") {
    lines.push(
      "Your latest check-in suggests you may be in significant distress. Please do not face this alone."
    );
    lines.push(
      `**Samaritans** — call **116 123** (free, 24/7, UK-wide${location ? ", including your area" : ""}).`
    );
    lines.push("**Emergency** — call **999** if you are in immediate danger.");
    lines.push(
      "Reach out to someone you trust today — a friend, family member, GP, or local crisis team."
    );
  } else if (level === "elevated") {
    lines.push(
      "Your responses indicate elevated distress. Consider speaking with your GP or a counsellor soon."
    );
    lines.push("**Samaritans** — **116 123** · **NHS 111** — **111**");
    lines.push(
      "Talking to someone you trust can help. Mind Scope is not a substitute for professional care."
    );
  }

  return lines;
}

export function getLocationSupportSummary(user: User | null): string {
  if (!user?.city) {
    return "Add your city and postcode in your profile (at sign-up) so we can remind you of UK services relevant to your area.";
  }
  const services = UK_EMERGENCY.slice(0, 3)
    .map((s) => `${s.name} (${s.contact})`)
    .join(" · ");
  return `Registered in **${user.city}, ${user.postcode}**. UK-wide support includes ${services}. Search "NHS mental health ${user.city}" for local NHS talking therapies (IAPT).`;
}

export interface WellnessInsights {
  streak: ReturnType<typeof computeStreak>;
  patterns: string[];
  copingProfile: CopingProfile | null;
  whyAnalysis: string | null;
  recovery: RecoveryEstimate | null;
  timelineStory: string;
  selfComparisons: SelfComparison[];
  crisisLevel: CrisisLevel;
  crisisGuidance: string[];
  locationSupport: string;
}

export function buildWellnessInsights(
  checkIns: CheckIn[],
  user: User | null
): WellnessInsights | null {
  if (checkIns.length === 0) return null;
  const latest = checkIns[0];
  const crisisLevel = assessCrisisFromCheckIn(latest);

  return {
    streak: computeStreak(checkIns),
    patterns: detectPatterns(checkIns),
    copingProfile: generateCopingProfile(checkIns),
    whyAnalysis: checkIns.length >= 1 ? generateWhyAnalysis(latest) : null,
    recovery: generateRecoveryEstimate(checkIns),
    timelineStory: generateMoodTimelineStory(checkIns),
    selfComparisons: compareToPersonalAverage(checkIns),
    crisisLevel,
    crisisGuidance: getCrisisGuidance(crisisLevel, user),
    locationSupport: getLocationSupportSummary(user),
  };
}
