import {
  Activity,
  BarChart3,
  BookOpen,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/utils";

const navigationItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Users", icon: Users },
  { label: "Content", icon: FileText },
  { label: "Blog", icon: BookOpen },
  { label: "Analytics", icon: BarChart3 },
  { label: "Forms", icon: ClipboardList },
  { label: "SEO", icon: Search },
  { label: "Activity", icon: Activity },
  { label: "Settings", icon: Settings },
] as const;

type AdminNavigationProps = {
  ariaLabel: string;
  compact?: boolean;
};

export function AdminNavigation({
  ariaLabel,
  compact = false,
}: AdminNavigationProps) {
  return (
    <nav aria-label={ariaLabel}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        Workspace concept
      </p>
      <ul className={cn("mt-3", compact ? "grid gap-2 sm:grid-cols-2" : "space-y-1.5")}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1">{item.label}</span>
            </>
          );

          return (
            <li key={item.label}>
              {"href" in item ? (
                <Link
                  href={item.href}
                  aria-current="page"
                  className="flex items-center gap-3 rounded-xl border border-blue-400/25 bg-blue-500/10 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  {content}
                  <span className="rounded-full border border-blue-400/25 bg-blue-400/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-blue-200">
                    Active
                  </span>
                </Link>
              ) : (
                <div
                  aria-disabled="true"
                  className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm text-slate-400"
                >
                  {content}
                  <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-slate-400">
                    Planned
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
