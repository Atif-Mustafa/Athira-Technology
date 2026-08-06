import type {
  FaqItem,
  FooterGroup,
  MarketingIconKey,
  NavigationLink,
} from "./shared";

export const primaryNavigation: NavigationLink[] = [
  { label: "Product", href: "/ai-software-engineer" },
  { label: "SDLC Agents", href: "/agents" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const footerGroups: FooterGroup[] = [
  {
    title: "Product",
    links: [
      { label: "AI Software Engineer", href: "/ai-software-engineer" },
      { label: "SDLC Agents", href: "/agents" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Services", href: "/services" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy draft", href: "/privacy" },
      { label: "Terms draft", href: "/terms" },
    ],
  },
];

export const engineeringChallenges: Array<{
  title: string;
  description: string;
  icon: MarketingIconKey;
}> = [
  {
    title: "Fragmented handoffs",
    description: "Requirements, design decisions, code, and release context often live in separate tools and lose detail between teams.",
    icon: "integration",
  },
  {
    title: "Repetitive delivery work",
    description: "Engineers repeatedly translate the same intent into tickets, implementation plans, tests, runbooks, and release notes.",
    icon: "automation",
  },
  {
    title: "Late quality feedback",
    description: "Testing and operational concerns can arrive after key choices are expensive to revisit.",
    icon: "quality",
  },
  {
    title: "Limited traceability",
    description: "Teams need a clearer path from an approved requirement to the code, checks, deployment decision, and documentation it produced.",
    icon: "traceability",
  },
];

export const integrationCategories: Array<{
  name: string;
  examples: string[];
  description: string;
  icon: MarketingIconKey;
}> = [
  {
    name: "Source control",
    examples: ["GitHub", "GitLab", "Bitbucket"],
    description: "Designed to connect with repository context, reviews, and change history.",
    icon: "source-control",
  },
  {
    name: "Project management",
    examples: ["Jira", "Linear", "Azure Boards"],
    description: "Planned integration points for requirements, tasks, and approval state.",
    icon: "project-management",
  },
  {
    name: "Communication",
    examples: ["Slack", "Microsoft Teams"],
    description: "Example workflow destinations for summaries and review requests.",
    icon: "communication",
  },
  {
    name: "Cloud and containers",
    examples: ["AWS", "Azure", "Google Cloud", "Kubernetes"],
    description: "Integration-ready architecture for approved delivery environments.",
    icon: "containers",
  },
  {
    name: "Observability",
    examples: ["OpenTelemetry", "Datadog", "Grafana"],
    description: "Planned connections for telemetry context and operational review.",
    icon: "observability",
  },
];

export const enterprisePrinciples: Array<{
  title: string;
  description: string;
  icon: MarketingIconKey;
}> = [
  {
    title: "Human approval points",
    description: "The product direction keeps people responsible for scope, architecture, quality, and release decisions.",
    icon: "review",
  },
  {
    title: "Role-aware control",
    description: "Access boundaries and role-based actions are design goals that require implementation and customer-specific validation.",
    icon: "governance",
  },
  {
    title: "Traceable decisions",
    description: "Planned records connect inputs, generated artifacts, review outcomes, and downstream changes.",
    icon: "traceability",
  },
  {
    title: "Deployment flexibility",
    description: "The intended architecture considers different repository, cloud, and delivery environments without claiming current support.",
    icon: "cloud",
  },
];

export const homepageFaqs: FaqItem[] = [
  {
    question: "Is the Athira AI Software Engineer available as a production platform today?",
    answer: "This website presents the planned product direction and service offering. Production AI execution, customer integrations, and operational controls are not implemented in this repository.",
  },
  {
    question: "Does Athira replace software engineering teams?",
    answer: "No. The product model is designed to assist delivery teams while keeping people responsible for requirements, design, code review, quality approval, and release decisions.",
  },
  {
    question: "Can Athira connect to our existing engineering tools?",
    answer: "The architecture is being designed around common source-control, planning, cloud, container, and observability categories. Specific connectors must be scoped and validated before they can be described as operational.",
  },
  {
    question: "How would a team begin evaluating the product direction?",
    answer: "A discovery conversation can map your delivery workflow, approval requirements, data-governance constraints, and the narrowest useful pilot before any implementation commitment.",
  },
];
