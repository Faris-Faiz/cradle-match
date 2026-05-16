"use client";

import { useEffect, useState } from "react";
import { Lightbulb, X } from "lucide-react";

// First-run guidance — a dismissible tip explaining what a screen is for.
// Dismissal is remembered per `id` in localStorage so it shows only once.

export default function OnboardingHint({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  const storageKey = `cm-hint-dismissed:${id}`;
  // Start hidden — reveal only after we confirm it hasn't been dismissed, so
  // the server and first client render agree (no hydration flash).
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // localStorage is only available on the client, so the dismissed state
    // can only be resolved after mount — an intentional one-time sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (localStorage.getItem(storageKey) !== "1") setVisible(true);
  }, [storageKey]);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(storageKey, "1");
    setVisible(false);
  };

  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
        <Lightbulb className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{children}</p>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss tip"
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
