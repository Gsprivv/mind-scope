export const PREMIUM_MONTHLY_PRICE = "£2.99";
export const PREMIUM_YEARLY_PRICE = "£19.99";
export const PREMIUM_MONTHLY_AMOUNT = 299;
export const PREMIUM_YEARLY_AMOUNT = 1999;

export type SubscriptionPlan = "monthly" | "yearly";

export const PREMIUM_FEATURES = [
  "Full wellness history & charts",
  "Deep insights, patterns & advice",
  "Weekly wellness reports",
  "Year-on-year improvement tracking",
  "7-day score improvement plans",
  "BMI nutrition tips & personalised guides",
  "7-day BMI improvement plans",
  "Dietitian signposting & coaching tips",
] as const;

export const FREE_FEATURES = [
  "Take the wellness test & see your score",
  "Latest result on your dashboard",
  "BMI calculator & category",
  "Journal & account management",
] as const;
