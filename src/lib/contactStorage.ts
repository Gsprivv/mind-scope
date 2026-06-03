export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
}

const KEY = "mindful_check_contact_messages";

export function getContactMessages(): ContactMessage[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ContactMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveContactMessage(msg: ContactMessage): void {
  const all = getContactMessages();
  localStorage.setItem(KEY, JSON.stringify([msg, ...all]));
}
