import { Link } from "react-router-dom";
import { APP_NAME, APP_TAGLINE, IMAGES, WELLNESS_TEST_LABEL } from "../constants/brand";
import { CHECK_IN_QUESTION_COUNT } from "../data/questions";
import { ChatOpenButton } from "../components/ChatWidget";
import { btnPrimaryClass, btnSecondaryClass, cardClass } from "../lib/ui";

const FEATURES = [
  {
    title: `${CHECK_IN_QUESTION_COUNT} wellness dimensions`,
    body: "Sleep, energy, stress, focus, social connection, purpose, confidence, balance, and more.",
    image: IMAGES.wellness,
  },
  {
    title: "Clinical-style insights",
    body: "Automatic wellness score, risk level, pie charts, and trend lines — private to you.",
    image: IMAGES.chart,
  },
  {
    title: "Mind Scope assistant",
    body: "Chat anytime with our supportive AI guide for tips and UK crisis signposting.",
    image: IMAGES.support,
  },
];

export function Home() {
  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-800 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-300">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            {APP_TAGLINE}
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-sage-900 dark:text-white sm:text-5xl">
            Professional mental wellness tracking, built for the UK
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-sage-600 dark:text-slate-400">
            {APP_NAME} helps you understand your wellbeing through structured
            wellness tests across {CHECK_IN_QUESTION_COUNT} key areas — from sleep
            quality to resilience — with clear scores and personal history.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className={`${btnPrimaryClass} px-6 py-3 text-base`}>
              Create free account
            </Link>
            <Link to="/login" className={`${btnSecondaryClass} px-6 py-3 text-base`}>
              Sign in
            </Link>
          </div>

          <p className="mt-4 text-sm text-sage-500 dark:text-slate-500">
            Sign in required for the {WELLNESS_TEST_LABEL.toLowerCase()} · UK crisis resources in footer
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-sage-600 dark:text-slate-400">
            <ChatOpenButton variant="inline" />
            <span aria-hidden>·</span>
            <Link to="/contact" className="font-medium text-teal-700 underline dark:text-teal-400">
              Contact us
            </Link>
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-sage-200/80 dark:ring-slate-700">
          <img
            src={IMAGES.hero}
            alt="Person practising calm breathing in a peaceful setting"
            className="aspect-[4/3] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sage-900/50 to-transparent" />
          <p className="absolute bottom-4 left-4 right-4 text-sm font-medium text-white">
            Evidence-informed dimensions · Private to your account
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {FEATURES.map((item) => (
          <article key={item.title} className={`overflow-hidden ${cardClass}`}>
            <img
              src={item.image}
              alt=""
              className="h-40 w-full object-cover"
            />
            <div className="p-5">
              <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-slate-100">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-sage-600 dark:text-slate-400">
                {item.body}
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
