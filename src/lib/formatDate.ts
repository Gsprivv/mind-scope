import { UK_LOCALE } from "../constants/company";

export function formatDateUK(iso: string): string {
  return new Date(iso).toLocaleDateString(UK_LOCALE, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTimeUK(iso: string): string {
  return new Date(iso).toLocaleString(UK_LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
