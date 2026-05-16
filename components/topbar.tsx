"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

// Top navigation bar — portal title plus a profile dropdown.

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
    <header className="h-14 bg-gray-900 flex items-center justify-between px-6 z-10 shrink-0">
      <div className="font-semibold text-gray-100 text-sm tracking-tight">
        Programme Manager Portal
      </div>

      <div ref={profileRef} className="relative">
        <button
          onClick={() => setProfileOpen((v) => !v)}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 focus:outline-none"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
            L
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${profileOpen ? "rotate-180" : ""}`}
          />
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  L
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">Labubu</p>
                  <p className="text-xs text-gray-400 truncate">labubu@cradle.my</p>
                </div>
              </div>
            </div>

            <div className="px-4 py-2">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                Signed in as
              </p>
              <p className="text-xs font-medium text-gray-600">Programme Manager</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
