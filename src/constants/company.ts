export const COMPANY = {
  name: "Mind Scope",
  legalName: "Mind Scope Ltd",
  tagline: "Mental wellness check-ins for the UK",
  email: "support@mindscope.co.uk",
  phone: "+44 20 7946 0958",
  phoneDisplay: "020 7946 0958",
  address: "71-75 Shelton Street, London, WC2H 9JQ, United Kingdom",
  officeHours: "Monday–Friday, 9:00–17:00 (UK time)",
} as const;

export const UK_EMERGENCY = [
  {
    name: "Emergency services",
    detail: "Life-threatening emergency",
    contact: "999",
    href: "tel:999",
  },
  {
    name: "Samaritans",
    detail: "Free, 24/7 emotional support",
    contact: "116 123",
    href: "tel:116123",
  },
  {
    name: "NHS 111",
    detail: "Urgent medical advice (England)",
    contact: "111",
    href: "tel:111",
  },
  {
    name: "Shout",
    detail: "Free 24/7 text support",
    contact: "Text SHOUT to 85258",
    href: "https://giveusashout.org/",
  },
  {
    name: "Mind Infoline",
    detail: "Mental health information & support",
    contact: "0300 123 3393",
    href: "tel:03001233393",
  },
] as const;

export const UK_LOCALE = "en-GB";
