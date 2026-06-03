import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatDateUK } from "../lib/formatDate";
import {
  createJournalEntry,
  fetchJournalForUser,
  removeJournalEntry,
} from "../lib/db/journal";
import { btnPrimaryClass, cardClass, inputClass } from "../lib/ui";
import type { JournalEntry } from "../types";

const MOOD_TAGS = [
  "Calm",
  "Anxious",
  "Low",
  "Hopeful",
  "Stressed",
  "Grateful",
  "Tired",
  "Energised",
];

export function Journal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [moodTag, setMoodTag] = useState(MOOD_TAGS[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchJournalForUser(user.id)
      .then(setEntries)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load journal.")
      )
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const refresh = () => {
    fetchJournalForUser(user.id).then(setEntries).catch(() => undefined);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);

    try {
      await createJournalEntry({
        userId: user.id,
        title: title.trim() || "Journal entry",
        body: body.trim(),
        moodTag,
        createdAt: new Date().toISOString(),
      });
      setTitle("");
      setBody("");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save entry.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this journal entry?")) return;
    try {
      await removeJournalEntry(id);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete entry.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sage-900 dark:text-slate-100">
            Journal
          </h1>
          <p className="mt-1 text-sage-600 dark:text-slate-400">
            Private reflections — combined with check-ins for richer Mind Scope
            insights.
          </p>
        </div>
        <Link to="/history" className="text-sm font-medium text-teal-700 underline dark:text-teal-400">
          View analytics →
        </Link>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className={`mt-8 space-y-4 p-6 ${cardClass}`}>
        <label className="block">
          <span className="text-sm font-medium text-sage-700 dark:text-slate-300">Title (optional)</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="e.g. After a difficult day"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-sage-700 dark:text-slate-300">How are you feeling?</span>
          <select
            value={moodTag}
            onChange={(e) => setMoodTag(e.target.value)}
            className={inputClass}
          >
            {MOOD_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-sage-700 dark:text-slate-300">Entry</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            required
            className={`${inputClass} resize-none`}
            placeholder="Write freely — this is private to you."
          />
        </label>
        <button type="submit" className={btnPrimaryClass}>
          Save entry
        </button>
      </form>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-sage-900 dark:text-slate-100">
          Your entries
        </h2>
        {loading ? (
          <p className="mt-4 text-sm text-sage-500">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="mt-4 text-sm text-sage-500 dark:text-slate-400">
            No journal entries yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {entries.map((entry) => (
              <li key={entry.id} className={`p-5 ${cardClass}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sage-900 dark:text-slate-100">
                      {entry.title}
                    </p>
                    <p className="text-xs text-sage-500 dark:text-slate-400">
                      {formatDateUK(entry.createdAt)} · {entry.moodTag}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="text-xs text-red-700 underline dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-sage-700 dark:text-slate-300">
                  {entry.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
