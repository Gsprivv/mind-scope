# Mind Scope staff accounts

Staff use the **same Sign in page** as everyone else. After login they can use the app (dashboard, wellness test, BMI, etc.) and open **Staff admin** from the menu or footer dot.

## One-time setup

1. Run `supabase/staff-migration.sql` in Supabase SQL Editor.
2. Add to `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
   If you already use `VITE_SUPABASE_SECRET_KEY` for the service role key, that works too.
   (Supabase → Project Settings → API → **service_role** secret — not the anon key)
3. Create accounts:
   ```bash
   npm run seed:staff
   ```

## Staff logins

| Name | Email | Password |
|------|-------|----------|
| Glen Ahorble | glen.ahorble@mindscope.staff.uk | GlenMS#2026A |
| Omar Al Sayeed | omar.alsayeed@mindscope.staff.uk | OmarMS#2026B |
| Hussein Omer | hussein.omer@mindscope.staff.uk | HusseinMS#2026C |
| Laila Deeb | laila.deeb@mindscope.staff.uk | LailaMS#2026D |
| Abu Jawad | abu.jawad@mindscope.staff.uk | AbuMS#2026E |

**Change these passwords** after first login in production (Supabase Dashboard → Authentication → Users).

## Staff admin

- Sign in → header **Staff admin** or footer gray dot → **All users** / **All tests**
- When a **staff member** completes a wellness test, it shows a **Staff** badge in the admin test list
- Staff accounts cannot be deleted from the admin panel

## Security

- Do **not** commit `SUPABASE_SERVICE_ROLE_KEY` to Git
- Do **not** share this file publicly with live passwords
