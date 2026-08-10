import {
  ArrowDown,
  BookOpenCheck,
  Braces,
  ClipboardCheck,
  FileCheck2,
  Layers3,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";

type WorkNodeProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

function FlowConnector() {
  return (
    <div aria-hidden="true" className="relative flex h-5 justify-center">
      <span className="h-3 w-px bg-gradient-to-b from-blue-400/15 to-blue-400/70" />
      <ArrowDown className="absolute bottom-0 h-3.5 w-3.5 text-blue-400" />
    </div>
  );
}

function WorkNode({ icon, title, description }: WorkNodeProps) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-700/80 bg-slate-950/70 p-2.5">
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-400/10 text-blue-300"
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-5 text-white">{title}</p>
          <p className="mt-0.5 text-xs leading-5 text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function CoordinationDiagram() {
  return (
    <figure
      aria-labelledby="coordination-diagram-title"
      className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-950/85 p-4 shadow-2xl shadow-blue-950/30 sm:p-5"
      data-testid="coordination-diagram"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(37,99,235,0.16),transparent_36%)]"
      />
      <figcaption className="relative flex flex-col gap-2.5 border-b border-slate-800 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p
            id="coordination-diagram-title"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400"
          >
            Illustrative coordination
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            Approved context through a review-led artifact flow
          </p>
        </div>
        <span className="w-fit rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-200">
          Planned product model
        </span>
      </figcaption>

      <div className="relative mt-4">
        <div className="mx-auto max-w-xs rounded-xl border border-slate-700 bg-slate-900/85 px-4 py-2 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            Starting context
          </p>
          <p className="mt-1 text-sm font-semibold text-white">Approved requirement</p>
        </div>

        <FlowConnector />

        <div className="rounded-2xl border border-blue-400/35 bg-blue-500/10 p-3.5 shadow-lg shadow-blue-950/20 sm:p-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-300/25 bg-blue-400/15 text-blue-200"
            >
              <Layers3 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-blue-300">
                Coordination layer
              </p>
              <p className="mt-1 font-semibold text-white">AI Software Engineer</p>
            </div>
          </div>
          <ul aria-label="Coordination inputs" className="mt-3 grid grid-cols-3 gap-2">
            {["Shared context", "Policies", "Review state"].map((label) => (
              <li
                key={label}
                className="rounded-lg border border-blue-300/15 bg-slate-950/50 px-2 py-1.5 text-center text-[0.7rem] font-medium leading-4 text-slate-300 sm:text-xs"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>

        <FlowConnector />

        <div>
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            Specialized SDLC work
          </p>
          <div className="grid grid-cols-2 gap-2">
            <WorkNode
              icon={<ClipboardCheck className="h-4 w-4" />}
              title="Plan & Design"
              description="Intent and architecture"
            />
            <WorkNode
              icon={<Braces className="h-4 w-4" />}
              title="Build & Test"
              description="Proposals and evidence"
            />
            <WorkNode
              icon={<Rocket className="h-4 w-4" />}
              title="Release & Operate"
              description="Readiness and signals"
            />
            <WorkNode
              icon={<BookOpenCheck className="h-4 w-4" />}
              title="Knowledge"
              description="Decisions and documentation"
            />
          </div>
        </div>

        <FlowConnector />

        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5">
          <div className="flex items-center justify-center gap-2.5 text-center">
            <ShieldCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-amber-300" />
            <div>
              <p className="text-sm font-semibold text-amber-100">Human review gate</p>
              <p className="mt-0.5 text-xs leading-5 text-slate-300">Policy checks and accountable approval</p>
            </div>
          </div>
        </div>

        <FlowConnector />

        <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-2.5">
          <div className="flex items-center justify-center gap-2.5 text-center">
            <FileCheck2 aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-300" />
            <div>
              <p className="text-sm font-semibold text-emerald-100">Approved engineering artifacts</p>
              <p className="mt-0.5 text-xs leading-5 text-slate-300">Inspectable outputs ready for accountable use</p>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
