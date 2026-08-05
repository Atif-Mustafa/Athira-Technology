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
  shortDescription: string;
  fullDescription: string;
  capabilities: string[];
  workflow: string[];
  benefits: string[];
  useCases: string[];
  icon: AgentIconKey;
  seoTitle: string;
  seoDescription: string;
};

export const agentsData: Agent[] = [
  {
    id: "planning",
    slug: "planning",
    name: "Planning Agent",
    icon: "planning",
    shortDescription: "Analyzes requirements, creates technical specs, and breaks down epics into sub-tasks.",
    fullDescription: "The Planning Agent acts as your AI Product Manager and Technical Lead. It ingests PRDs, user stories, or simple chat prompts and transforms them into detailed, actionable technical specifications. It identifies edge cases, maps out API endpoints, defines database schemas, and creates Jira-ready sub-tasks.",
    capabilities: [
      "Requirement Analysis & Edge Case Detection",
      "Technical Specification Generation",
      "Epic Breakdown into Sub-tasks",
      "Dependency Mapping",
    ],
    workflow: [
      "Ingest Requirements (Text/Docs)",
      "Analyze Context & Constraints",
      "Draft Technical Spec",
      "Generate Tasks & Acceptance Criteria",
    ],
    benefits: [
      "Eliminates ambiguity before development starts",
      "Ensures all edge cases are considered early",
      "Saves hours of manual ticket writing",
    ],
    useCases: [
      "Converting a 1-page idea into a development sprint",
      "Planning a database migration strategy",
      "Documenting existing legacy features",
    ],
    seoTitle: "Planning Agent",
    seoDescription: "The Planning Agent analyzes requirements, creates technical specs, and breaks down epics into sub-tasks.",
  },
  {
    id: "design",
    slug: "design",
    name: "Design Agent",
    icon: "design",
    shortDescription: "Architects system design, database schemas, and API contracts based on the planning phase.",
    fullDescription: "The Design Agent takes the technical specifications and creates the structural blueprint for your application. It designs optimized database schemas, defines robust API contracts (REST or GraphQL), and establishes the overall system architecture, ensuring scalability and maintainability.",
    capabilities: [],
    workflow: [],
    benefits: [],
    useCases: [],
    seoTitle: "Design Agent",
    seoDescription: "Explore the planned system design, database schema, and API contract responsibilities of the Design Agent.",
  },
  {
    id: "development",
    slug: "development",
    name: "Development Agent",
    icon: "development",
    shortDescription: "The core engineer concept for writing clean, type-safe code from an agreed architecture.",
    fullDescription: "The Development Agent is designed as an AI-assisted engineering component. Its planned role is to write clean, idiomatic, and type-safe code from approved specifications and repository context.",
    capabilities: [],
    workflow: [],
    benefits: [],
    useCases: [],
    seoTitle: "Development Agent",
    seoDescription: "Explore the planned code implementation responsibilities of the Athira Development Agent.",
  },
  {
    id: "testing",
    slug: "testing",
    name: "Testing Agent",
    icon: "testing",
    shortDescription: "A planned agent for generating unit, integration, and end-to-end test coverage.",
    fullDescription: "The Testing Agent is intended to support unit, integration, and end-to-end test generation for new features and bug fixes. Detailed coverage targets and CI policies have not yet been published.",
    capabilities: [],
    workflow: [],
    benefits: [],
    useCases: [],
    seoTitle: "Testing Agent",
    seoDescription: "Explore the planned unit, integration, and end-to-end testing responsibilities of the Testing Agent.",
  },
  {
    id: "deployment",
    slug: "deployment",
    name: "Deployment Agent",
    icon: "deployment",
    shortDescription: "A planned agent for CI/CD configuration, environment handling, and rollout workflows.",
    fullDescription: "The Deployment Agent is intended to assist with release workflows, environment configuration, and deployment strategies. Specific platform integrations and rollout controls are still being defined.",
    capabilities: [],
    workflow: [],
    benefits: [],
    useCases: [],
    seoTitle: "Deployment Agent",
    seoDescription: "Explore the planned CI/CD and rollout responsibilities of the Athira Deployment Agent.",
  },
  {
    id: "monitoring",
    slug: "monitoring",
    name: "Monitoring Agent",
    icon: "monitoring",
    shortDescription: "A planned agent for production signals, anomaly detection, and operational alerts.",
    fullDescription: "The Monitoring Agent is intended to support production observability and anomaly detection. Automated remediation and infrastructure controls remain future capabilities pending product and security validation.",
    capabilities: [],
    workflow: [],
    benefits: [],
    useCases: [],
    seoTitle: "Monitoring Agent",
    seoDescription: "Explore the planned observability and anomaly detection responsibilities of the Monitoring Agent.",
  },
  {
    id: "documentation",
    slug: "documentation",
    name: "Documentation Agent",
    icon: "documentation",
    shortDescription: "A planned agent for keeping developer and API documentation aligned with code changes.",
    fullDescription: "The Documentation Agent is intended to assist with README, API, and internal documentation updates as a codebase evolves. Supported documentation systems are still being defined.",
    capabilities: [],
    workflow: [],
    benefits: [],
    useCases: [],
    seoTitle: "Documentation Agent",
    seoDescription: "Explore the planned developer and API documentation responsibilities of the Documentation Agent.",
  },
];

export function getAgentBySlug(slug: string): Agent | undefined {
  return agentsData.find((agent) => agent.slug === slug);
}
