"use client";

// Global snackbar notifications. Mount <SnackbarHost /> once in the app shell,
// then push toasts from anywhere with pushSnackbar(type, title, message).

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, Info, ShieldAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SnackbarType = "success" | "error" | "info" | "warning";

export interface SnackbarItem {
  id: string;
  type: SnackbarType;
  title: string;
  message: string;
  timestamp: string;
}

// ── Store (module-level, no external state library) ───────────────────────────

const DISMISS_AFTER_MS = 4000;

// A stable empty array keeps useSyncExternalStore's server snapshot referentially constant.
const EMPTY: SnackbarItem[] = [];

let items: SnackbarItem[] = EMPTY;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function dismissSnackbar(id: string) {
  items = items.filter((item) => item.id !== id);
  emit();
}

export function pushSnackbar(type: SnackbarType, title: string, message: string) {
  const id = crypto.randomUUID();
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  items = [...items, { id, type, title, message, timestamp }];
  emit();
  setTimeout(() => dismissSnackbar(id), DISMISS_AFTER_MS);
}

// ── Theme ─────────────────────────────────────────────────────────────────────

const THEME: Record<
  SnackbarType,
  {
    icon: typeof CheckCircle2;
    text: string;
    bar: string;
    iconBg: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    text: "text-primary",
    bar: "bg-primary",
    iconBg: "bg-primary/10",
  },
  error: {
    icon: AlertTriangle,
    text: "text-destructive",
    bar: "bg-destructive",
    iconBg: "bg-destructive/10",
  },
  info: {
    icon: Info,
    text: "text-blue-600",
    bar: "bg-blue-500",
    iconBg: "bg-blue-500/10",
  },
  warning: {
    icon: ShieldAlert,
    text: "text-amber-600",
    bar: "bg-amber-500",
    iconBg: "bg-amber-500/10",
  },
};

// ── Countdown bar ─────────────────────────────────────────────────────────────

// A keyframe (rather than a transition off a state flip) guarantees the bar
// animates on mount — a transition can be skipped if the browser batches the
// first paint. Injected once by SnackbarHost.
const COUNTDOWN_KEYFRAMES = `@keyframes snackbar-countdown {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}`;

// Sits at the top of each snack, standing in for a coloured accent border.
function CountdownBar({ theme }: { theme: (typeof THEME)[SnackbarType] }) {
  return (
    <div className="h-1 w-full overflow-hidden bg-muted">
      <div
        className={cn("h-full w-full origin-left", theme.bar)}
        style={{ animation: `snackbar-countdown ${DISMISS_AFTER_MS}ms linear forwards` }}
      />
    </div>
  );
}

// ── Snacks ────────────────────────────────────────────────────────────────────

function DesktopSnack({ item }: { item: SnackbarItem }) {
  const theme = THEME[item.type];
  const Icon = theme.icon;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-auto relative w-80 overflow-hidden rounded-xl border border-border bg-card/95 shadow-xl backdrop-blur-md transition-all duration-300 ease-out",
        visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0",
      )}
    >
      <CountdownBar theme={theme} />
      <div className="flex w-full items-start gap-3 p-4">
        <Icon className={cn("mt-0.5 size-5 shrink-0", theme.text)} />
        <div className="flex-1 pr-2">
          <div className="mb-1 flex items-center justify-between">
            <h4 className="text-xs font-bold tracking-wider text-foreground uppercase">
              {item.title}
            </h4>
            <span className="font-mono text-[9px] text-muted-foreground">
              {item.timestamp}
            </span>
          </div>
          <p className="text-[11px] leading-snug text-muted-foreground">
            {item.message}
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => dismissSnackbar(item.id)}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

function MobileSnack({ item }: { item: SnackbarItem }) {
  const theme = THEME[item.type];
  const Icon = theme.icon;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-auto relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg transition-all duration-300 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
    >
      <CountdownBar theme={theme} />
      <div className="flex w-full items-center gap-3 p-3">
        <div className={cn("shrink-0 rounded-full p-1.5", theme.iconBg, theme.text)}>
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-xs leading-tight font-bold text-foreground">
            {item.title}
          </h4>
          <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
            {item.message}
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          className="-mr-2 p-2 text-muted-foreground"
          onClick={() => dismissSnackbar(item.id)}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

// ── Host ──────────────────────────────────────────────────────────────────────

export function SnackbarHost() {
  const snacks = useSyncExternalStore(
    subscribe,
    () => items,
    () => EMPTY,
  );
  // createPortal needs document — stays false through SSR and the first paint.
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!isClient) return null;

  return createPortal(
    <>
      <style>{COUNTDOWN_KEYFRAMES}</style>
      <div className="pointer-events-none fixed right-6 bottom-6 z-50 hidden flex-col-reverse gap-3 sm:flex">
        {snacks.map((item) => (
          <DesktopSnack key={item.id} item={item} />
        ))}
      </div>
      <div className="pointer-events-none fixed right-4 bottom-4 left-4 z-50 flex flex-col-reverse gap-2 sm:hidden">
        {snacks.map((item) => (
          <MobileSnack key={item.id} item={item} />
        ))}
      </div>
    </>,
    document.body,
  );
}
