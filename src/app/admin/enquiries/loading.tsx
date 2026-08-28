export default function EnquiriesLoading() {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">Loading enquiries</span>
      <div className="h-24 animate-pulse rounded-2xl bg-slate-900 motion-reduce:animate-none" />
      <div className="h-64 animate-pulse rounded-2xl bg-slate-900 motion-reduce:animate-none" />
    </div>
  );
}
