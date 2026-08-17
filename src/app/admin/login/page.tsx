import type { Metadata } from "next";
import { getSupabaseServerConfig } from "../../../server/env";
import { AdminAuthCard } from "../../../components/admin/AdminAuthCard";
import { LoginForm } from "../../../components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Authenticated Athira Technology admin workspace login.",
  robots: { index: false, follow: false, nocache: true },
};

function getSafeNextPath(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate?.startsWith("/admin/") && !candidate.startsWith("//")
    ? candidate
    : "/admin/dashboard";
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const configurationAvailable = getSupabaseServerConfig().success;
  const loggedOut = params.logged_out === "1";

  return (
    <AdminAuthCard
      eyebrow="Authenticated admin workspace"
      title="Sign in to continue"
      description="Use the account created by the workspace owner. Public signup is intentionally disabled for this internal admin application."
    >
      {loggedOut ? (
        <p role="status" className="mb-5 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm text-emerald-100">
          You have been signed out.
        </p>
      ) : null}
      <LoginForm
        nextPath={getSafeNextPath(params.next)}
        configurationAvailable={configurationAvailable}
      />
      <p className="mt-5 text-xs leading-5 text-slate-400">
        Authentication and role checks are connected through Supabase. Admin modules remain limited to the current dashboard concept.
      </p>
    </AdminAuthCard>
  );
}
