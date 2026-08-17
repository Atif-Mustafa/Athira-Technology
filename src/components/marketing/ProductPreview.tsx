import { CheckCircle2, CircleDashed, GitPullRequest, ShieldAlert } from "lucide-react";

const sampleStages = [
  { label: "Requirement frame", status: "Approved", icon: CheckCircle2, tone: "text-emerald-300" },
  { label: "Interface proposal", status: "In review", icon: GitPullRequest, tone: "text-blue-300" },
  { label: "Verification plan", status: "Waiting on design", icon: CircleDashed, tone: "text-slate-400" },
  { label: "Release authorization", status: "Not authorized", icon: ShieldAlert, tone: "text-amber-300" },
] as const;

export function ProductPreview() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl shadow-slate-950/50">
      <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Sample work item · Notification preferences</p>
          <p className="mt-1 text-xs text-slate-400">Illustrative interface — no customer or production data</p>
        </div>
        <span className="w-fit rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-300">
          Architecture review
        </span>
      </div>
      <div className="grid md:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-slate-800 p-5 md:border-b-0 md:border-r">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Lifecycle state</p>
          <ul className="mt-4 space-y-3">
            {sampleStages.map((stage) => {
              const Icon = stage.icon;
              return (
                <li key={stage.label} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                  <Icon aria-hidden="true" className={`h-5 w-5 ${stage.tone}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-200">{stage.label}</p>
                    <p className="text-xs text-slate-400">{stage.status}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Review brief</p>
            <span className="text-xs text-slate-400">Sample content</span>
          </div>
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-sm font-semibold text-white">Decision requested</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Confirm whether user preferences are read synchronously or projected into the delivery service.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 p-4">
                <p className="text-xs text-slate-400">Source intent</p>
                <p className="mt-1 text-sm font-medium text-slate-200">Requirement AT-SAMPLE-14</p>
              </div>
              <div className="rounded-xl border border-slate-800 p-4">
                <p className="text-xs text-slate-400">Human owner</p>
                <p className="mt-1 text-sm font-medium text-slate-200">Architecture reviewer</p>
              </div>
            </div>
            <p className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm leading-6 text-amber-200">
              Generated proposals remain drafts until a named reviewer accepts them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
