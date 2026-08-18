export default function AdminUsersLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading user management">
      <div className="h-12 w-64 animate-pulse rounded-xl bg-slate-800" />
      <div className="h-40 animate-pulse rounded-2xl bg-slate-900" />
      <div className="h-96 animate-pulse rounded-2xl bg-slate-900" />
    </div>
  );
}
