import {
  Activity,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Gauge,
  Rocket,
} from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";

const overviewCards = [
  {
    label: "Agent runs",
    value: "Sample view",
    detail: "No live telemetry connected",
    icon: Bot,
  },
  {
    label: "Review checkpoints",
    value: "4 example stages",
    detail: "Illustrative workflow only",
    icon: ClipboardCheck,
  },
  {
    label: "Content drafts",
    value: "3 sample items",
    detail: "Static demo content",
    icon: FileText,
  },
  {
    label: "Deployment readiness",
    value: "Preview only",
    detail: "No production system connected",
    icon: Rocket,
  },
] as const;

const activities = [
  {
    agent: "Planning Agent",
    action: "Requirement ambiguity review",
    status: "Review sample",
    sequence: "Sample step 01",
  },
  {
    agent: "Testing Agent",
    action: "Regression strategy draft",
    status: "Draft sample",
    sequence: "Sample step 02",
  },
  {
    agent: "Deployment Agent",
    action: "Release checklist prepared",
    status: "Checklist sample",
    sequence: "Sample step 03",
  },
  {
    agent: "Documentation Agent",
    action: "Runbook draft updated",
    status: "Update sample",
    sequence: "Sample step 04",
  },
] as const;

const analyticsStages = [
  { label: "Plan & design", width: "w-4/5" },
  { label: "Build & test", width: "w-3/4" },
  { label: "Release & operate", width: "w-3/5" },
  { label: "Knowledge", width: "w-2/5" },
] as const;

const plannedModules = [
  {
    name: "User Management",
    description: "Roles, access groups, and invitation concepts.",
    items: ["Roles", "Access groups", "Invitations"],
  },
  {
    name: "Content Management",
    description: "Editorial structure for future managed content.",
    items: ["Pages", "Blog posts", "Media"],
  },
  {
    name: "Analytics",
    description: "Potential reporting surfaces without a connected backend.",
    items: ["Traffic", "Form enquiries", "Workflow activity"],
  },
  {
    name: "SEO",
    description: "Planned controls for search presentation and discovery.",
    items: ["Metadata", "Sitemap", "Search previews"],
  },
] as const;

const systemStatuses = [
  { label: "Public site", value: "Preview", state: "Environment" },
  { label: "Contact API", value: "Configured", state: "Implemented" },
  { label: "Rate limiting", value: "Configured", state: "Implemented" },
  { label: "Admin backend", value: "Not implemented", state: "Planned" },
  { label: "CMS", value: "Not implemented", state: "Planned" },
  { label: "Analytics backend", value: "Not implemented", state: "Planned" },
] as const;

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Admin UX concept
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
            An illustrative back-office information architecture for the planned product. Nothing on this page reads from or writes to a live admin system.
          </p>
        </div>
        <Badge variant="outline" className="w-fit text-blue-300">
          Static demo
        </Badge>
      </div>

      <section aria-labelledby="overview-kpi-heading">
        <div className="flex items-center justify-between gap-3">
          <h2 id="overview-kpi-heading" className="text-lg font-semibold text-white">
            Sample overview
          </h2>
          <p className="text-xs text-slate-400">No operational metrics</p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="h-full">
                <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
                  <div>
                    <p className="text-sm font-medium text-slate-400">{item.label}</p>
                    <CardTitle className="mt-3 text-xl leading-7">{item.value}</CardTitle>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-300">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-xs leading-5 text-slate-400">{item.detail}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card aria-labelledby="activity-heading">
          <CardHeader className="border-b border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle as="h2" id="activity-heading">
                  Recent Agent Activity
                </CardTitle>
                <CardDescription>Illustrative sequence — not production events</CardDescription>
              </div>
              <Badge variant="outline">Demo data</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <ol className="space-y-3">
              {activities.map((item) => (
                <li
                  key={item.agent}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="flex min-w-0 gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-blue-300">
                      <Activity aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{item.action}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {item.agent} · {item.sequence} · Illustrative
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-3 w-fit sm:mt-0">
                    {item.status}
                  </Badge>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card aria-labelledby="analytics-heading">
          <CardHeader className="border-b border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle as="h2" id="analytics-heading">
                  Review coverage concept
                </CardTitle>
                <CardDescription>Example lifecycle-stage presentation</CardDescription>
              </div>
              <Badge variant="outline" className="text-blue-300">
                Illustrative analytics
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm leading-6 text-slate-400">
              Bar lengths are decorative sample values. They do not represent measured activity, performance, or customer usage.
            </p>
            <ul className="mt-6 space-y-5">
              {analyticsStages.map((stage) => (
                <li key={stage.label}>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium text-slate-300">{stage.label}</span>
                    <span className="text-slate-400">Sample only</span>
                  </div>
                  <div aria-hidden="true" className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className={`${stage.width} h-full rounded-full bg-blue-500/70`} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="planned-modules-heading">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            Future architecture
          </p>
          <h2 id="planned-modules-heading" className="mt-2 text-2xl font-bold text-white">
            Planned admin modules
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            These cards describe intended information areas only. No CRUD, persistence, or working module route is represented.
          </p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {plannedModules.map((module) => (
            <Card key={module.name} className="h-full">
              <CardHeader className="pb-3">
                <Badge variant="outline" className="mb-2 w-fit">
                  Planned module
                </Badge>
                <CardTitle>{module.name}</CardTitle>
                <CardDescription className="leading-6">{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {module.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card aria-labelledby="system-status-heading">
        <CardHeader className="border-b border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle as="h2" id="system-status-heading">
                System status concept
              </CardTitle>
              <CardDescription>
                Static scope summary — this panel does not poll live services
              </CardDescription>
            </div>
            <Gauge aria-hidden="true" className="h-5 w-5 text-blue-300" />
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {systemStatuses.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.state}</p>
                </div>
                <div className="flex items-center gap-2 text-right">
                  {item.value === "Configured" ? (
                    <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : null}
                  <span className="text-xs font-medium text-slate-300">{item.value}</span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
