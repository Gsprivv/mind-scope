import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  calculateBmi,
  getWeightGuidance,
  healthyWeightRangeKg,
  interpretBmi,
  type BmiResult,
  type WeightGoal,
} from "../lib/bmi";
import { getBmiProfile, saveBmiProfile } from "../lib/bmiStorage";
import { getDietitianSignpost } from "../lib/dietitianSignpost";
import { btnPrimaryClass, btnSecondaryClass, cardClass, inputClass } from "../lib/ui";

type Step = "calc" | "goal" | "guidance";

export function BmiHealth() {
  const { user } = useAuth();
  const saved = getBmiProfile();

  const [heightCm, setHeightCm] = useState(
    saved ? String(saved.heightCm) : ""
  );
  const [weightKg, setWeightKg] = useState(
    saved ? String(saved.weightKg) : ""
  );
  const [step, setStep] = useState<Step>("calc");
  const [result, setResult] = useState<BmiResult | null>(null);
  const [goalChoice, setGoalChoice] = useState<WeightGoal | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dietitian = useMemo(
    () =>
      user
        ? getDietitianSignpost(user.postcode, user.city)
        : null,
    [user]
  );

  const range = useMemo(() => {
    const h = parseFloat(heightCm);
    return healthyWeightRangeKg(h);
  }, [heightCm]);

  const guidance = useMemo(() => {
    if (!result || goalChoice === null) return null;
    return getWeightGuidance(result.category, goalChoice);
  }, [result, goalChoice]);

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (Number.isNaN(h) || h < 100 || h > 250) {
      setError("Enter a valid height in cm (100–250).");
      return;
    }
    if (Number.isNaN(w) || w < 30 || w > 300) {
      setError("Enter a valid weight in kg (30–300).");
      return;
    }
    const bmi = calculateBmi(w, h);
    if (bmi === null) {
      setError("Could not calculate BMI.");
      return;
    }
    saveBmiProfile(h, w);
    const interpreted = interpretBmi(bmi);
    setResult(interpreted);
    setGoalChoice(null);
    setStep("goal");
  };

  const startGuidance = (goal: WeightGoal) => {
    setGoalChoice(goal);
    setStep("guidance");
  };

  const reset = () => {
    setStep("calc");
    setResult(null);
    setGoalChoice(null);
    setError(null);
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-sage-900 dark:text-slate-100">
        BMI &amp; nutrition
      </h1>
      <p className="mt-2 text-sage-600 dark:text-slate-400">
        Check your BMI, get general food and exercise ideas, and find how to
        contact a registered dietitian near{" "}
        <strong>{user.city || "you"}</strong>.
      </p>

      <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
        For adults 18+. This is general wellbeing information, not medical
        advice. Speak to your GP before major diet changes, if you are pregnant,
        or if weight is changing quickly without trying.
      </p>

      {step === "calc" && (
        <form
          onSubmit={handleCalculate}
          className={`mt-8 space-y-4 p-6 ${cardClass}`}
        >
          <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-slate-100">
            BMI calculator
          </h2>
          {error && (
            <p className="text-sm text-red-700 dark:text-red-300" role="alert">
              {error}
            </p>
          )}
          <label className="block">
            <span className="text-sm font-medium text-sage-700 dark:text-slate-300">
              Height (cm)
            </span>
            <input
              type="number"
              min={100}
              max={250}
              step={0.1}
              required
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="e.g. 170"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-sage-700 dark:text-slate-300">
              Weight (kg)
            </span>
            <input
              type="number"
              min={30}
              max={300}
              step={0.1}
              required
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="e.g. 72"
              className={inputClass}
            />
          </label>
          {range && (
            <p className="text-sm text-sage-600 dark:text-slate-400">
              Healthy weight range for your height: roughly{" "}
              <strong>
                {range.min}–{range.max} kg
              </strong>
              .
            </p>
          )}
          <button type="submit" className={`w-full ${btnPrimaryClass}`}>
            Calculate my BMI
          </button>
        </form>
      )}

      {step === "goal" && result && (
        <div className={`mt-8 space-y-6 p-6 ${cardClass}`}>
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-sage-500">
              Your BMI
            </p>
            <p className="mt-1 font-display text-5xl font-semibold text-teal-700 dark:text-teal-400">
              {result.bmi}
            </p>
            <p className="mt-2 text-lg font-semibold text-sage-900 dark:text-slate-100">
              {result.label}
            </p>
            <p className="mt-3 text-sm text-sage-600 dark:text-slate-400">
              {result.description}
            </p>
          </div>

          <div className="rounded-xl border border-sage-200 bg-sage-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="font-medium text-sage-900 dark:text-slate-100">
              {result.goalQuestion}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  startGuidance(
                    result.suggestedGoal === "maintain"
                      ? "maintain"
                      : result.suggestedGoal
                  )
                }
                className={btnPrimaryClass}
              >
                Yes, show me tips
              </button>
              <button
                type="button"
                onClick={() => {
                  setGoalChoice("maintain");
                  setStep("guidance");
                }}
                className={btnSecondaryClass}
              >
                No thanks
              </button>
            </div>
            {(result.category === "overweight" ||
              result.category === "obese") && (
              <button
                type="button"
                onClick={() => startGuidance("gain")}
                className="mt-3 block text-sm text-sage-600 underline dark:text-slate-400"
              >
                I actually want to gain weight
              </button>
            )}
            {result.category === "underweight" && (
              <button
                type="button"
                onClick={() => startGuidance("lose")}
                className="mt-3 block text-sm text-sage-600 underline dark:text-slate-400"
              >
                I want to lose weight instead
              </button>
            )}
          </div>

          <button type="button" onClick={reset} className="text-sm text-sage-500 underline">
            Recalculate
          </button>
        </div>
      )}

      {step === "guidance" && result && guidance && (
        <div className="mt-8 space-y-6">
          <div className={`p-6 ${cardClass}`}>
            <h2 className="font-display text-xl font-semibold text-sage-900 dark:text-slate-100">
              Your personalised guide
            </h2>
            <p className="mt-2 text-sm text-sage-600 dark:text-slate-400">
              {guidance.summary}
            </p>
            <p className="mt-2 text-xs text-sage-500">{guidance.disclaimer}</p>

            <section className="mt-6">
              <h3 className="font-semibold text-sage-800 dark:text-slate-200">
                Foods to focus on
              </h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-sage-700 dark:text-slate-300">
                {guidance.foods.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mt-5">
              <h3 className="font-semibold text-sage-800 dark:text-slate-200">
                Limit or avoid
              </h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-sage-700 dark:text-slate-300">
                {guidance.avoidOrLimit.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mt-5">
              <h3 className="font-semibold text-sage-800 dark:text-slate-200">
                Exercise
              </h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-sage-700 dark:text-slate-300">
                {guidance.exercises.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm font-medium text-teal-800 dark:text-teal-300">
                {guidance.frequency.replace(/\*\*/g, "")}
              </p>
            </section>

            <section className="mt-5">
              <h3 className="font-semibold text-sage-800 dark:text-slate-200">
                Extra tips
              </h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-sage-700 dark:text-slate-300">
                {guidance.generalTips.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={reset} className={btnSecondaryClass}>
              Recalculate BMI
            </button>
            <Link to="/dashboard" className={btnSecondaryClass}>
              Dashboard
            </Link>
          </div>
        </div>
      )}

      {dietitian && (
        <section className={`mt-10 p-6 ${cardClass}`}>
          <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-slate-100">
            Dietitian near you
          </h2>
          <p className="mt-2 text-sm text-sage-600 dark:text-slate-400">
            {dietitian.intro.replace(/\*\*/g, "")}
          </p>
          <ul className="mt-4 space-y-4">
            {dietitian.services.map((s) => (
              <li
                key={s.name}
                className="rounded-xl border border-sage-200 p-4 dark:border-slate-700"
              >
                <p className="font-medium text-sage-900 dark:text-slate-100">
                  {s.name}
                </p>
                <p className="mt-1 text-sm text-sage-600 dark:text-slate-400">
                  {s.detail}
                </p>
                <p className="mt-2 text-sm font-semibold text-teal-800 dark:text-teal-300">
                  {s.contact}
                </p>
                {s.href && (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-teal-700 underline dark:text-teal-400"
                  >
                    Open link →
                  </a>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-sage-500 dark:text-slate-500">
            Ask **Mind Scope** chat for weight tips — say e.g. &quot;I am gaining
            weight too fast&quot; or &quot;help me lose weight&quot;.
          </p>
        </section>
      )}
    </div>
  );
}
