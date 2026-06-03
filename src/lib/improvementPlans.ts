import type { CheckIn } from "../types";
import type { BmiCategory, WeightGoal } from "./bmi";

export interface DayPlan {
  day: number;
  title: string;
  actions: string[];
}

export interface WellnessImprovementPlan {
  reason: string;
  days: DayPlan[];
}

const WELLNESS_DAYS: Omit<DayPlan, "day">[] = [
  {
    title: "Sleep foundation",
    actions: [
      "Pick a fixed bedtime tonight — even 30 minutes earlier helps.",
      "No screens 30 minutes before bed; try reading or stretching instead.",
      "Write down three worries on paper so your mind can rest.",
    ],
  },
  {
    title: "Move your body",
    actions: [
      "Take a 15–20 minute walk outside, or gentle movement at home.",
      "Notice how you feel before and after — no pressure to perform.",
      "Drink a glass of water when you return.",
    ],
  },
  {
    title: "Connect with someone",
    actions: [
      "Message or call one person you trust — a short check-in counts.",
      "Share one honest thing about how you have been feeling.",
      "If that feels hard, send a simple 'thinking of you' text.",
    ],
  },
  {
    title: "Calm your nervous system",
    actions: [
      "Try 5 minutes of slow breathing: in for 4, hold 4, out for 6.",
      "Name five things you can see, four you can touch, three you can hear.",
      "Reduce caffeine after 2pm if anxiety or sleep is an issue.",
    ],
  },
  {
    title: "Structure & purpose",
    actions: [
      "Write a short list of three small tasks for today — keep them achievable.",
      "Complete one task before noon and acknowledge it.",
      "Block 10 minutes for something you enjoy, not just obligations.",
    ],
  },
  {
    title: "Nutrition & energy",
    actions: [
      "Eat one balanced meal: protein, vegetables, and slow carbs.",
      "Avoid skipping meals — low blood sugar can worsen low mood.",
      "Limit alcohol today; it often disrupts sleep and mood the next day.",
    ],
  },
  {
    title: "Reflect & retest",
    actions: [
      "Journal for five minutes: what felt better this week?",
      "Pick one habit from the last six days to keep next week.",
      "Take another wellness test to see if your score has shifted.",
    ],
  },
];

export function buildWellnessImprovementPlan(
  checkIns: CheckIn[]
): WellnessImprovementPlan | null {
  if (checkIns.length === 0) return null;
  const latest = checkIns[0];
  const needsPlan = latest.score < 65 || latest.riskLevel === "high";

  if (!needsPlan) return null;

  const reason =
    latest.riskLevel === "high"
      ? "Your latest result suggests you could use extra support this week. This 7-day plan is a gentle structure — not a substitute for professional help if you are struggling."
      : "Your score is below where you might want to be. Follow this 7-day plan for small, steady steps — then retake your wellness test.";

  return {
    reason,
    days: WELLNESS_DAYS.map((d, i) => ({ day: i + 1, ...d })),
  };
}

const BMI_PLANS: Record<
  BmiCategory,
  Record<WeightGoal, Omit<DayPlan, "day">[]>
