import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Search, UserPlus } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/Card";
import { InviteUserForm } from "../../../components/admin/InviteUserForm";
import { requireAdminRole } from "../../../server/auth/guards";
import { listAdminUsers, parseUserListParams, type AdminDirectoryUser, type AdminUserList } from "../../../server/admin/users";
import { roleLabel } from "../../../server/auth/roles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Users | Admin",
  description: "Manage Athira Technology admin workspace users.",
  robots: { index: false, follow: false, nocache: true },
};

function formatDate(value: string | null): string {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "Not available" : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

function UserStatus({ user }: { user: AdminDirectoryUser }) {
  return (
    <Badge variant={user.status === "active" ? "success" : "warning"}>
      <span className="sr-only">Account status: </span>{user.status === "active" ? "Active" : "Disabled"}
    </Badge>
  );
}

function UserRow({ user }: { user: AdminDirectoryUser }) {
  const displayName = user.display_name?.trim() || "Unnamed user";
  return (
    <tr className="border-t border-slate-800">
      <td className="px-4 py-4">
        <div className="font-semibold text-white">{displayName}</div>
        <div className="mt-1 break-all text-xs text-slate-400">{user.email || "Email unavailable"}</div>
      </td>
      <td className="px-4 py-4"><Badge variant="outline">{roleLabel(user.role)}</Badge></td>
      <td className="px-4 py-4"><UserStatus user={user} /></td>
      <td className="px-4 py-4 text-sm text-slate-300">{formatDate(user.created_at)}</td>
      <td className="px-4 py-4 text-sm text-slate-300">{formatDate(user.last_sign_in_at)}</td>
      <td className="px-4 py-4 text-right">
        <Link href={`/admin/users/${user.id}`} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-200 hover:bg-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
          Manage <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </td>
    </tr>
  );
}

function UserCard({ user }: { user: AdminDirectoryUser }) {
  const displayName = user.display_name?.trim() || "Unnamed user";
  return (
    <li className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white">{displayName}</h3>
          <p className="mt-1 break-all text-sm text-slate-400">{user.email || "Email unavailable"}</p>
        </div>
        <UserStatus user={user} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-slate-500">Role</dt><dd className="mt-1 text-slate-200">{roleLabel(user.role)}</dd></div>
        <div><dt className="text-slate-500">Joined</dt><dd className="mt-1 text-slate-200">{formatDate(user.created_at)}</dd></div>
        <div className="col-span-2"><dt className="text-slate-500">Last sign-in</dt><dd className="mt-1 text-slate-200">{formatDate(user.last_sign_in_at)}</dd></div>
      </dl>
      <Link href={`/admin/users/${user.id}`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-blue-200 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
        Manage user <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </li>
  );
}

function Pagination({ result, query }: { result: AdminUserList; query: string }) {
  const previous = new URLSearchParams();
  if (query) previous.set("q", query);
  previous.set("page", String(Math.max(1, result.page - 1)));
  const next = new URLSearchParams();
  if (query) next.set("q", query);
  next.set("page", String(Math.min(result.pageCount, result.page + 1)));

  return (
    <nav aria-label="User list pagination" className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 px-4 py-4">
      <p className="text-sm text-slate-400">Page <span className="font-semibold text-slate-200">{result.page}</span> of <span className="font-semibold text-slate-200">{result.pageCount}</span> - {result.total} users</p>
      <div className="flex gap-2">
        {result.page > 1 ? (
          <Link href={`/admin/users?${previous.toString()}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
            <ChevronLeft aria-hidden="true" className="h-4 w-4" /> Previous
          </Link>
        ) : <span className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-600" aria-disabled="true"><ChevronLeft aria-hidden="true" className="h-4 w-4" /> Previous</span>}
        {result.page < result.pageCount ? (
          <Link href={`/admin/users?${next.toString()}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
            Next <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        ) : <span className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-600" aria-disabled="true">Next <ChevronRight aria-hidden="true" className="h-4 w-4" /></span>}
      </div>
    </nav>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminRole("/admin/users");
  const params = parseUserListParams(await searchParams);
  let result: AdminUserList | null = null;
  let loadError = false;

  try {
    result = await listAdminUsers(admin, params);
  } catch {
    loadError = true;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">Administration</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">User management</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">Invite workspace users, review access, and keep role changes auditable. Only active administrators can open this area.</p>
        </div>
        <Badge variant="success"><span className="sr-only">Module status: </span>Implemented</Badge>
      </header>

      <Card aria-labelledby="invite-heading">
        <CardHeader className="border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-300"><UserPlus aria-hidden="true" className="h-5 w-5" /></span>
            <div><CardTitle as="h2" id="invite-heading">Invite a user</CardTitle><CardDescription>Send a Supabase invitation from the trusted server and choose the initial application role.</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="pt-5"><InviteUserForm /></CardContent>
      </Card>

      <Card aria-labelledby="directory-heading">
        <CardHeader className="border-b border-slate-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div><CardTitle as="h2" id="directory-heading">Workspace users</CardTitle><CardDescription>Search by email or display name. Results are paginated on the server.</CardDescription></div>
            <form method="get" action="/admin/users" role="search" className="flex w-full gap-2 lg:max-w-xl">
              <label htmlFor="user-search" className="sr-only">Search users</label>
              <div className="relative min-w-0 flex-1"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" /><input id="user-search" name="q" type="search" defaultValue={params.query} maxLength={80} placeholder="Search email or display name" className="block min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40" /></div>
              <button type="submit" className="min-h-11 rounded-xl bg-slate-800 px-4 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Search</button>
            </form>
          </div>
        </CardHeader>
        {loadError ? (
          <div role="alert" className="m-5 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">The user directory is unavailable. Confirm the server-only Supabase secret and migration configuration, then try again.</div>
        ) : result && result.users.length > 0 ? (
          <>
            <div className="hidden overflow-hidden md:block">
              <table className="w-full text-left">
                <caption className="sr-only">Admin workspace users</caption>
                <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-500"><tr><th scope="col" className="px-4 py-3">Name and email</th><th scope="col" className="px-4 py-3">Role</th><th scope="col" className="px-4 py-3">Status</th><th scope="col" className="px-4 py-3">Joined</th><th scope="col" className="px-4 py-3">Last sign-in</th><th scope="col" className="px-4 py-3 text-right">Actions</th></tr></thead>
                <tbody>{result.users.map((user) => <UserRow key={user.id} user={user} />)}</tbody>
              </table>
            </div>
            <ul className="grid gap-3 p-4 md:hidden">{result.users.map((user) => <UserCard key={user.id} user={user} />)}</ul>
            <Pagination result={result} query={params.query} />
          </>
        ) : (
          <div className="p-8 text-center"><h3 className="text-lg font-semibold text-white">{params.query ? "No matching users" : "No users yet"}</h3><p className="mt-2 text-sm text-slate-400">{params.query ? "Try a different email or display-name search." : "Invite the first workspace user above."}</p></div>
        )}
      </Card>
    </div>
  );
}
