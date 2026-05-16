"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Network,
  CirclePlus,
  type LucideIcon,
} from "lucide-react";

// Persistent operations rail — a dark frame with always-labelled navigation
// grouped into sections so non-technical users see every destination at once.

interface NavItem {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
}

const navSections: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Workspace",
    items: [
      {
        href: "/dashboard",
        label: "Overview",
        hint: "Portfolio health at a glance",
        icon: LayoutDashboard,
      },
      {
        href: "/companies",
        label: "Companies",
        hint: "Every startup you manage",
        icon: Building2,
      },
      {
        href: "/network",
        label: "Relationship Map",
        hint: "See how everything connects",
        icon: Network,
      },
    ],
  },
  {
    heading: "Add",
    items: [
      {
        href: "/companies/new",
        label: "Onboard a Startup",
        hint: "Upload a pitch deck to begin",
        icon: CirclePlus,
      },
    ],
  },
];

// "Companies" stays lit across company, matching, and relationship routes —
// everything that belongs to a startup's file — but not the onboarding wizard.
function isNavActive(href: string, pathname: string): boolean {
  if (href === "/companies") {
    return (
      (pathname.startsWith("/companies") && pathname !== "/companies/new") ||
      pathname.startsWith("/relationships")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-gray-900 text-gray-300">
      {/* Brand */}
      <Link href="/dashboard" className="flex h-14 shrink-0 items-center gap-2.5 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
          CM
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight text-white">
            Cradle Match
          </p>
          <p className="text-[10px] uppercase tracking-[0.12em] text-gray-500">
            Operations Console
          </p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navSections.map((section) => (
          <div key={section.heading}>
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.09em] text-gray-500">
              {section.heading}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ href, label, hint, icon: Icon }) => {
                const active = isNavActive(href, pathname);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-start gap-3 rounded-md px-2 py-2 transition-colors ${
                      active
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-100"
                    }`}
                  >
                    <Icon
                      className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${
                        active ? "text-emerald-400" : "text-gray-500"
                      }`}
                    />
                    <span className="min-w-0 leading-tight">
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="block truncate text-[11px] text-gray-500">
                        {hint}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Signed-in user */}
      <div className="flex items-center gap-2.5 border-t border-white/10 px-4 py-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
          L
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-medium text-gray-100">Labubu</p>
          <p className="truncate text-[11px] text-gray-500">Programme Manager</p>
        </div>
      </div>
    </aside>
  );
}
