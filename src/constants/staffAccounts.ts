/** Staff login accounts — created via `npm run seed:staff` (not public sign-up). */
export const STAFF_EMAIL_DOMAIN = "@mindscope.staff.uk";

export interface StaffAccountSeed {
  fullName: string;
  email: string;
  password: string;
}

export const STAFF_ACCOUNTS: StaffAccountSeed[] = [
  {
    fullName: "Glen Ahorble",
    email: "glen.ahorble@mindscope.staff.uk",
    password: "GlenMS#2026A",
  },
  {
    fullName: "Omar Al Sayeed",
    email: "omar.alsayeed@mindscope.staff.uk",
    password: "OmarMS#2026B",
  },
  {
    fullName: "Hussein Omer",
    email: "hussein.omer@mindscope.staff.uk",
    password: "HusseinMS#2026C",
  },
  {
    fullName: "Laila Deeb",
    email: "laila.deeb@mindscope.staff.uk",
    password: "LailaMS#2026D",
  },
  {
    fullName: "Abu Jawad",
    email: "abu.jawad@mindscope.staff.uk",
    password: "AbuMS#2026E",
  },
];

export function isStaffEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(STAFF_EMAIL_DOMAIN);
}
