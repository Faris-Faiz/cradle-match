"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/page") {
    return <div className="min-h-screen w-full overflow-auto">{children}</div>;
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </>
  );
}
