import Sidebar from "@/components/sidebar";
import TopBar from "@/components/topbar";

// Operations console shell — a dark sidebar and top bar form an L-shaped
// frame; the routed content nests inside as a panel with a rounded top-left
// corner, floating above the muted operational canvas.

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen overflow-hidden bg-gray-900 text-sm">
      <Sidebar />

      <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-gray-900">
        <TopBar />
        <div className="flex-1 overflow-y-auto rounded-tl-3xl border-l border-t border-border bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}
