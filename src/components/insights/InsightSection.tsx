import type { ReactNode } from "react";
import { cardClass } from "../../lib/ui";

export function InsightSection({
  title,
  subtitle,
  children,
  variant = "default",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  variant?: "default" | "warning" | "estimate";
}) {
  const border =
    variant === "warning"
      ? "border-amber-200 dark:border-amber-900"
      : variant === "estimate"
        ? "border-teal-200 dark:border-teal-900"
        : "";

  return (
    <section className={`p-6 ${cardClass} ${border}`}>
      <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-slate-100">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm text-sage-600 dark:text-slate-400">
          {subtitle}
        </p>
      )}
      <div className="mt-4 text-sm leading-relaxed text-sage-700 dark:text-slate-300">
        {children}
      </div>
    </section>
  );
}

export function InsightParagraph({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-sage-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}
