import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CHECK_IN_QUESTIONS,
  CHECK_IN_QUESTION_COUNT,
  computeWellnessScore,
} from "../data/questions";
import { WELLNESS_TEST_COMPLETE, WELLNESS_TEST_LABEL } from "../constants/brand";
import { CheckInDraftDialog } from "../components/CheckInDraftDialog";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../hooks/useSubscription";
import { useUserCheckIns } from "../hooks/useUserCheckIns";
import {
  assessCrisisFromCheckIn,
  getCrisisGuidance,
} from "../lib/analytics";
import {
  clearCheckInDraft,
  hasMeaningfulDraft,
  loadCheckInDraft,
  saveCheckInDraft,
  type CheckInDraft,
} from "../lib/checkInDraft";
import { createCheckIn } from "../lib/db/checkIns";
import { getRiskInfo, getRiskLevel } from "../lib/risk";
import { getDisplayName } from "../lib/users";
import { btnPrimaryClass, btnSecondaryClass, inputClass } from "../lib/ui";
import type { CheckIn as CheckInRecord, QuestionAnswer } from "../types";

const SCALE = [1, 2, 3, 4, 5] as const;
const SLEEP_HOURS_STEP = CHECK_IN_QUESTION_COUNT;
const TOTAL_STEPS = CHECK_IN_QUESTION_COUNT + 1;

type DraftPrompt = "resume" | "cancel" | null;

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
  const [draftPrompt, setDraftPrompt] = useState<DraftPrompt>(null);
  const [draftChecked, setDraftChecked] = useState(false);
  const { checkIns, reload } = useUserCheckIns(user?.id);
  const { isPremium } = useSubscription();

  const persistDraft = useCallback(() => {
    if (!user) return;
    saveCheckInDraft({
      userId: user.id,
      step,
      answers,
      sleepHours,
      note,
      savedAt: new Date().toISOString(),
    });
  }, [user, step, answers, sleepHours, note]);

  const applyDraft = useCallback((draft: CheckInDraft) => {
    setStep(Math.min(Math.max(0, draft.step), SLEEP_HOURS_STEP));
    setAnswers(draft.answers ?? {});
    setSleepHours(draft.sleepHours ?? "7");
    setNote(draft.note ?? "");
  }, []);

  const resetTest = useCallback(() => {
    setStep(0);
    setAnswers({});
    setSleepHours("7");
    setNote("");
    setSaveError(null);
    clearCheckInDraft();
  }, []);

  useEffect(() => {
    if (!user || draftChecked) return;
    const draft = loadCheckInDraft(user.id);
    setDraftChecked(true);
    if (hasMeaningfulDraft(draft)) {
      setDraftPrompt("resume");
    }
  }, [user, draftChecked]);

  useEffect(() => {
    if (!user || submitted || draftPrompt === "resume") return;
    if (Object.keys(answers).length > 0 || step > 0 || note.trim()) {
      persistDraft();
    }
  }, [user, step, answers, sleepHours, note, submitted, draftPrompt, persistDraft]);

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

  const handleCancel = () => {
    const draft = loadCheckInDraft(user.id);
    if (hasMeaningfulDraft(draft) || Object.keys(answers).length > 0 || step > 0) {
      persistDraft();
      setDraftPrompt("cancel");
      return;
    }
    navigate("/dashboard");
  };

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
      clearCheckInDraft();
      reload();
      setSubmitted(saved);
      setShowHistoryPrompt(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Could not save check-in.";
      setSaveError(message);
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
          {WELLNESS_TEST_COMPLETE}
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
            {isPremium ? "View your insights?" : "Want deeper insights?"}
          </h2>
          <p className="mt-2 text-sm text-sage-600 dark:text-slate-400">
            {isPremium
              ? "See patterns, your mood timeline story, coping profile, and charts."
              : "Premium unlocks charts, weekly reports, advice, and 7-day improvement plans from £2.99/month."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to={isPremium ? "/history" : "/premium"}
              className={`flex-1 text-center ${btnPrimaryClass}`}
            >
              {isPremium ? "Yes, view insights" : "Upgrade to Premium"}
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
  const savedDraft = loadCheckInDraft(user.id);

  return (
    <div className="mx-auto max-w-xl">
      {draftPrompt === "resume" && savedDraft && (
        <CheckInDraftDialog
          title="Continue your test?"
          message="You have an unfinished wellness test saved on this device. Would you like to pick up where you left off or start fresh?"
          onContinue={() => {
            applyDraft(savedDraft);
            setDraftPrompt(null);
          }}
          onStartOver={() => {
            resetTest();
            setDraftPrompt(null);
          }}
        />
      )}

      {draftPrompt === "cancel" && (
        <CheckInDraftDialog
          title="Leave the test?"
          message="Your answers are saved on this device. Continue this test, start from the beginning, or leave and come back later."
          onContinue={() => setDraftPrompt(null)}
          onStartOver={() => {
            resetTest();
            setDraftPrompt(null);
          }}
          onDismiss={() => {
            persistDraft();
            setDraftPrompt(null);
            navigate("/dashboard");
          }}
          dismissLabel="Leave for now (save progress)"
        />
      )}

      <h1 className="font-display text-2xl font-semibold text-sage-900 dark:text-slate-100">
        {WELLNESS_TEST_LABEL}
      </h1>
      <p className="mt-1 text-sm text-sage-600 dark:text-slate-400">
        Answer each question honestly — there are no right or wrong answers.
      </p>
      <p className="mb-4 mt-3 text-sm text-sage-500 dark:text-slate-400">
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

      {previousCount === 0 && step === 0 && !hasMeaningfulDraft(savedDraft) && (
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
              {saving ? "Saving…" : "Finish test & get my score"}
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
        onClick={handleCancel}
        className="mt-4 w-full text-center text-sm text-sage-500 hover:text-sage-700 dark:text-slate-500"
      >
        Cancel
      </button>
    </div>
  );
}