> = {
  underweight: {
    gain: [
      { title: "Calorie awareness", actions: ["Add one extra snack: nuts, yoghurt, or peanut butter on toast.", "Drink milk or a smoothie with breakfast.", "Eat at regular times — do not skip meals."] },
      { title: "Protein focus", actions: ["Include protein at every meal: eggs, beans, chicken, or tofu.", "Try a handful of nuts mid-afternoon.", "If appetite is low, eat smaller portions more often."] },
      { title: "Strength basics", actions: ["10 minutes of bodyweight exercises: squats, press-ups (knees ok), planks.", "Rest between sets — build muscle, not exhaustion.", "Eat within an hour after moving."] },
      { title: "Hydration & sleep", actions: ["Drink water throughout the day — dehydration reduces appetite.", "Aim for 7–9 hours sleep; growth and recovery need rest.", "Avoid filling up on water right before meals."] },
      { title: "Healthy fats", actions: ["Add olive oil, avocado, or cheese to meals.", "Try salmon or oily fish if you eat it.", "Whole milk or full-fat yoghurt can help if tolerated."] },
      { title: "Track & adjust", actions: ["Weigh yourself at the same time tomorrow.", "Note energy levels — gaining should feel gradual.", "If losing weight unintentionally, book a GP appointment."] },
      { title: "Review & plan ahead", actions: ["Recalculate BMI if weight changed.", "Keep two go-to snacks stocked for busy days.", "Speak to a dietitian if you want personalised meal plans."] },
    ],
    lose: [],
    maintain: [],
  },
  healthy: {
    maintain: [
      { title: "Balanced plate", actions: ["Half vegetables, quarter protein, quarter whole grains at one meal.", "Cook at home once today if you can.", "Notice hunger — eat when hungry, stop when satisfied."] },
      { title: "Move regularly", actions: ["30 minutes of movement: walk, cycle, swim, or dance.", "Take stairs where safe.", "Stretch for five minutes before bed."] },
      { title: "Mindful eating", actions: ["Eat one meal without screens.", "Chew slowly and notice flavours.", "Stop when comfortably full, not stuffed."] },
      { title: "Sleep hygiene", actions: ["Same bedtime tonight.", "Limit late-night snacking.", "Keep bedroom cool and dark."] },
      { title: "Hydration", actions: ["6–8 glasses of fluid today.", "Swap one sugary drink for water or herbal tea.", "Carry a water bottle."] },
      { title: "Stress & weight", actions: ["Stress can affect eating — notice triggers.", "5-minute breathing break if tense.", "Walk instead of snacking when bored."] },
      { title: "Check-in", actions: ["Recalculate BMI to confirm you are still in range.", "Pick one habit to keep for next month.", "Celebrate maintaining — it takes effort."] },
    ],
    lose: [],
    gain: [],
  },
  overweight: {
    lose: [
      { title: "Small calorie shift", actions: ["Reduce portion size by 10–15% at one meal.", "Swap crisps or biscuits for fruit or veg sticks.", "No liquid calories today — water, tea, or black coffee."] },
      { title: "Walk more", actions: ["20–30 minute brisk walk.", "Park further away or get off one stop early.", "Set a step target — even 5,000 is a start."] },
      { title: "Protein & fibre", actions: ["High-protein breakfast: eggs, Greek yoghurt, or beans.", "Add vegetables to lunch and dinner.", "Fibre keeps you fuller longer."] },
      { title: "Plan meals", actions: ["Write tomorrow's meals before bed.", "Prep one healthy lunch in advance.", "Avoid shopping when hungry."] },
      { title: "Sleep & cravings", actions: ["7+ hours sleep — tiredness increases cravings.", "If snacking, pause 10 minutes — are you hungry or bored?", "Herbal tea instead of late-night snacks."] },
      { title: "Strength + cardio", actions: ["15 min walk + 10 min bodyweight exercises.", "Muscle helps metabolism long term.", "Move in a way you enjoy — consistency beats intensity."] },
      { title: "Measure progress", actions: ["Weigh yourself or measure waist — same time, same conditions.", "Recalculate BMI.", "Focus on habits, not just the number."] },
    ],
    gain: [],
    maintain: [],
  },
  obese: {
    lose: [
      { title: "Start gently", actions: ["10-minute walk today — any pace.", "Replace one sugary drink with water.", "Eat slowly — put fork down between bites."] },
      { title: "Support & safety", actions: ["Consider telling your GP you are working on weight.", "NHS Better Health has free tools — see dietitian section.", "Avoid extreme diets — slow loss is safer."] },
      { title: "Vegetables first", actions: ["Half your plate vegetables at one meal.", "Try tinned or frozen veg — equally nutritious.", "Season with herbs instead of heavy sauces."] },
      { title: "Move a little more", actions: ["Add 5 extra minutes to yesterday's walk.", "Chair exercises count if mobility is limited.", "Stop if you feel pain — consult GP if unsure."] },
      { title: "Emotional eating", actions: ["Note when you eat from stress vs hunger.", "Try a 5-minute walk before opening the fridge.", "Talk to someone if food feels like your main coping tool."] },
      { title: "Routine meals", actions: ["Three regular meals — skipping leads to overeating later.", "Healthy snack if needed: fruit, yoghurt, handful of nuts.", "Prepare one simple home-cooked meal."] },
      { title: "Review & next steps", actions: ["Recalculate BMI — even 1–2 kg loss improves health markers.", "Book NHS weight management or dietitian if ready.", "Celebrate showing up for seven days."] },
    ],
    gain: [],
    maintain: [],
  },
};

export function buildBmiImprovementPlan(
  category: BmiCategory,
  goal: WeightGoal
): { reason: string; days: DayPlan[] } | null {
  const templates =
    BMI_PLANS[category][goal] ??
    BMI_PLANS[category].maintain ??
    BMI_PLANS[category].lose;

  if (!templates || templates.length === 0) {
    if (category === "healthy") return null;
    const fallbackGoal = category === "underweight" ? "gain" : "lose";
    const fallback = BMI_PLANS[category][fallbackGoal];
    if (!fallback?.length) return null;
    return {
      reason: `Your BMI suggests focusing on **${fallbackGoal === "gain" ? "healthy weight gain" : "gradual weight loss"}**. Follow this 7-day starter plan — pair it with your personalised nutrition guide.`,
      days: fallback.map((d, i) => ({ day: i + 1, ...d })),
    };
  }

  const reason =
    category === "healthy"
      ? "You are in a healthy BMI range. This 7-day plan helps you maintain good habits."
      : category === "underweight"
        ? "Your BMI is below the healthy range. This gentle 7-day plan supports healthy weight gain — see your GP if weight loss was unintentional."
        : "Your BMI is above the healthy range. This 7-day plan supports gradual, sustainable change — not crash dieting.";

  return {
    reason,
    days: templates.map((d, i) => ({ day: i + 1, ...d })),
  };
}
