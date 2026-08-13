import type { Metadata } from "next";
import { CircleAlert, CircleUserRound } from "lucide-react";
import { AdminNavigation } from "../../components/admin/AdminNavigation";
import { Badge } from "../../components/ui/Badge";

export const metadata: Metadata = {
  title: "Admin Dashboard Demo",
  description: "Static demonstration dashboard for the Athira Technology prototype.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-blue-500 selection:text-white lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-slate-800 bg-slate-950/95 p-5 lg:flex">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <p className="text-lg font-bold tracking-tight text-white">
              Athira<span className="text-blue-500">Tech</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">Admin UX concept</p>
          </div>
          <Badge variant="outline" className="text-blue-300">
            Demo
          </Badge>
        </div>
        <div className="mt-6 flex-1 overflow-y-auto">
          <AdminNavigation ariaLabel="Admin demo sidebar" />
        </div>
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
          <p className="text-xs font-semibold text-slate-300">Static presentation only</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Navigation previews planned modules and does not expose working admin actions.
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-[96rem] items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white lg:text-base">
                <span className="lg:hidden">AthiraTech Admin Demo</span>
                <span className="hidden lg:inline">Admin workspace</span>
              </p>
              <p className="hidden text-xs text-slate-400 sm:block">Overview presentation</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Badge variant="outline" className="text-blue-300">
                Preview
              </Badge>
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-2.5 py-2 sm:px-3">
                <CircleUserRound aria-hidden="true" className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-200">Demo user</p>
                <p className="hidden text-[0.65rem] text-slate-400 sm:block">No signed-in account</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="border-b border-slate-800 bg-slate-950 px-4 py-3 lg:hidden">
          <details className="group mx-auto max-w-[96rem] rounded-xl border border-slate-800 bg-slate-900/35 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
              Admin navigation
              <span className="ml-2 text-xs font-normal text-slate-400">Static sections</span>
            </summary>
            <div className="mt-4 border-t border-slate-800 pt-4">
              <AdminNavigation ariaLabel="Admin demo mobile navigation" compact />
            </div>
          </details>
        </div>

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto flex w-full max-w-[96rem] flex-col p-4 focus:outline-none sm:p-6 lg:p-8"
        >
          <div
            role="note"
            aria-label="Admin demonstration limitation"
            className="mb-6 flex gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100"
          >
            <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <div>
              <p className="text-sm font-semibold">Admin UX demo — static sample data only.</p>
              <p className="mt-1 text-sm leading-6 text-amber-100/80">
                Authentication, persistence, user/content management, and analytics backends are not implemented.
              </p>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
