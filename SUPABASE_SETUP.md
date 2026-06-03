# Supabase setup (shared cloud database)

Mind Scope now stores **users, check-ins, and journal entries** in **Supabase** so staff can see **everyone who signs up** from any phone or computer.

---

## Step 1 — Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign up (free tier is fine).
2. Click **New project**.
3. Choose a name, database password, and region (pick **EU** if your users are in the UK).
4. Wait until the project finishes provisioning.

---

## Step 2 — Run the database schema

1. In Supabase, open **SQL Editor** → **New query**.
2. Open the file `supabase/schema.sql` from this project.
3. Copy the **entire** file and paste it into the SQL editor.
4. Click **Run**.

You should see success messages. This creates `profiles`, `check_ins`, `journal_entries`, security rules, and staff functions.

**If you see “policy … already exists”:** the script ran partway before. That is fine — copy the **updated** `supabase/schema.sql` from your project (it now drops policies before creating them) and run it again. Or skip re-running if tables already exist and you only need env keys on Netlify.

---

## Step 3 — Get your API keys

1. In Supabase go to **Project Settings** → **API**.
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

## Step 4 — Add keys locally

Create a file `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Restart the dev server after saving:

```bash
npm run dev
```

---

## Step 5 — Add keys on Netlify (required for live site)

1. Netlify → your site → **Site configuration** → **Environment variables**.
2. Add the same two variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Trigger a new deploy** (Deploys → Trigger deploy → Deploy site).

Without these on Netlify, the live app cannot connect to the database.

---

## Step 6 — Disable email confirmation (recommended for demo)

By default Supabase may require email confirmation before login works.

1. Supabase → **Authentication** → **Providers** → **Email**.
2. Turn **off** “Confirm email” (or enable only when you are ready for production).
3. Save.

---

## Step 7 — Deploy password reset function (optional but recommended)

The login page “reset password with telephone” feature uses a Supabase Edge Function.

1. Install Supabase CLI: [https://supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)
2. In Terminal:

```bash
cd "/Users/gs-privv/App Project"
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy password-reset
```

The function uses your project’s service role key automatically when deployed.

---

## Step 8 — Test

1. Run `npm run build` and deploy to Netlify (or use `npm run dev` locally).
2. On **phone A**: sign up a new account.
3. On **laptop**: open staff (footer dot) → code **101278** → **All users**.
4. You should see the account from phone A.

---

## Staff access

- Staff code is still **101278** (change it in `supabase/schema.sql` in all `staff_code_valid` / staff functions, and in `src/constants/staff.ts`).
- Staff sees all users and all check-ins from the **cloud**, not from each device’s browser storage.

---

## What changed

| Before | After |
|--------|--------|
| Data in each browser’s localStorage | One shared Supabase database |
| Staff only saw local sign-ups | Staff sees all sign-ups everywhere |
| Passwords visible in staff table | Passwords handled by Supabase Auth (not shown) |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Yellow banner “Cloud database not connected” | Add `.env.local` keys or Netlify env vars and redeploy |
| Sign up works but login fails | Disable email confirmation in Supabase Auth |
| Staff shows “Invalid staff code” | Code must be **101278** unless you changed the SQL |
| Password reset fails | Deploy the `password-reset` edge function |
| Old accounts missing | Old localStorage accounts do not migrate automatically — users sign up again |

---

## Security note

This is suitable for a demo or pilot. For a real mental-health product you should also add a privacy policy, proper consent, audit logging, and professional security review.
