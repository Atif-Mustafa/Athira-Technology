import type { Metadata } from "next";
import Link from "next/link";
import { signOutAction } from "../actions";
import { AdminAuthCard } from "../../../components/admin/AdminAuthCard";

export const metadata: Metadata = {
  title: "Access Denied",
  description: "The authenticated account does not have access to this admin workspace.",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminForbiddenPage() {
  return (
    <AdminAuthCard
      eyebrow="Access denied"
      title="This workspace is restricted"
      description="Your authenticated account does not have a valid active admin role. Ask the workspace owner to assign the appropriate role, or sign out."
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <form action={signOutAction} className="flex-1">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            Sign out
          </button>
        </form>
        <Link
          href="/"
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          Return home
        </Link>
      </div>
    </AdminAuthCard>
  );
}
