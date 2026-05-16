"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, CircleHelp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Workspace top bar — part of the dark console frame. Identifies the active
// workspace and exposes the signed-in user.

export default function TopBar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-gray-900 px-6">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span className="text-sm font-medium text-gray-100">
          Programme Operations
        </span>
        <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-gray-400">
          2026 Cohort
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            aria-label="Help"
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-100"
          >
            <CircleHelp className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>
            Hover the <span className="font-medium">?</span> icons anywhere for
            plain-language explanations.
          </TooltipContent>
        </Tooltip>

        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-gray-800 focus:outline-none"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
              L
            </div>
            <span className="text-sm font-medium text-gray-100">Labubu</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-gray-500 transition-transform ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  L
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    Labubu
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    labubu@cradle.my
                  </p>
                </div>
              </div>
              <div className="px-4 py-3">
                <p className="section-label mb-1">Signed in as</p>
                <p className="text-xs font-medium text-foreground">
                  Programme Manager
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
