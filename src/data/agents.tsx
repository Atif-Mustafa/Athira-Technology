import { LucideIcon } from "lucide-react";
import { ClipboardList, PenTool, Braces, Bug, Rocket, Activity, FileText } from "lucide-react";

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
  icon: LucideIcon;
  seoTitle: string;
  seoDescription: string;
};

export const agentsData: Agent[] = [
  { 
    id: "planning", 
    slug: "planning",
    name: "Planning Agent", 
    icon: ClipboardList, 
    shortDescription: "Analyzes requirements, creates technical specs, and breaks down epics into sub-tasks.",
    fullDescription: "The Planning Agent acts as your AI Product Manager and Technical Lead. It ingests PRDs, user stories, or simple chat prompts and transforms them into detailed, actionable technical specifications. It identifies edge cases, maps out API endpoints, defines database schemas, and creates Jira-ready sub-tasks.",
    capabilities: [
      "Requirement Analysis & Edge Case Detection",
      "Technical Specification Generation",
      "Epic Breakdown into Sub-tasks",
      "Dependency Mapping"
    ],
    workflow: [
      "Ingest Requirements (Text/Docs)",
      "Analyze Context & Constraints",
      "Draft Technical Spec",
      "Generate Tasks & Acceptance Criteria"
    ],
    benefits: [
      "Eliminates ambiguity before development starts",
      "Ensures all edge cases are considered early",
      "Saves hours of manual ticket writing"
    ],
    useCases: [
      "Converting a 1-page idea into a development sprint",
      "Planning a database migration strategy",
      "Documenting existing legacy features"
    ],
    seoTitle: "Planning Agent | Athira Technology",
    seoDescription: "The Planning Agent analyzes requirements, creates technical specs, and breaks down epics into sub-tasks autonomously."
  },
  { 
    id: "design",
    slug: "design",
    name: "Design Agent", 
    icon: PenTool, 
    shortDescription: "Architects system design, database schemas, and API contracts based on the planning phase.",
    fullDescription: "The Design Agent takes the technical specifications and creates the structural blueprint for your application. It designs optimized database schemas, defines robust API contracts (REST or GraphQL), and establishes the overall system architecture, ensuring scalability and maintainability.",
    capabilities: [],
    workflow: [],
    benefits: [],
    useCases: [],
    seoTitle: "Design Agent | Athira Technology",
    seoDescription: "Architect system design, database schemas, and API contracts with our autonomous Design Agent."
  },
  { 
    id: "development",
    slug: "development",
    name: "Development Agent", 
    icon: Braces, 
    shortDescription: "The core engineer. Writes clean, type-safe code using the agreed-upon architecture.",
    fullDescription: "The Development Agent is your tireless Senior Engineer. It writes clean, idiomatic, and type-safe code following enterprise best practices. It understands the full context of your repository and implements features exactly as specified in the design phase.",
    capabilities: [],
    workflow: [],
    benefits: [],
    useCases: [],
    seoTitle: "Development Agent | Athira Technology",
    seoDescription: "Write clean, type-safe code automatically with the Athira Development Agent."
  },
  { 
    id: "testing",
    slug: "testing",
    name: "Testing Agent", 
    icon: Bug, 
    shortDescription: "Generates unit, integration, and E2E tests. Ensures 90%+ code coverage before PR merges.",
    fullDescription: "The Testing Agent ensures your code is bulletproof. It automatically generates unit tests, integration tests, and end-to-end tests for every new feature or bug fix. It integrates directly into your CI pipeline to block merges that drop coverage.",
    capabilities: [],
    workflow: [],
    benefits: [],
    useCases: [],
    seoTitle: "Testing Agent | Athira Technology",
    seoDescription: "Automate your QA process with the Athira Testing Agent. Generate unit, integration, and E2E tests."
  },
  { 
    id: "deployment",
    slug: "deployment",
    name: "Deployment Agent", 
    icon: Rocket, 
    shortDescription: "Manages CI/CD pipelines, handles environment variables, and orchestrates rollouts.",
    fullDescription: "The Deployment Agent takes the pain out of releases. It orchestrates complex deployments, manages environment configurations, and can handle canary releases or blue-green deployments securely.",
    capabilities: [],
    workflow: [],
    benefits: [],
    useCases: [],
    seoTitle: "Deployment Agent | Athira Technology",
    seoDescription: "Manage CI/CD pipelines and orchestrate complex rollouts with the Athira Deployment Agent."
  },
  { 
    id: "monitoring",
    slug: "monitoring",
    name: "Monitoring Agent", 
    icon: Activity, 
    shortDescription: "Watches production logs, auto-reverts bad deployments, and alerts on anomalies.",
    fullDescription: "The Monitoring Agent acts as your autonomous SRE. It watches production logs, detects anomalies, and can automatically revert bad deployments or scale infrastructure based on real-time metrics.",
    capabilities: [],
    workflow: [],
    benefits: [],
    useCases: [],
    seoTitle: "Monitoring Agent | Athira Technology",
    seoDescription: "Watch production logs and detect anomalies with the autonomous Athira Monitoring Agent."
  },
  { 
    id: "documentation",
    slug: "documentation",
    name: "Documentation Agent", 
    icon: FileText, 
    shortDescription: "Keeps READMEs, Swagger docs, and internal wikis up-to-date with code changes.",
    fullDescription: "The Documentation Agent ensures your docs never fall out of date. It automatically updates READMEs, API documentation, and internal wikis whenever the codebase changes, extracting clear explanations from the code itself.",
    capabilities: [],
    workflow: [],
    benefits: [],
    useCases: [],
    seoTitle: "Documentation Agent | Athira Technology",
    seoDescription: "Keep your documentation up-to-date automatically with the Athira Documentation Agent."
  },
];

export function getAgentBySlug(slug: string): Agent | undefined {
  return agentsData.find(agent => agent.slug === slug);
}
