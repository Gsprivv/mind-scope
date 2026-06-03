import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

loadEnvLocal();

const url = process.env.VITE_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SECRET_KEY;

const STAFF_LOCATION = { city: "Hayes", postcode: "UB3 3BB" };

const STAFF = [
  {
    fullName: "Glen Ahorble",
    email: "glen.ahorble@mindscope.staff.uk",
    password: "GlenMS#2026A",
    dateOfBirth: "2007-01-15",
  },
  {
    fullName: "Omar Al Sayeed",
    email: "omar.alsayeed@mindscope.staff.uk",
    password: "OmarMS#2026B",
    dateOfBirth: "2006-01-15",
  },
  {
    fullName: "Hussein Omer",
    email: "hussein.omer@mindscope.staff.uk",
    password: "HusseinMS#2026C",
    dateOfBirth: "2007-01-15",
  },
  {
    fullName: "Laila Deeb",
    email: "laila.deeb@mindscope.staff.uk",
    password: "LailaMS#2026D",
    dateOfBirth: "2005-01-15",
  },
  {
    fullName: "Abu Jawad",
    email: "abu.jawad@mindscope.staff.uk",
    password: "AbuMS#2026E",
    dateOfBirth: "2007-01-15",
  },
];

if (!url || !serviceKey) {
  console.error(
    "Missing Supabase admin key in .env.local. You need BOTH:\n" +
      "  VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co\n" +
      "  SUPABASE_SERVICE_ROLE_KEY=...   (or VITE_SUPABASE_SECRET_KEY=...)\n\n" +
      "Get the **service_role** (secret) key from Supabase → Project Settings → API.\n" +
      "Do NOT use the anon/publishable key — seed will fail with invalid JWT."
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

for (const staff of STAFF) {
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("email", staff.email)
    .maybeSingle();

  const profilePatch = {
    is_staff: true,
    full_name: staff.fullName,
    date_of_birth: staff.dateOfBirth,
    city: STAFF_LOCATION.city,
    postcode: STAFF_LOCATION.postcode,
  };

  if (existing?.id) {
    await admin.from("profiles").update(profilePatch).eq("id", existing.id);
    await admin.auth.admin.updateUserById(existing.id, {
      password: staff.password,
      user_metadata: {
        full_name: staff.fullName,
        is_staff: true,
        date_of_birth: staff.dateOfBirth,
        city: STAFF_LOCATION.city,
        postcode: STAFF_LOCATION.postcode,
      },
    });
    console.log(`Updated staff: ${staff.fullName}`);
    continue;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: staff.email,
    password: staff.password,
    email_confirm: true,
    user_metadata: {
      full_name: staff.fullName,
      date_of_birth: staff.dateOfBirth,
      telephone: "07000000000",
      city: STAFF_LOCATION.city,
      postcode: STAFF_LOCATION.postcode,
      is_staff: true,
    },
  });

  if (error) {
    console.error(`Failed ${staff.fullName}:`, error.message);
    continue;
  }

  await admin.from("profiles").update(profilePatch).eq("id", data.user.id);

  console.log(`Created staff: ${staff.fullName} (${staff.email})`);
}

console.log("\nDone. Staff sign in at /login with the emails above.");
