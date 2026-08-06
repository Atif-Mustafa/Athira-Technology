import type { FaqItem } from "./shared";

export type PricingPlan = {
  slug: string;
  name: string;
  priceLabel: string;
  targetUser: string;
  description: string;
  features: string[];
  limitations: string[];
  cta: string;
  featured?: boolean;
};

export const pricingPlans: PricingPlan[] = [
  {
    slug: "starter",
    name: "Starter",
    priceLabel: "Indicative package",
    targetUser: "Teams defining a first, narrow AI-assisted workflow",
    description: "A discovery-led package for clarifying the use case, controls, and evaluation approach before a build commitment.",
    features: ["Workflow discovery", "Pilot definition", "Risk and data-context review", "Implementation estimate"],
    limitations: ["No production platform access", "Integration development scoped separately"],
    cta: "Discuss a starter engagement",
  },
  {
    slug: "growth",
    name: "Growth",
    priceLabel: "Custom quote",
    targetUser: "Delivery teams ready to prototype a governed agent workflow",
    description: "A phased design and prototype engagement with review checkpoints and an explicit production-readiness decision.",
    features: ["Everything in Starter", "Solution and integration design", "Prototype implementation", "Evaluation and handoff plan"],
    limitations: ["Scope depends on selected systems", "Production operations require separate approval"],
    cta: "Scope a prototype",
    featured: true,
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    priceLabel: "Contact for pricing",
    targetUser: "Organizations coordinating multiple teams, systems, or governance requirements",
    description: "A tailored programme for platform architecture, integrations, controls, enablement, and staged adoption.",
    features: ["Multi-workflow roadmap", "Enterprise integration architecture", "Governance and operating model", "Delivery and enablement support"],
    limitations: ["Commercial terms require discovery", "Certifications and controls are not implied"],
    cta: "Plan an enterprise discovery",
  },
];

export const pricingComparison = [
  { feature: "Workflow discovery", starter: "Included", growth: "Included", enterprise: "Included" },
  { feature: "Prototype implementation", starter: "Scoped separately", growth: "Included", enterprise: "Tailored" },
  { feature: "Integration architecture", starter: "Initial review", growth: "Selected systems", enterprise: "Multi-system" },
  { feature: "Governance design", starter: "Baseline", growth: "Workflow-specific", enterprise: "Programme-wide" },
  { feature: "Enablement support", starter: "Handoff", growth: "Project team", enterprise: "Multi-team" },
] as const;

export const pricingFaqs: FaqItem[] = [
  {
    question: "Why are fixed prices not shown?",
    answer: "Final commercial packages have not been approved, and effort depends heavily on workflow boundaries, integrations, data constraints, and review requirements. The labels on this page are intentionally indicative.",
  },
  {
    question: "Does a package include software subscriptions?",
    answer: "No subscription or platform entitlement is represented by this website. Discovery would distinguish professional services, prototype work, third-party costs, and any future product terms.",
  },
  {
    question: "Can we begin with one lifecycle stage?",
    answer: "Yes. A bounded planning, testing, documentation, or another single-stage workflow is often easier to evaluate responsibly than an end-to-end programme.",
  },
  {
    question: "Is payment or checkout available online?",
    answer: "No. This website does not implement billing, checkout, or payment processing.",
  },
];
