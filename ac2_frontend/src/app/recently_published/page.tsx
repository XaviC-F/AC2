import PublishedObjectiveList from "@/components/PublishedObjectiveList";
import { Suspense } from "react";

export default function RecentlyPublishedPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col bg-[#0a0a0a] text-white min-h-screen">
        <header className="relative z-20">
          <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-6 sm:px-6 sm:pt-10 lg:px-16">
            <div className="text-xl sm:text-2xl font-light uppercase tracking-[0.2em] text-white">
              AC2
            </div>
          </nav>
          <div className="mx-auto mt-4 sm:mt-8 w-full max-w-6xl border-t border-white/10"></div>
        </header>
        <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 pb-12 sm:px-6 sm:pb-20 lg:px-16">
          <div className="text-white/60">Loading recently published objectives...</div>
        </main>
      </div>
    }>
      <PublishedObjectiveList />
    </Suspense>
  );
}
