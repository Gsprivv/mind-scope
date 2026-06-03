/** Change this to rename the app across the site, PWA, and native builds. */
export const APP_NAME = "Mind Scope";

export const CHATBOT_NAME = "Mind Scope";

export const APP_TAGLINE =
  "Professional mental wellness tracking for the UK";

/** Plain-language labels for the wellness questionnaire (route stays /check-in). */
export const WELLNESS_TEST_LABEL = "Wellness test";
export const WELLNESS_TEST_ACTION = "Take wellness test";
export const WELLNESS_TEST_COMPLETE = "Wellness test complete";
export const STREAK_LABEL = "Day streak";

export function wellnessTestCountLabel(count: number): string {
  if (count === 0) return "No tests completed yet";
  return `${count} test${count === 1 ? "" : "s"} completed`;
}

export const APP_DESCRIPTION =
  `${APP_NAME} — UK mental wellness check-ins, ${CHATBOT_NAME} assistant, and crisis resources.`;

export const IMAGES = {
  hero: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80",
  wellness: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
  calm: "https://images.unsplash.com/photo-1499203537755-3ce26f7e9c7b?w=800&q=80",
  support: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
  chart: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
} as const;
