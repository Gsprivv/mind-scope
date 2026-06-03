import { requireSupabase } from "../supabase";
import { profileToUser, type ProfileRow } from "./mappers";
import type { User } from "../../types";
import { normalizeUser } from "../users";

export async function getAccountStatus(
  email: string
): Promise<"active" | "deactivated" | null> {
  const { data, error } = await requireSupabase().rpc("get_account_status", {
    p_email: email.trim().toLowerCase(),
  });
  if (error) throw error;
  if (data === "active" || data === "deactivated") return data;
  return null;
}

export async function resetPasswordWithPhone(
  email: string,
  telephone: string,
  newPassword: string
): Promise<string | null> {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return "Cloud database is not configured.";

  const response = await fetch(`${url}/functions/v1/password-reset`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, telephone, newPassword }),
  });

  const payload = (await response.json()) as { error?: string };
  if (!response.ok) {
    return payload.error ?? "Could not reset password.";
  }
  return null;
}

export async function fetchProfileById(userId: string): Promise<User | null> {
  const { data, error } = await requireSupabase()
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeUser(profileToUser(data as ProfileRow)) : null;
}

export async function fetchProfileByEmail(
  email: string
): Promise<User | null> {
  const { data, error } = await requireSupabase()
    .from("profiles")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeUser(profileToUser(data as ProfileRow)) : null;
}

export async function staffFetchAllProfiles(): Promise<User[]> {
  const { data, error } = await requireSupabase().rpc("staff_list_profiles");

  if (error) throw error;
  return ((data as ProfileRow[]) ?? []).map((row) =>
    normalizeUser(profileToUser(row))
  );
}

export async function staffSetProfileStatus(
  userId: string,
  status: "active" | "deactivated"
): Promise<void> {
  const { error } = await requireSupabase().rpc("staff_set_profile_status", {
    p_user_id: userId,
    p_status: status,
  });
  if (error) throw error;
}

export async function staffDeleteUser(userId: string): Promise<void> {
  const { error } = await requireSupabase().rpc("staff_delete_user", {
    p_user_id: userId,
  });
  if (error) throw error;
}

export async function updateOwnContact(
  email: string,
  telephone: string
): Promise<User> {
  const client = requireSupabase();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPhone = telephone.trim();

  const { error: authError } = await client.auth.updateUser({
    email: trimmedEmail,
  });
  if (authError && !authError.message.includes("confirmation")) {
    throw authError;
  }

  const { data, error } = await client.rpc("update_own_contact", {
    p_email: trimmedEmail,
    p_telephone: trimmedPhone,
  });
  if (error) throw error;
  return normalizeUser(profileToUser(data as ProfileRow));
}

export async function deactivateOwnAccount(): Promise<void> {
  const { error } = await requireSupabase().rpc("deactivate_own_account");
  if (error) throw error;
}

export async function deleteOwnAccount(): Promise<void> {
  const { error } = await requireSupabase().rpc("delete_own_account");
  if (error) throw error;
}

export async function verifyProfilePhone(
  email: string,
  telephone: string
): Promise<boolean> {
  const { data, error } = await requireSupabase().rpc("verify_profile_phone", {
    p_email: email.trim().toLowerCase(),
    p_telephone: telephone,
  });
  if (error) throw error;
  return Boolean(data);
}
