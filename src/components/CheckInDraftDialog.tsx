import { btnPrimaryClass, btnSecondaryClass, cardClass } from "../lib/ui";

interface CheckInDraftDialogProps {
  title: string;
  message: string;
  onContinue: () => void;
  onStartOver: () => void;
  onDismiss?: () => void;
  dismissLabel?: string;
}

export function CheckInDraftDialog({
  title,
  message,
  onContinue,
  onStartOver,
  onDismiss,
  dismissLabel = "Stay on this page",
}: CheckInDraftDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-sage-900/50 p-4 backdrop-blur-sm dark:bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="draft-dialog-title"
    >
      <div className={`w-full max-w-md p-6 ${cardClass}`}>
        <h2
          id="draft-dialog-title"
          className="font-display text-xl font-semibold text-sage-900 dark:text-slate-100"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-sage-600 dark:text-slate-400">{message}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={onContinue} className={`flex-1 ${btnPrimaryClass}`}>
            Continue where I left off
          </button>
          <button type="button" onClick={onStartOver} className={`flex-1 ${btnSecondaryClass}`}>
            Start over
          </button>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="mt-4 w-full text-center text-sm text-sage-500 underline dark:text-slate-400"
          >
            {dismissLabel}
          </button>
        )}
      </div>
    </div>
  );
}
