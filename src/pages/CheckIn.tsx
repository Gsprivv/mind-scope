import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CHECK_IN_QUESTIONS,
  CHECK_IN_QUESTION_COUNT,
  computeWellnessScore,
} from "../data/questions";
import { useAuth } from "../context/AuthContext";
import { useUserCheckIns } from "../hooks/useUserCheckIns";
import {
  assessCrisisFromCheckIn,
  getCrisisGuidance,
} from "../lib/analytics";
import { createCheckIn } from "../lib/db/checkIns";
import { getRiskInfo, getRiskLevel } from "../lib/risk";
import { getDisplayName } from "../lib/users";
import { btnPrimaryClass, btnSecondaryClass, inputClass } from "../lib/ui";
import type { CheckIn as CheckInRecord, QuestionAnswer } from "../types";

const SCALE = [1, 2, 3, 4, 5] as const;
const SLEEP_HOURS_STEP = CHECK_IN_QUESTION_COUNT;
const TOTAL_STEPS = CHECK_IN_QUESTION_COUNT + 1;

export function CheckIn() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [sleepHours, setSleepHours] = useState<string>("7");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState<CheckInRecord | null>(null);
  const [showHistoryPrompt, setShowHistoryPrompt] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { checkIns, reload } = useUserCheckIns(user?.id);

  if (!user) return null;

  const isSleepStep = step === SLEEP_HOURS_STEP;
  const question = !isSleepStep ? CHECK_IN_QUESTIONS[step] : null;
  const isLast = isSleepStep;
  const allAnswered = CHECK_IN_QUESTIONS.every((q) => answers[q.id] != null);

  const setAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const goNext = () => {
    if (isSleepStep) return;
    if (answers[question!.id] == null) return;
    setStep((s) => s + 1);
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const handleFinish = async (e: FormEvent) => {
    e.preventDefault();
    if (!allAnswered || saving) return;

    const hours = parseFloat(sleepHours);
    if (Number.isNaN(hours) || hours < 0 || hours > 24) return;

    const answerList: QuestionAnswer[] = CHECK_IN_QUESTIONS.map((q) => ({
      questionId: q.id,
      value: answers[q.id],
    }));

    const score = computeWellnessScore(answerList);
    const riskLevel = getRiskLevel(score);
    const record: CheckInRecord = {
      id: crypto.randomUUID(),
      userId: user.id,
      answers: answerList,
      note: note.trim(),
      score,
      riskLevel,
      sleepHours: Math.round(hours * 10) / 10,
      completedAt: new Date().toISOString(),
    };

    setSaving(true);
    setSaveError(null);
    try {
      const saved = await createCheckIn(record);
      reload();
      setSubmitted(saved);
      setShowHistoryPrompt(true);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not save check-in."
      );
    } finally {
      setSaving(false);
    }
  };

  if (submitted && showHistoryPrompt) {
    const risk = getRiskInfo(submitted.score);
    const crisis = assessCrisisFromCheckIn(submitted);
    const crisisLines =
      crisis !== "none" ? getCrisisGuidance(crisis, user) : [];

    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-sage-500 dark:text-slate-400">
          Check-in complete
        </p>
        <p className="mt-2 font-display text-5xl font-semibold text-sage-800 dark:text-slate-100">
          {submitted.score}%
        </p>
        <p
          className={`mt-4 inline-block rounded-full border px-4 py-2 text-lg font-semibold ${risk.colorClass}`}
        >
          {risk.label}
        </p>
        <p className="mt-4 text-sage-600 dark:text-slate-400">{risk.description}</p>

        {crisisLines.length > 0 && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            <p className="font-semibold">We recommend reaching out for support</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {crisisLines.map((line, i) => (
                <li key={i}>{line.replace(/\*\*/g, "")}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-sage-200 bg-white p-6 text-left shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-slate-100">
            View your insights?
          </h2>
          <p className="mt-2 text-sm text-sage-600 dark:text-slate-400">
            See patterns, your mood timeline story, coping profile, and charts.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/history" className={`flex-1 text-center ${btnPrimaryClass}`}>
              Yes, view insights
            </Link>
            <Link to="/dashboard" className={`flex-1 text-center ${btnSecondaryClass}`}>
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((step + 1) / TOTAL_STEPS) * 100;
  const previousCount = checkIns.length;

  return (
    <div className="mx-auto max-w-xl">
      <p className="mb-4 text-sm text-sage-500 dark:text-slate-400">
        Signed in as {getDisplayName(user)}
      </p>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-sage-500 dark:text-slate-400">
          <span>
            Step {step + 1} of {TOTAL_STEPS}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sage-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-teal-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {previousCount === 0 && step === 0 && (
        <p className="mb-4 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-900 dark:bg-teal-950/50 dark:text-teal-200">
          {CHECK_IN_QUESTION_COUNT} wellbeing dimensions plus sleep hours — then
          your score and Mind Scope insights.
        </p>
      )}

      <form onSubmit={isLast ? handleFinish : (e) => e.preventDefault()}>
        {isSleepStep ? (
          <fieldset>
            <legend className="font-display text-2xl font-semibold leading-snug text-sage-900 dark:text-slate-100">
              How many hours did you sleep last night?
            </legend>
            <p className="mt-2 text-sm text-sage-600 dark:text-slate-400">
              Include total time asleep (can include naps). Enter 0–24.
            </p>
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              required
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              className={`${inputClass} mt-4 max-w-[140px] text-center text-2xl font-semibold`}
            />
            <span className="ml-2 text-sage-600 dark:text-slate-400">hours</span>

            <label className="mt-8 block">
              <span className="text-sm font-medium text-sage-700 dark:text-slate-300">
                Journal note (optional)
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Anything on your mind today…"
                className={`${inputClass} resize-none`}
              />
            </label>
          </fieldset>
        ) : (
          <fieldset>
            <legend className="font-display text-2xl font-semibold leading-snug text-sage-900 dark:text-slate-100">
              {question!.text}
            </legend>
            <div className="mt-6 flex justify-between text-xs text-sage-500 dark:text-slate-400">
              <span>{question!.lowLabel}</span>
              <span>{question!.highLabel}</span>
            </div>
            <div className="mt-3 flex gap-2 sm:gap-3">
              {SCALE.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAnswer(question!.id, n)}
                  className={`flex h-12 flex-1 items-center justify-center rounded-xl border text-lg font-semibold transition-colors sm:h-14 ${
                    answers[question!.id] === n
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-sage-200 bg-white text-sage-700 hover:border-teal-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                  aria-pressed={answers[question!.id] === n}
                >
                  {n}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button type="button" onClick={goBack} className={btnSecondaryClass}>
              Back
            </button>
          )}
          {!isLast ? (
            <button
              type="button"
              onClick={goNext}
              disabled={answers[question!.id] == null}
              className={`flex-1 ${btnPrimaryClass} disabled:opacity-50`}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={!allAnswered || saving}
              className={`flex-1 ${btnPrimaryClass} disabled:opacity-50`}
            >
              {saving ? "Saving…" : "Finish & get my score"}
            </button>
          )}
        </div>
        {saveError && (
          <p className="mt-3 text-sm text-red-700 dark:text-red-300" role="alert">
            {saveError}
          </p>
        )}
      </form>

      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="mt-4 w-full text-center text-sm text-sage-500 hover:text-sage-700 dark:text-slate-500"
      >
        Cancel
      </button>
    </div>
  );
}
