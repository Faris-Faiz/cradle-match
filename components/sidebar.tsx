"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Plus, type LucideIcon } from "lucide-react";

// Collapsible overlay sidebar — icon-only at rest, expands to full width on hover.

const nav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/companies", label: "Portfolio", icon: Building2 },
  { href: "/companies/new", label: "Onboard Startup", icon: Plus },
];

// Portfolio stays active across every /companies/* route except the onboarding wizard.
function isNavActive(href: string, pathname: string): boolean {
  if (href === "/companies") {
    return pathname.startsWith("/companies") && pathname !== "/companies/new";
  }
  return pathname === href;
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Spacer reserves the collapsed width; the aside below overlays content on hover. */}
      <div className="w-16 shrink-0 bg-gray-900 z-10" />

      <aside className="group w-16 hover:w-64 absolute left-0 top-0 h-full bg-gray-900 text-gray-100 flex flex-col z-40 transition-[width] duration-300 ease-in-out overflow-x-hidden whitespace-nowrap shadow-none hover:shadow-[4px_0_24px_rgba(0,0,0,0.25)]">
        <div className="h-14 flex items-center px-4 shrink-0">
          <div className="w-8 flex justify-center shrink-0">
            <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
              C
            </div>
          </div>
          <span className="font-semibold text-white tracking-tight text-sm ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Cradle Match
          </span>
        </div>
        <nav className="flex-1 py-4 space-y-0.5 px-3 overflow-y-auto overflow-x-hidden">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = isNavActive(href, pathname);

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center p-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-gray-700 text-white font-medium"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                }`}
              >
                <div className="w-6 flex justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 pb-6 flex items-center border-t border-gray-700">
          <div className="w-10 flex justify-center shrink-0">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
              L
            </div>
          </div>
          <div className="flex-1 overflow-hidden ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-xs font-medium text-gray-200 truncate">Labubu</p>
            <p className="text-xs text-gray-500 truncate">Programme Manager</p>
          </div>
        </div>
      </aside>
    </>
  );
}
