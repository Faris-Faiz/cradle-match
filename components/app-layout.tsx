import Sidebar from "@/components/sidebar";
import TopBar from "@/components/topbar";

// Application shell — sidebar + topbar chrome around a routed content area.

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen overflow-hidden text-sm bg-white">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full bg-gray-900 relative overflow-hidden w-full">
        <TopBar />
        <div className="flex-1 overflow-y-auto relative bg-gray-50 border-t border-l border-gray-200 rounded-tl-3xl">
          {children}
        </div>
      </main>
    </div>
  );
}
