import type { MarketingIconKey } from "./shared";

export type Service = {
  slug: string;
  name: string;
  summary: string;
  businessProblem: string;
  scope: string;
  deliverables: string[];
  engagementModel: string;
  icon: MarketingIconKey;
};

export const services: Service[] = [
  {
    slug: "ai-product-strategy",
    name: "AI product strategy",
    summary: "Turn a broad AI ambition into a governed, testable product roadmap.",
    businessProblem: "Teams often have promising use cases but no shared definition of value, risk, ownership, or implementation sequence.",
    scope: "Opportunity mapping, workflow analysis, feasibility framing, governance needs, and pilot selection.",
    deliverables: ["Use-case portfolio", "Prioritized pilot brief", "Risk and dependency map", "Delivery roadmap"],
    engagementModel: "Focused discovery workshop or short advisory engagement.",
    icon: "strategy",
  },
  {
    slug: "custom-ai-agent-development",
    name: "Custom AI-agent development",
    summary: "Design focused assistants around a defined business or engineering workflow.",
    businessProblem: "Generic tools rarely reflect an organization’s context, approval model, or systems of record.",
    scope: "Agent boundaries, context design, tool permissions, evaluation criteria, review flows, and implementation planning.",
    deliverables: ["Solution design", "Prototype workflow", "Evaluation plan", "Operational handoff"],
    engagementModel: "Phased prototype with explicit review gates and production-readiness assessment.",
    icon: "agents",
  },
  {
    slug: "software-delivery-automation",
    name: "Software-delivery automation",
    summary: "Reduce repeated coordination work while preserving engineering controls.",
    businessProblem: "Manual handoffs between planning, development, testing, and release slow feedback and fragment evidence.",
    scope: "Workflow mapping, artifact automation, approval gates, CI/CD touchpoints, and traceability design.",
    deliverables: ["Current-state map", "Automation backlog", "Reference workflow", "Control checklist"],
    engagementModel: "Workflow assessment followed by incremental automation sprints.",
    icon: "automation",
  },
  {
    slug: "enterprise-integration",
    name: "Enterprise integration",
    summary: "Plan reliable connections between AI workflows and existing systems.",
    businessProblem: "Useful automation depends on trustworthy context and carefully bounded actions across fragmented tools.",
    scope: "API and event contracts, identity boundaries, data flows, failure handling, and integration sequencing.",
    deliverables: ["Integration architecture", "Interface contracts", "Data-flow review", "Implementation backlog"],
    engagementModel: "Architecture engagement or implementation workstream within a broader programme.",
    icon: "integration",
  },
  {
    slug: "platform-modernization",
    name: "Platform modernization",
    summary: "Create a practical path from legacy constraints to maintainable delivery foundations.",
    businessProblem: "Aging systems and undocumented dependencies make change risky and block responsible automation.",
    scope: "Architecture assessment, dependency discovery, modernization options, migration increments, and decision records.",
    deliverables: ["Technical assessment", "Target-state options", "Migration sequence", "Architecture decisions"],
    engagementModel: "Assessment and roadmap, with optional delivery support for selected increments.",
    icon: "modernization",
  },
  {
    slug: "cloud-deployment-enablement",
    name: "Cloud and deployment enablement",
    summary: "Strengthen delivery paths, environment consistency, and release readiness.",
    businessProblem: "Inconsistent environments and loosely defined release checks increase operational uncertainty.",
    scope: "Cloud architecture, container workflows, CI/CD design, configuration boundaries, and rollback preparation.",
    deliverables: ["Deployment blueprint", "Pipeline recommendations", "Environment model", "Release runbook"],
    engagementModel: "Architecture sprint or delivery-enablement workstream.",
    icon: "cloud",
  },
  {
    slug: "quality-engineering",
    name: "Quality engineering",
    summary: "Connect risk, requirements, and layered verification earlier in delivery.",
    businessProblem: "Late or brittle testing leaves teams without clear evidence that a change satisfies its intent.",
    scope: "Test strategy, automation architecture, coverage priorities, quality gates, and traceability.",
    deliverables: ["Quality strategy", "Test architecture", "Risk-based coverage plan", "CI quality gates"],
    engagementModel: "Quality assessment with targeted implementation support.",
    icon: "quality",
  },
  {
    slug: "technical-consulting-support",
    name: "Technical consulting and support",
    summary: "Add experienced product and engineering guidance to a defined initiative.",
    businessProblem: "Critical programmes sometimes need independent technical framing, review, or temporary specialist capacity.",
    scope: "Architecture review, delivery planning, technical facilitation, risk review, and team enablement.",
    deliverables: ["Review findings", "Decision support", "Action plan", "Knowledge-transfer sessions"],
    engagementModel: "Advisory retainer, focused review, or time-bounded delivery support.",
    icon: "consulting",
  },
];
