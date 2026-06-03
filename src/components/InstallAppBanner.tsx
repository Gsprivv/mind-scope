import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone);
    setIsStandalone(!!standalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isStandalone || dismissed || !deferred) return null;

  const install = async () => {
    await deferred.prompt();
    setDeferred(null);
    setDismissed(true);
  };

  return (
    <div className="border-b border-teal-200 bg-teal-50 px-4 py-3 dark:border-teal-900 dark:bg-teal-950/50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src="/icons/icon-192.png"
            alt=""
            className="h-10 w-10 rounded-xl shadow-sm"
          />
          <p className="text-sm text-teal-900 dark:text-teal-100">
            <strong>Install Mind Scope</strong> — add the app icon to your home
            screen for quick access.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={install}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Install app
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-lg px-3 py-2 text-sm text-teal-800 dark:text-teal-300"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
