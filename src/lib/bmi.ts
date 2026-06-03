export type BmiCategory =
  | "underweight"
  | "healthy"
  | "overweight"
  | "obese";

export type WeightGoal = "lose" | "gain" | "maintain";

export interface BmiResult {
  bmi: number;
  category: BmiCategory;
  label: string;
  description: string;
  suggestedGoal: WeightGoal;
  goalQuestion: string;
}

export interface WeightGuidance {
  summary: string;
  foods: string[];
  avoidOrLimit: string[];
  exercises: string[];
  frequency: string;
  generalTips: string[];
  disclaimer: string;
}

export function calculateBmi(weightKg: number, heightCm: number): number | null {
  if (weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "healthy";
  if (bmi < 30) return "overweight";
  return "obese";
}

const CATEGORY_META: Record<
  BmiCategory,
  { label: string; description: string; suggestedGoal: WeightGoal; goalQuestion: string }
> = {
  underweight: {
    label: "Underweight",
    description:
      "Your BMI is below the healthy range. This can sometimes reflect low nutrition, illness, or high activity. A GP can check there is no underlying cause.",
    suggestedGoal: "gain",
    goalQuestion: "Would you like tips to gain weight in a healthy way?",
  },
  healthy: {
    label: "Healthy weight",
    description:
      "Your BMI is in the healthy range for most adults. Focus on balanced eating, movement, and sleep to stay well.",
    suggestedGoal: "maintain",
    goalQuestion: "Would you like tips to maintain a healthy weight?",
  },
  overweight: {
    label: "Overweight",
    description:
      "Your BMI is above the healthy range. Small, steady changes to food and activity often work better than strict diets.",
    suggestedGoal: "lose",
    goalQuestion: "Would you like tips to lose weight safely?",
  },
  obese: {
    label: "Obese",
    description:
      "Your BMI is in the obese range. Losing even a small amount of weight can help health. Your GP can support a safe plan — including NHS weight-management services in many areas.",
    suggestedGoal: "lose",
    goalQuestion: "Would you like tips to lose weight safely?",
  },
};

export function interpretBmi(bmi: number): BmiResult {
  const category = getBmiCategory(bmi);
  const meta = CATEGORY_META[category];
  return { bmi, category, ...meta };
}

export function getWeightGuidance(
  category: BmiCategory,
  goal: WeightGoal
): WeightGuidance {
  if (goal === "maintain" || category === "healthy") {
    return {
      summary:
        "Aim for balance — regular meals, plenty of vegetables, and activity you enjoy.",
      foods: [
        "Vegetables and fruit (at least 5 portions a day)",
        "Wholegrains: brown rice, oats, wholemeal bread",
        "Lean protein: chicken, fish, eggs, beans, lentils",
        "Dairy or fortified alternatives (calcium)",
        "Healthy fats in small amounts: olive oil, nuts, avocado",
      ],
      avoidOrLimit: [
        "Large portions of ultra-processed snacks and sugary drinks",
        "Skipping meals regularly",
        "Very restrictive diets without professional advice",
      ],
      exercises: [
        "Brisk walking — 30 minutes most days",
        "Strength training — 2 sessions per week (body weight or weights)",
        "Stretching or yoga — 10–15 minutes for flexibility",
      ],
      frequency:
        "Aim for **150 minutes** of moderate activity per week, plus strength work twice weekly.",
      generalTips: [
        "Weigh yourself weekly at the same time of day if you track weight.",
        "Prioritise sleep (7–9 hours) — it supports appetite and mood.",
        "Use the Mind Scope wellness test to monitor stress and sleep.",
      ],
      disclaimer:
        "General wellbeing guidance only — not personal medical advice.",
    };
  }

  if (goal === "gain" || category === "underweight") {
    return {
      summary:
        "Gain weight gradually (about 0.5–1 kg per month) with nutrient-dense foods — not just high-sugar snacks.",
      foods: [
        "Regular meals plus healthy snacks (3 meals + 2 snacks)",
        "Full-fat milk, cheese, yoghurt if tolerated",
        "Nuts, nut butter, seeds, dried fruit",
        "Oily fish (salmon, mackerel) twice a week",
        "Starchy carbs: pasta, rice, potatoes with meals",
        "Smoothies with milk, banana, oats, and peanut butter",
      ],
      avoidOrLimit: [
        "Filling up on fizzy drinks or sweets without protein",
        "Skipping breakfast",
        "Very high cardio without eating enough to match",
      ],
      exercises: [
        "Resistance training — 2–3 times per week (build muscle, not only cardio)",
        "Light walking — supports appetite without burning excessive calories",
        "Yoga or Pilates — optional for strength and balance",
      ],
      frequency:
        "Strength sessions **2–3 times per week**, 30–45 minutes. Rest days between hard sessions.",
      generalTips: [
        "Add calories to meals (extra olive oil, cheese, avocado).",
        "If appetite is low or you are losing weight without trying, see your GP.",
        "A registered dietitian can plan safe weight gain — see signposting below.",
      ],
      disclaimer:
        "If you have an eating disorder or sudden weight loss, speak to your GP urgently — this app does not replace medical care.",
    };
  }

  return {
    summary:
      "Safe weight loss is usually **0.5–1 kg per week** through modest calorie changes and more movement — not extreme restriction.",
    foods: [
      "Half your plate vegetables or salad at lunch and dinner",
      "Lean protein every meal (keeps you fuller)",
      "High-fibre carbs: oats, brown rice, wholegrain bread",
      "Water as main drink — limit sugary drinks and alcohol",
      "Planned snacks: fruit, yoghurt, handful of nuts",
    ],
    avoidOrLimit: [
      "Large takeaway portions and frequent ultra-processed meals",
      "Liquid calories (sugary coffee drinks, energy drinks, alcohol)",
      "Very low-calorie diets unless supervised by a health professional",
    ],
    exercises: [
      "Brisk walking — start 20–30 minutes, build to 45 minutes most days",
      "Swimming or cycling — low impact on joints",
      "Strength training — 2 times per week (muscle helps metabolism)",
      "Daily movement: stairs, short walks after meals",
    ],
    frequency:
      "Start with **150 minutes** moderate activity per week. Add strength **2 times per week**. Increase gradually.",
    generalTips: [
      "Use smaller plates and eat slowly — fullness takes about 20 minutes.",
      "Track habits, not just weight — sleep and stress affect eating.",
      "NHS weight-management programmes may be available via your GP.",
      "Open **BMI & nutrition** in the menu for your calculator and local dietitian info.",
    ],
    disclaimer:
      "Not suitable as a sole plan if you are pregnant, have diabetes, or take weight-affecting medication — ask your GP first.",
  };
}

export function healthyWeightRangeKg(heightCm: number): { min: number; max: number } | null {
  if (heightCm <= 0) return null;
  const h = heightCm / 100;
  const min = Math.round(18.5 * h * h * 10) / 10;
  const max = Math.round(24.9 * h * h * 10) / 10;
  return { min, max };
}
