import type { ContentStep, ExampleScenario, FaqItem } from "./shared";

export const agentIconKeys = [
  "planning",
  "design",
  "development",
  "testing",
  "deployment",
  "monitoring",
  "documentation",
] as const;

export type AgentIconKey = (typeof agentIconKeys)[number];

export type Agent = {
  id: string;
  slug: string;
  name: string;
  label: string;
  shortDescription: string;
  purpose: string;
  problems: string[];
  inputs: string[];
  workflow: ContentStep[];
  outputs: string[];
  capabilities: string[];
  humanCheckpoints: string[];
  exampleScenario: ExampleScenario;
  integrations: string[];
  governance: string[];
  faqs: FaqItem[];
  icon: AgentIconKey;
  seoTitle: string;
  seoDescription: string;
};

export const agentsData: Agent[] = [
  {
    id: "planning",
    slug: "planning",
    name: "Planning Agent",
    label: "Requirements and delivery framing",
    icon: "planning",
    shortDescription: "Turns approved product intent into reviewable scope, dependencies, acceptance criteria, and a delivery backlog.",
    purpose: "The Planning Agent is designed to help product and engineering teams expose ambiguity before implementation begins. It organizes source requirements into a proposed delivery model while leaving scope and priority decisions with the responsible people.",
    problems: [
      "Requirements mix goals, assumptions, and implementation suggestions without clear boundaries.",
      "Dependencies and exceptional paths surface after work has already started.",
      "Backlog items lack acceptance criteria or a connection to the originating need.",
      "Early estimates hide uncertainty instead of explaining it.",
    ],
    inputs: [
      "Product brief, requirement, or approved change request",
      "Business rules, constraints, and explicit exclusions",
      "Available system and repository context",
      "Team conventions for tasks, acceptance criteria, and estimation",
    ],
    workflow: [
      { title: "Interpret", description: "Separate intended outcomes, constraints, assumptions, and open questions." },
      { title: "Challenge", description: "Identify ambiguity, edge cases, dependencies, and missing acceptance conditions." },
      { title: "Decompose", description: "Draft bounded work items with ordering, ownership, and trace links." },
      { title: "Prepare", description: "Propose acceptance criteria and estimation factors for human review." },
    ],
    outputs: [
      "Clarification and ambiguity register",
      "Proposed scope and dependency map",
      "Backlog-ready work-item drafts",
      "Acceptance criteria and estimation considerations",
    ],
    capabilities: [
      "Requirement analysis and ambiguity detection",
      "Scope decomposition and backlog preparation",
      "Acceptance-criteria drafting",
      "Dependency and edge-case identification",
      "Estimation assistance with visible assumptions",
    ],
    humanCheckpoints: [
      "Product owner confirms the intended outcome and exclusions.",
      "Engineering lead reviews feasibility, dependencies, and sequencing.",
      "The delivery team accepts or revises estimates before commitment.",
    ],
    exampleScenario: {
      title: "Example: frame an account-recovery change",
      context: "A product owner supplies the desired user outcome, security constraints, and affected application area.",
      steps: [
        "The agent separates business rules from suggested implementation details.",
        "It flags unanswered questions about identity verification, expiry, and support escalation.",
        "It drafts sequenced stories and acceptance criteria linked to the source requirement.",
        "Product and engineering owners revise and approve the plan before design begins.",
      ],
      outcome: "The illustrative output is a review-ready planning package, not an automatically committed backlog.",
    },
    integrations: ["Document and requirements sources", "Project-management systems", "Repository summaries", "Team estimation conventions"],
    governance: [
      "Keep source requirements and generated assumptions distinguishable.",
      "Record scope changes and the person who approved them.",
      "Do not treat generated estimates as delivery commitments.",
    ],
    faqs: [
      { question: "Can the Planning Agent create tickets automatically?", answer: "The planned workflow can prepare ticket-shaped drafts. Writing to a project system would require a validated connector, permissions, and an explicit approval policy." },
      { question: "Does it decide scope or priority?", answer: "No. It can organize options and expose dependencies, but accountable product and engineering owners decide scope, priority, and commitment." },
    ],
    seoTitle: "Planning Agent",
    seoDescription: "Explore Athira's planned Planning Agent for requirement analysis, scope decomposition, acceptance criteria, dependencies, and estimation assistance.",
  },
  {
    id: "design",
    slug: "design",
    name: "Design Agent",
    label: "Architecture and interface decisions",
    icon: "design",
    shortDescription: "Prepares architecture options, interface contracts, data models, diagrams, and explicit trade-offs for review.",
    purpose: "The Design Agent is intended to translate approved scope into a technical proposal that teams can challenge before code is written. It emphasizes alternatives, constraints, and durable decisions rather than presenting one generated design as inevitable.",
    problems: [
      "Architecture choices are made implicitly and become difficult to revisit.",
      "Service, API, and data boundaries are interpreted differently by different teams.",
      "Trade-offs and rejected alternatives disappear after a meeting.",
      "Diagrams and decision records drift away from implementation.",
    ],
    inputs: [
      "Approved scope, acceptance criteria, and dependency map",
      "Current architecture and system boundaries",
      "Non-functional requirements and data constraints",
      "Organization standards and known technology constraints",
    ],
    workflow: [
      { title: "Map", description: "Establish existing components, trust boundaries, interfaces, and constraints." },
      { title: "Explore", description: "Prepare viable architecture and data-model options with explicit trade-offs." },
      { title: "Specify", description: "Draft interface contracts, diagrams, and consequential design decisions." },
      { title: "Review", description: "Present assumptions and unresolved risks for architecture approval." },
    ],
    outputs: [
      "Context and component diagrams",
      "API, event, or module contract drafts",
      "Logical data-model proposal",
      "Architecture decision records and open-risk list",
    ],
    capabilities: [
      "System-boundary and architecture-option analysis",
      "Interface-contract preparation",
      "Logical data modelling",
      "Diagram and decision-record generation",
      "Trade-off and architecture-review support",
    ],
    humanCheckpoints: [
      "Domain owner confirms business and data semantics.",
      "Security or platform reviewers assess consequential boundaries.",
      "An architecture owner accepts the design and recorded trade-offs.",
    ],
    exampleScenario: {
      title: "Example: design an audit-event pipeline",
      context: "The team provides approved event requirements, existing service boundaries, retention constraints, and expected consumers.",
      steps: [
        "The agent maps producers, consumers, trust boundaries, and failure conditions.",
        "It compares direct delivery and brokered-event options without selecting one silently.",
        "It drafts an event contract, data model, diagrams, and an architecture decision record.",
        "Platform, security, and domain reviewers revise and approve the chosen design.",
      ],
      outcome: "The scenario yields an approved design package; it does not provision infrastructure or declare the architecture production-ready.",
    },
    integrations: ["Architecture repositories", "API specification formats", "Diagramming exports", "Data-catalog context"],
    governance: [
      "Label proposals, accepted decisions, and superseded decisions distinctly.",
      "Limit sensitive system context to what the design task requires.",
      "Require specialist review for security, privacy, and high-impact data choices.",
    ],
    faqs: [
      { question: "Does the Design Agent choose the technology stack?", answer: "It can compare options against supplied constraints. A qualified architecture owner remains responsible for the decision." },
      { question: "Are its diagrams the source of truth?", answer: "They are reviewable proposals until accepted. A production workflow would need explicit ownership and synchronization rules." },
    ],
    seoTitle: "Design Agent",
    seoDescription: "Explore Athira's planned Design Agent for architecture, interface contracts, data models, diagrams, trade-offs, and technical review.",
  },
  {
    id: "development",
    slug: "development",
    name: "Development Agent",
    label: "Review-led implementation assistance",
    icon: "development",
    shortDescription: "Uses approved plans and repository context to prepare scoped, standards-aware implementation changes for developer review.",
    purpose: "The Development Agent is designed to assist engineers with implementation planning and code preparation inside explicit repository boundaries. It does not replace developer judgment, ownership, or the existing review and verification process.",
    problems: [
      "Implementation starts before the affected code paths and conventions are understood.",
      "Repeated scaffolding and mechanical changes consume engineering attention.",
      "Generated code can ignore repository patterns or expand beyond the agreed scope.",
      "Reviewers receive changes without a clear explanation of intent and risk.",
    ],
    inputs: [
      "Approved technical plan and interface contracts",
      "Selected repository files and dependency context",
      "Coding standards, security rules, and test expectations",
      "Explicit change boundaries and prohibited actions",
    ],
    workflow: [
      { title: "Orient", description: "Inspect the permitted repository context and identify relevant patterns." },
      { title: "Plan", description: "Explain the intended file changes, dependencies, and verification approach." },
      { title: "Prepare", description: "Draft a bounded implementation with supporting tests or migration notes." },
      { title: "Hand off", description: "Summarize changes, assumptions, and known risks for developer review." },
    ],
    outputs: [
      "File-level implementation plan",
      "Review-ready code-change proposal",
      "Test and migration suggestions",
      "Change summary with assumptions and unresolved issues",
    ],
    capabilities: [
      "Repository-aware implementation planning",
      "Code-generation assistance within agreed boundaries",
      "Coding-standard and pattern alignment",
      "Refactoring and migration preparation",
      "Review-summary and verification support",
    ],
    humanCheckpoints: [
      "Developer confirms scope and planned files before consequential changes.",
      "Code owner reviews correctness, security, maintainability, and tests.",
      "A responsible engineer accepts the final change into the repository.",
    ],
    exampleScenario: {
      title: "Example: add a filtered project endpoint",
      context: "An engineer supplies an approved API contract, relevant modules, authorization rules, and repository conventions.",
      steps: [
        "The agent identifies established handler, service, validation, and test patterns.",
        "It proposes a file-level plan and flags an ambiguity in authorization behavior.",
        "After clarification, it drafts the scoped endpoint and tests.",
        "A developer reviews, modifies, runs checks, and decides whether to accept the change.",
      ],
      outcome: "The example produces a review candidate. No claim is made that generated code is correct without engineering verification.",
    },
    integrations: ["Source-control platforms", "Code-review workflows", "Package and build tools", "Static-analysis and test runners"],
    governance: [
      "Grant access only to repositories and files needed for the task.",
      "Keep generated and human-modified changes visible in review history.",
      "Block secret retrieval, unapproved network access, and destructive operations by policy.",
    ],
    faqs: [
      { question: "Can the Development Agent merge code?", answer: "Merge authority should remain governed by repository policy and named reviewers. This website does not implement repository access or automated merging." },
      { question: "Will generated code follow our standards?", answer: "Standards can be supplied as constraints, but developers must verify the result. Model output can still be incomplete, insecure, or inconsistent." },
    ],
    seoTitle: "Development Agent",
    seoDescription: "Explore Athira's planned Development Agent for repository-aware implementation, coding standards, code review preparation, and developer oversight.",
  },
  {
    id: "testing",
    slug: "testing",
    name: "Testing Agent",
    label: "Risk-based verification planning",
    icon: "testing",
    shortDescription: "Connects requirements and code changes to layered tests, edge cases, regression scope, and human quality approval.",
    purpose: "The Testing Agent is intended to help quality and engineering teams prepare verification evidence earlier. It links proposed checks to acceptance criteria and change risk while keeping release quality decisions with accountable reviewers.",
    problems: [
      "Tests cover the happy path but miss boundaries, failure modes, and regressions.",
      "Quality work begins after implementation choices are difficult to change.",
      "Test cases lack a visible link to requirements and risk.",
      "A passing suite is treated as sufficient evidence without human assessment.",
    ],
    inputs: [
      "Acceptance criteria and risk assumptions",
      "Approved design and implementation change",
      "Existing test architecture and coverage context",
      "Quality gates, supported environments, and known defects",
    ],
    workflow: [
      { title: "Trace", description: "Map requirements and changed behavior to verifiable conditions." },
      { title: "Model risk", description: "Identify boundaries, failure modes, regression areas, and test-data needs." },
      { title: "Prepare", description: "Draft unit, integration, contract, or end-to-end checks as appropriate." },
      { title: "Assess", description: "Summarize evidence, gaps, and exceptions for quality approval." },
    ],
    outputs: [
      "Risk-based test strategy",
      "Requirement-to-test traceability map",
      "Proposed automated and exploratory checks",
      "Quality evidence summary and unresolved-gap register",
    ],
    capabilities: [
      "Test-strategy and regression-scope preparation",
      "Unit, integration, and contract test assistance",
      "Boundary and edge-case analysis",
      "Acceptance-criteria traceability",
      "Quality-review evidence assembly",
    ],
    humanCheckpoints: [
      "Quality owner agrees the risk model and required test layers.",
      "Engineers review generated tests for meaningful behavior and maintainability.",
      "A named quality or release owner assesses gaps before release approval.",
    ],
    exampleScenario: {
      title: "Example: verify a subscription-state change",
      context: "The team supplies state-transition rules, accepted implementation changes, existing tests, and supported failure behavior.",
      steps: [
        "The agent maps each transition and rejected transition to an expected outcome.",
        "It identifies concurrency, retry, and backward-compatibility risks.",
        "It drafts unit and integration checks plus an exploratory test charter.",
        "Engineers run and review the checks; the quality owner records any accepted gaps.",
      ],
      outcome: "The illustrative result is a structured evidence package, not a guarantee that the feature is defect-free.",
    },
    integrations: ["Unit and integration test frameworks", "CI quality checks", "Test-management tools", "Issue and defect tracking"],
    governance: [
      "Avoid placing real personal or sensitive data in generated test fixtures.",
      "Keep skipped checks and accepted quality exceptions visible.",
      "Do not equate generated coverage counts with sufficient product quality.",
    ],
    faqs: [
      { question: "Does the Testing Agent guarantee coverage?", answer: "No. It can help prepare checks and traceability, but coverage metrics and generated tests do not prove correctness or eliminate the need for quality judgment." },
      { question: "Can it approve a release?", answer: "No. It can organize evidence and gaps. Release approval remains a human responsibility under the organization’s policy." },
    ],
    seoTitle: "Testing Agent",
    seoDescription: "Explore Athira's planned Testing Agent for test strategy, layered test preparation, regression coverage, edge cases, and quality approval.",
  },
  {
    id: "deployment",
    slug: "deployment",
    name: "Deployment Agent",
    label: "Controlled release preparation",
    icon: "deployment",
    shortDescription: "Assembles environment, pipeline, verification, rollback, and approval context into a reviewable release plan.",
    purpose: "The Deployment Agent is designed to assist release and platform teams with preparation and consistency. Its role is to surface prerequisites and evidence before an authorized person or system initiates a deployment.",
    problems: [
      "Release steps and environment assumptions are spread across tickets, scripts, and team knowledge.",
      "Configuration differences emerge only during deployment.",
      "Rollback conditions and ownership are unclear when risk is highest.",
      "Pipeline success can obscure missing product or operational approval.",
    ],
    inputs: [
      "Approved change set and quality evidence",
      "Target environment and configuration requirements",
      "CI/CD workflow and release policy",
      "Rollback procedure, owners, and operational constraints",
    ],
    workflow: [
      { title: "Assemble", description: "Collect the accepted change, checks, dependencies, and target environment." },
      { title: "Compare", description: "Identify configuration drift, missing prerequisites, and release-policy gaps." },
      { title: "Plan", description: "Draft ordered deployment, validation, communication, and rollback steps." },
      { title: "Gate", description: "Present the release package to the authorized approver before execution." },
    ],
    outputs: [
      "Release-readiness checklist",
      "Environment and configuration difference summary",
      "Deployment and rollback plan",
      "Approval and post-release validation record",
    ],
    capabilities: [
      "Release and environment readiness analysis",
      "CI/CD workflow assistance",
      "Configuration and prerequisite checking",
      "Rollback and validation planning",
      "Approval-gate evidence preparation",
    ],
    humanCheckpoints: [
      "Platform owner confirms environment and pipeline changes.",
      "Release owner accepts known risks and rollback conditions.",
      "An authorized person explicitly approves deployment execution.",
    ],
    exampleScenario: {
      title: "Example: prepare a staged API release",
      context: "A release owner provides an accepted change, test evidence, target environments, feature-control plan, and rollback procedure.",
      steps: [
        "The agent compares release prerequisites across staging and production.",
        "It flags a missing configuration value and an unverified rollback command.",
        "It prepares staged validation steps and a communication checklist.",
        "Platform and release owners resolve gaps and authorize any execution separately.",
      ],
      outcome: "The example stops at a reviewed release package; this website does not execute CI/CD or cloud actions.",
    },
    integrations: ["CI/CD platforms", "Cloud and container environments", "Configuration and secret-management systems", "Change-management workflows"],
    governance: [
      "Separate read, preparation, approval, and execution permissions.",
      "Never expose secret values in generated plans or logs.",
      "Record overrides, failed checks, rollback decisions, and named authorization.",
    ],
    faqs: [
      { question: "Can the Deployment Agent push to production?", answer: "Not in this repository. Any future execution capability would need tightly scoped credentials, explicit authorization, audit records, and customer-specific controls." },
      { question: "Does a successful pipeline mean a release is safe?", answer: "No. Pipeline evidence is one input. Product, security, quality, operational, and business considerations may still require review." },
    ],
    seoTitle: "Deployment Agent",
    seoDescription: "Explore Athira's planned Deployment Agent for release preparation, environment checks, CI/CD assistance, rollback planning, and approval gates.",
  },
  {
    id: "monitoring",
    slug: "monitoring",
    name: "Monitoring Agent",
    label: "Operational signal interpretation",
    icon: "monitoring",
    shortDescription: "Organizes telemetry, anomaly context, alert evidence, and service-health summaries for operational review.",
    purpose: "The Monitoring Agent is intended to help operators interpret signals and assemble incident context without pretending that model-generated analysis is ground truth. Remediation and operational decisions remain behind established runbooks and human authority.",
    problems: [
      "Operators receive alerts without deployment, dependency, or service context.",
      "Signal volume makes it difficult to distinguish symptoms from likely causes.",
      "Incident timelines and follow-up actions are reconstructed manually.",
      "Automated remediation can create additional risk when diagnosis is uncertain.",
    ],
    inputs: [
      "Selected metrics, logs, traces, and alert events",
      "Service topology and ownership information",
      "Recent release and configuration-change context",
      "Runbooks, severity definitions, and escalation policy",
    ],
    workflow: [
      { title: "Correlate", description: "Group relevant signals by service, time, change, and dependency context." },
      { title: "Interpret", description: "Draft hypotheses while distinguishing observed evidence from inference." },
      { title: "Brief", description: "Prepare a service-health or incident summary with confidence and gaps." },
      { title: "Escalate", description: "Route the context to the responsible operator under established policy." },
    ],
    outputs: [
      "Context-rich alert summary",
      "Service-health brief",
      "Evidence and hypothesis timeline",
      "Suggested runbook references and follow-up questions",
    ],
    capabilities: [
      "Telemetry and change-context correlation",
      "Anomaly-detection assistance",
      "Alert enrichment and incident briefing",
      "Service-health summarization",
      "Operational-review support",
    ],
    humanCheckpoints: [
      "Service owner validates impact and severity.",
      "Operator confirms or rejects diagnostic hypotheses.",
      "Authorized responders choose and execute remediation steps.",
    ],
    exampleScenario: {
      title: "Example: investigate elevated checkout latency",
      context: "The operator supplies scoped telemetry, service dependencies, recent deployments, and the latency runbook.",
      steps: [
        "The agent correlates the latency window with a dependency timeout and a recent configuration change.",
        "It labels that relationship as a hypothesis and lists missing evidence.",
        "It produces a timeline and points to relevant runbook checks.",
        "The on-call engineer validates the signals and decides what action, if any, is appropriate.",
      ],
      outcome: "The illustration supports diagnosis; it does not claim autonomous remediation or guaranteed anomaly detection.",
    },
    integrations: ["OpenTelemetry-compatible signals", "Metrics and log platforms", "Incident-management systems", "Service catalogs and runbooks"],
    governance: [
      "Redact sensitive payloads and identifiers before analysis where required.",
      "Distinguish telemetry facts from model-generated hypotheses.",
      "Keep remediation and destructive operations outside unapproved automated paths.",
    ],
    faqs: [
      { question: "Does the Monitoring Agent replace on-call engineers?", answer: "No. It is positioned as an interpretation and context aid. Qualified operators remain responsible for severity, diagnosis, communication, and remediation." },
      { question: "Can it automatically fix incidents?", answer: "Autonomous remediation is not implemented or claimed. Any future action would require narrowly bounded runbooks, authorization, and safety validation." },
    ],
    seoTitle: "Monitoring Agent",
    seoDescription: "Explore Athira's planned Monitoring Agent for telemetry interpretation, anomaly context, alert enrichment, incident support, and service-health review.",
  },
  {
    id: "documentation",
    slug: "documentation",
    name: "Documentation Agent",
    label: "Synchronized engineering knowledge",
    icon: "documentation",
    shortDescription: "Prepares API references, architecture records, onboarding guides, release notes, and runbook updates from approved changes.",
    purpose: "The Documentation Agent is designed to make documentation work part of delivery rather than a separate cleanup task. It proposes updates from accepted technical changes while leaving publication, accuracy, and audience decisions with document owners.",
    problems: [
      "API, architecture, and operational documentation drifts from the implemented system.",
      "New team members depend on undocumented knowledge held by a few people.",
      "Release notes omit operationally or user-relevant changes.",
      "Runbooks are not updated when procedures and dependencies change.",
    ],
    inputs: [
      "Approved requirements, design records, and accepted code changes",
      "Existing documentation structure and style guidance",
      "API specifications and release context",
      "Audience, confidentiality, and publication boundaries",
    ],
    workflow: [
      { title: "Detect", description: "Identify documentation areas affected by an approved change." },
      { title: "Draft", description: "Prepare audience-specific updates with links to source decisions." },
      { title: "Compare", description: "Highlight conflicts, stale statements, and information that needs an owner." },
      { title: "Publish safely", description: "Hand drafts to document owners for technical and editorial approval." },
    ],
    outputs: [
      "API and developer-reference updates",
      "Architecture decision and system-overview drafts",
      "Onboarding guides, release notes, and runbook changes",
      "Documentation impact and unresolved-owner report",
    ],
    capabilities: [
      "API and code-reference documentation assistance",
      "Architecture-record preparation",
      "Onboarding and developer-guide drafting",
      "Release-note and runbook synchronization",
      "Stale-document and change-impact identification",
    ],
    humanCheckpoints: [
      "Technical owner verifies factual accuracy and omissions.",
      "Security or legal reviewer checks restricted or public-facing material where needed.",
      "Documentation owner approves audience, wording, and publication destination.",
    ],
    exampleScenario: {
      title: "Example: document a versioned API change",
      context: "The team supplies the accepted API contract, migration behavior, code change, existing reference pages, and release audience.",
      steps: [
        "The agent identifies affected reference, migration, onboarding, and runbook pages.",
        "It drafts endpoint examples and labels one ambiguous deprecation date.",
        "It prepares internal release notes separately from public-facing documentation.",
        "Technical and documentation owners correct, approve, and publish the material through existing processes.",
      ],
      outcome: "The example reduces synchronization work but does not publish automatically or guarantee documentation accuracy.",
    },
    integrations: ["Documentation repositories", "API specification formats", "Knowledge-base platforms", "Release and change records"],
    governance: [
      "Respect audience and confidentiality boundaries when reusing source context.",
      "Preserve links to accepted technical decisions and change versions.",
      "Require review before public or policy documentation is published.",
    ],
    faqs: [
      { question: "Can the Documentation Agent publish changes automatically?", answer: "The safer default is a reviewed proposal. Publication would require destination-specific permissions, ownership rules, and explicit approval." },
      { question: "How does it prevent stale documentation?", answer: "The planned workflow compares accepted changes with mapped documentation areas. That can identify likely drift, but document owners still verify completeness and accuracy." },
    ],
    seoTitle: "Documentation Agent",
    seoDescription: "Explore Athira's planned Documentation Agent for API references, architecture records, onboarding, release notes, runbooks, and synchronized engineering knowledge.",
  },
];

export function getAgentBySlug(slug: string): Agent | undefined {
  return agentsData.find((agent) => agent.slug === slug);
}

export function getAdjacentAgents(slug: string): {
  previous: Agent | undefined;
  next: Agent | undefined;
} {
  const index = agentsData.findIndex((agent) => agent.slug === slug);

  if (index === -1) {
    return { previous: undefined, next: undefined };
  }

  return {
    previous: index > 0 ? agentsData[index - 1] : undefined,
    next: index < agentsData.length - 1 ? agentsData[index + 1] : undefined,
  };
}
