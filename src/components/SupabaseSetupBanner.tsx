import { isSupabaseConfigured } from "../lib/supabase";

export function SupabaseSetupBanner() {
  if (isSupabaseConfigured()) return null;

  return (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/50">
      <p className="mx-auto max-w-6xl text-sm text-amber-950 dark:text-amber-100">
        <strong>Cloud database not connected.</strong> Sign-ups will not sync
        across devices until Supabase is configured. See{" "}
        <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
          SUPABASE_SETUP.md
        </code>{" "}
        in the project folder.
      </p>
    </div>
  );
}
