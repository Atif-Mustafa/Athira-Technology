import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { Badge } from "../../../../components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/Card";
import { UserManagementActions } from "../../../../components/admin/UserManagementActions";
import { requireAdminRole } from "../../../../server/auth/guards";
import { getAdminUser, listAdminAuditEvents, type AdminAuditEvent, type AdminDirectoryUser } from "../../../../server/admin/users";
import { roleLabel } from "../../../../server/auth/roles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "User details | Admin", description: "Review an Athira Technology admin workspace user.", robots: { index: false, follow: false } };

function dateLabel(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unavailable" : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function auditLabel(event: AdminAuditEvent) {
  if (event.action === "ROLE_CHANGED") return "Role changed";
  if (event.action === "USER_DISABLED") return "User disabled";
  if (event.action === "USER_ENABLED") return "User enabled";
  return "User invited";
}

function auditDetail(event: AdminAuditEvent) {
  const previous = event.previousValue ?? {};
  const next = event.newValue ?? {};
  if (event.action === "ROLE_CHANGED") return String(previous.role ?? "unknown") + " → " + String(next.role ?? "unknown");
  if (event.action === "USER_DISABLED" || event.action === "USER_ENABLED") return String(previous.status ?? "unknown") + " → " + String(next.status ?? "unknown");
  return next.role ? "Initial role: " + String(next.role) : "Invitation recorded";
}

function ErrorCard({ message }: { message: string }) {
  return <Card><CardContent className="p-6"><p role="alert" className="text-sm text-red-200">{message}</p></CardContent></Card>;
}

function UserOverview({ user }: { user: AdminDirectoryUser }) {
  const fields = [
    ["Email", user.email || "Unavailable"],
    ["Created", dateLabel(user.createdAt)],
    ["Last sign-in", dateLabel(user.lastSignInAt)],
    ["Email confirmed", dateLabel(user.emailConfirmedAt)],
    ["User ID", user.id],
  ];
  return (
    <Card>
      <CardHeader><CardTitle as="h2">Account overview</CardTitle><CardDescription>Safe account metadata only. Provider credentials and tokens are never shown here.</CardDescription></CardHeader>
      <CardContent><dl className="grid gap-5 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label}><dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</dt><dd className="mt-1 break-all text-sm text-slate-200">{value}</dd></div>)}</dl></CardContent>
    </Card>
  );
}

function AuditHistory({ events }: { events: AdminAuditEvent[] }) {
  return (
    <Card>
      <CardHeader><CardTitle as="h2">Recent audit history</CardTitle><CardDescription>Role and access changes are recorded by database-side admin functions.</CardDescription></CardHeader>
      <CardContent>{events.length ? <ol className="space-y-4">{events.map((event) => <li key={event.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-slate-100">{auditLabel(event)}</p><time className="text-xs text-slate-500" dateTime={event.createdAt}>{dateLabel(event.createdAt)}</time></div><p className="mt-1 text-sm text-slate-400">{auditDetail(event)}</p><p className="mt-2 break-all text-xs text-slate-500">Actor: {event.actorUserId}</p></li>)}</ol> : <p className="text-sm text-slate-400">No recorded changes for this user.</p>}</CardContent>
    </Card>
  );
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdminRole("/admin/users/" + id);
  let user: AdminDirectoryUser | null = null;
  let events: AdminAuditEvent[] = [];
  try {
    user = await getAdminUser(admin, id);
    if (user) events = await listAdminAuditEvents(admin, id);
  } catch {
    return <div className="mx-auto max-w-4xl space-y-6"><Link href="/admin/users" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200 hover:text-white"><ArrowLeft className="h-4 w-4" />Back to users</Link><ErrorCard message="User details are temporarily unavailable. Try again shortly." /></div>;
  }
  if (!user) return <div className="mx-auto max-w-4xl space-y-6"><Link href="/admin/users" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200 hover:text-white"><ArrowLeft className="h-4 w-4" />Back to users</Link><Card><CardContent className="p-6"><p className="text-sm text-slate-300">That user could not be found.</p></CardContent></Card></div>;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div><Link href="/admin/users" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200 hover:text-white"><ArrowLeft className="h-4 w-4" />Back to users</Link><div className="mt-5 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">User management</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{user.displayName}</h1><p className="mt-2 flex items-center gap-2 text-sm text-slate-400"><Mail className="h-4 w-4" />{user.email || "Email unavailable"}</p></div><div className="flex items-center gap-2"><Badge variant={user.status === "active" ? "success" : "destructive"}>{user.status}</Badge><Badge variant="outline"><ShieldCheck className="mr-1 h-3.5 w-3.5" />{roleLabel(user.role)}</Badge></div></div></div>
      <UserOverview user={user} />
      <Card><CardHeader><CardTitle as="h2">Access controls</CardTitle><CardDescription>Changes are guarded server-side and protected against self-lockout and removing the final active administrator.</CardDescription></CardHeader><CardContent><UserManagementActions userId={user.id} currentRole={user.role} status={user.status} isSelf={user.id === admin.user.id} /></CardContent></Card>
      <AuditHistory events={events} />
    </div>
  );
}
