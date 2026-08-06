export const marketingIconKeys = [
  "strategy",
  "agents",
  "automation",
  "integration",
  "modernization",
  "cloud",
  "quality",
  "consulting",
  "source-control",
  "project-management",
  "communication",
  "containers",
  "observability",
  "governance",
  "review",
  "traceability",
] as const;

export type MarketingIconKey = (typeof marketingIconKeys)[number];

export type NavigationLink = {
  label: string;
  href: string;
};

export type FooterGroup = {
  title: string;
  links: NavigationLink[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type ContentStep = {
  title: string;
  description: string;
};

export type ExampleScenario = {
  title: string;
  context: string;
  steps: string[];
  outcome: string;
};
