import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AgentIcon } from "../agents/AgentIcon";
import { agentsData } from "../../content/agents";

export function WorkflowVisual() {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-950/85 p-4 shadow-2xl shadow-blue-950/30 sm:p-6">
      <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">Illustrative workflow</p>
          <p className="mt-1 text-sm text-slate-300">Approved requirement to operational knowledge</p>
        </div>
        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-300">
          Human reviewed
        </span>
      </div>
      <ol className="space-y-2">
        {agentsData.map((agent, index) => (
          <li key={agent.slug}>
            <Link
              href={`/agents/${agent.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 hover:border-slate-700 hover:bg-slate-900"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-blue-400">
                <AgentIcon icon={agent.icon} className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">{agent.name}</span>
                <span className="block truncate text-xs text-slate-400">{agent.label}</span>
              </span>
              {index < agentsData.length - 1 ? (
                <ArrowRight aria-hidden="true" className="h-4 w-4 text-slate-600 group-hover:text-blue-400" />
              ) : (
                <span className="text-xs font-medium text-emerald-300">Synced</span>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
