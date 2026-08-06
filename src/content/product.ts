import type { ContentStep, ExampleScenario, FaqItem } from "./shared";

export const aiSoftwareEngineerContent = {
  eyebrow: "Planned product platform",
  title: "One AI Software Engineer, coordinated across the SDLC",
  summary: "Athira Technology is designing a governed workspace where specialized agents can turn approved engineering intent into connected planning, design, implementation, testing, release, operational, and documentation artifacts.",
  intendedUsers: [
    "Product and engineering leaders evaluating AI-assisted delivery",
    "Software teams managing complex handoffs across the lifecycle",
    "Platform and quality teams defining repeatable controls",
    "Organizations exploring a narrow, review-led automation pilot",
  ],
  inputs: [
    "Approved requirements and acceptance criteria",
    "Repository structure and selected code context",
    "Architecture, coding, testing, and release standards",
    "Environment constraints and human approval policies",
  ],
  outputs: [
    "Draft plans, tasks, interfaces, and decision records",
    "Review-ready implementation changes and test proposals",
    "Release checklists, operational summaries, and runbooks",
    "Trace links between source intent, generated work, and approvals",
  ],
  coordination: [
    "A shared work item carries approved context between specialist agents.",
    "Each agent produces an explicit artifact instead of silently changing downstream state.",
    "Review outcomes become constraints for the next lifecycle stage.",
    "Exceptions return to the responsible person rather than bypassing a gate.",
  ],
  lifecycle: [
    { title: "Frame", description: "Capture intent, constraints, dependencies, and acceptance criteria." },
    { title: "Design", description: "Propose architecture and interfaces with trade-offs available for review." },
    { title: "Build", description: "Prepare scoped implementation changes against approved context." },
    { title: "Verify", description: "Connect tests and checks to requirements and known risks." },
    { title: "Release", description: "Assemble deployment evidence, approval state, and rollback planning." },
    { title: "Learn", description: "Summarize operational signals and synchronize durable documentation." },
  ] satisfies ContentStep[],
  checkpoints: [
    "Scope and acceptance-criteria approval before design work",
    "Architecture review before implementation planning",
    "Developer review before code is accepted",
    "Quality approval before release preparation",
    "Named release authorization before deployment actions",
  ],
  example: {
    title: "Example: preparing a customer-notification feature",
    context: "A product team supplies an approved requirement, repository boundaries, coding conventions, and release policy.",
    steps: [
      "The Planning Agent identifies ambiguous delivery rules and drafts acceptance criteria.",
      "The Design Agent proposes an event contract and records alternatives for architecture review.",
      "After approval, Development and Testing agents prepare a change set and linked verification plan.",
      "Deployment and Documentation agents assemble a release checklist, rollback notes, and updated runbook for human approval.",
    ],
    outcome: "The illustrative workflow produces a connected review package. It does not represent a live automated deployment.",
  } satisfies ExampleScenario,
  governance: [
    "Make source context and generated artifacts identifiable",
    "Record who reviewed a proposal and what changed after review",
    "Apply least-privilege concepts to repositories and environments",
    "Keep deployment and destructive actions behind explicit authorization",
    "Define retention, residency, and model-provider choices during implementation",
  ],
  securityPrinciples: [
    "Minimize the code and business context shared with each workflow step.",
    "Separate suggestion, approval, and execution permissions.",
    "Validate generated changes with the same engineering controls used for human-authored work.",
    "Treat customer-specific compliance and data-handling requirements as design inputs, not assumed certifications.",
  ],
  limitations: [
    "This repository is a public website and does not contain production agent execution.",
    "Displayed workflows and interfaces are illustrative product concepts.",
    "Tool connectors, model providers, hosting patterns, and control evidence require separate implementation and validation.",
    "AI-generated engineering work can be incomplete or incorrect and requires qualified human review.",
  ],
  faqs: [
    {
      question: "How is this different from a general coding assistant?",
      answer: "The planned model organizes work across lifecycle-specific artifacts and approval points, rather than treating code generation as the entire delivery process.",
    },
    {
      question: "Can a team use only one agent?",
      answer: "That is a reasonable pilot approach. A narrow workflow can be evaluated before considering coordination across additional stages.",
    },
    {
      question: "Who remains accountable for generated work?",
      answer: "The organization and its named reviewers remain accountable for requirements, technical decisions, accepted changes, security, quality, and releases.",
    },
    {
      question: "Which deployment model is supported?",
      answer: "No production deployment model is committed by this website. Hosting, model, repository, and data-governance needs would be established during technical discovery.",
    },
  ] satisfies FaqItem[],
} as const;
