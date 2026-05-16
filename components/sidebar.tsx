"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Plus, type LucideIcon } from "lucide-react";

const nav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/companies", label: "Portfolio", icon: Building2 },
  { href: "/companies/new", label: "Onboard Startup", icon: Plus },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-gray-900 text-gray-100 flex flex-col min-h-screen">
      <div className="px-5 pt-7 pb-6 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">C</div>
          <span className="font-semibold text-white tracking-tight text-sm">Cradle Match</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">Programme Manager Portal</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/companies/new" && pathname.startsWith(href) && href !== "/companies" ? pathname.startsWith(href) : pathname === href);
          const isPortfolio = href === "/companies" && pathname.startsWith("/companies") && pathname !== "/companies/new";
          const isActive = href === "/companies" ? isPortfolio : pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-gray-700 text-white font-medium"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">L</div>
          <div>
            <p className="text-xs font-medium text-gray-200">Labubu</p>
            <p className="text-xs text-gray-500">Programme Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
