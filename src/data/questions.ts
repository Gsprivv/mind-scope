import type { Question } from "../types";

export const CHECK_IN_QUESTIONS: Question[] = [
  {
    id: "sleep",
    text: "How would you rate your sleep quality recently?",
    lowLabel: "Very poor",
    highLabel: "Excellent",
  },
  {
    id: "energy",
    text: "How would you rate your energy level today?",
    lowLabel: "Very low",
    highLabel: "Very high",
  },
  {
    id: "engagement",
    text: "How engaged do you feel with daily activities?",
    lowLabel: "Not at all",
    highLabel: "Fully engaged",
  },
  {
    id: "stress",
    text: "How would you rate your stress level right now?",
    lowLabel: "Very low",
    highLabel: "Very high",
    reverseScore: true,
  },
  {
    id: "focus",
    text: "How would you rate your ability to focus?",
    lowLabel: "Very poor",
    highLabel: "Excellent",
  },
  {
    id: "social",
    text: "How connected do you feel socially?",
    lowLabel: "Isolated",
    highLabel: "Very connected",
  },
  {
    id: "purpose",
    text: "How strong is your sense of purpose?",
    lowLabel: "Very weak",
    highLabel: "Very strong",
  },
  {
    id: "confidence",
    text: "How would you rate your confidence level?",
    lowLabel: "Very low",
    highLabel: "Very high",
  },
  {
    id: "satisfaction",
    text: "How satisfied are you with your life overall?",
    lowLabel: "Not satisfied",
    highLabel: "Very satisfied",
  },
  {
    id: "control",
    text: "How much control do you feel over your life?",
    lowLabel: "None",
    highLabel: "Complete",
  },
  {
    id: "optimism",
    text: "How optimistic do you feel about the future?",
    lowLabel: "Not optimistic",
    highLabel: "Very optimistic",
  },
  {
    id: "balance",
    text: "How balanced do you feel between work or school and personal life?",
    lowLabel: "Very unbalanced",
    highLabel: "Very balanced",
  },
  {
    id: "hobbies",
    text: "How satisfied are you with time spent on hobbies and interests?",
    lowLabel: "Not satisfied",
    highLabel: "Very satisfied",
  },
  {
    id: "resilience",
    text: "How able do you feel to recover from setbacks?",
    lowLabel: "Not able",
    highLabel: "Very able",
  },
];

export const CHECK_IN_QUESTION_COUNT = CHECK_IN_QUESTIONS.length;

export function computeWellnessScore(
  answers: { questionId: string; value: number }[]
): number {
  const byId = Object.fromEntries(answers.map((a) => [a.questionId, a.value]));
  let total = 0;

  for (const q of CHECK_IN_QUESTIONS) {
    const raw = byId[q.id] ?? 3;
    const normalized = q.reverseScore ? 6 - raw : raw;
    total += normalized;
  }

  const max = CHECK_IN_QUESTIONS.length * 5;
  return Math.round((total / max) * 100);
}

export function scoreLabel(score: number): {
  label: string;
  description: string;
  tone: "low" | "mid" | "high";
} {
  if (score < 40) {
    return {
      label: "Needs care",
      description:
        "Your responses suggest you may benefit from extra support. Consider speaking with your GP, a counsellor, or someone you trust.",
      tone: "low",
    };
  }
  if (score < 65) {
    return {
      label: "Mixed",
      description:
        "Some wellbeing areas may need attention. Regular check-ins help you spot patterns and adjust what supports you.",
      tone: "mid",
    };
  }
  return {
    label: "Doing well",
    description:
      "Your responses indicate relatively stable wellbeing today. Keep nurturing habits that work for you.",
    tone: "high",
  };
}
