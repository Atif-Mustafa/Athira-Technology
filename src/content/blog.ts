export type BlogSection = {
  heading: string;
  paragraphs: string[];
  points?: string[];
};

export type BlogArticle = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  category: string;
  sections: BlogSection[];
  relatedSlugs: string[];
};

export const blogArticles: BlogArticle[] = [
  {
    slug: "multi-agent-systems-for-the-sdlc",
    title: "How multi-agent systems can support the software lifecycle",
    summary: "A practical model for dividing AI-assisted work by lifecycle responsibility without losing shared context or human ownership.",
    description: "Explore how specialist agents can support planning, design, development, testing, deployment, monitoring, and documentation as one governed workflow.",
    author: "Athira Technology editorial team",
    publishedAt: "2026-07-10",
    updatedAt: "2026-07-10",
    readingTime: "7 min read",
    category: "Product architecture",
    sections: [
      {
        heading: "Why specialization matters",
        paragraphs: [
          "Software delivery is not one task. It is a chain of decisions, artifacts, reviews, and operational responsibilities. A single undifferentiated assistant can generate useful text or code, but it may blur who owns each decision and what evidence should move forward.",
          "A multi-agent model assigns a bounded role to each lifecycle stage. The value is less about giving agents personalities and more about defining inputs, permitted actions, outputs, and review criteria for each responsibility.",
        ],
      },
      {
        heading: "Shared context needs boundaries",
        paragraphs: [
          "Coordination does not mean every agent needs every document or repository secret. A work item can carry the approved requirement, relevant constraints, artifact links, and review status while each specialist receives only the context needed for its task.",
        ],
        points: [
          "Planning should expose assumptions and unresolved ambiguity.",
          "Design should record options and why one was approved.",
          "Implementation should remain scoped to agreed interfaces and repository areas.",
          "Testing should trace checks back to risks and acceptance criteria.",
        ],
      },
      {
        heading: "Treat artifacts as contracts",
        paragraphs: [
          "The handoff between stages becomes more reliable when each output has a known shape: acceptance criteria, an architecture decision, a change proposal, a verification report, or a release checklist. These artifacts give people something concrete to review and give the next stage explicit constraints.",
          "This also makes partial adoption possible. A team can improve one handoff, measure whether the artifact is useful, and stop without committing to autonomous end-to-end delivery.",
        ],
      },
      {
        heading: "Keep accountability human",
        paragraphs: [
          "Specialization does not remove the need for engineering judgment. Product owners approve intent, architects approve consequential designs, developers accept code, quality owners assess evidence, and authorized operators control releases. Agent output should help those decisions, not conceal them.",
        ],
      },
    ],
    relatedSlugs: ["human-approval-in-ai-assisted-development", "traceable-ai-engineering-workflows"],
  },
  {
    slug: "human-approval-in-ai-assisted-development",
    title: "Where human approval belongs in AI-assisted development",
    summary: "Approval gates are most useful where intent, architecture, accepted code, quality evidence, and operational risk change hands.",
    description: "Learn how to place proportionate human review points throughout an AI-assisted software-delivery workflow.",
    author: "Athira Technology editorial team",
    publishedAt: "2026-07-17",
    updatedAt: "2026-07-17",
    readingTime: "6 min read",
    category: "Governance",
    sections: [
      {
        heading: "Approval is a design decision",
        paragraphs: [
          "Adding a person after every generated sentence creates delay without necessarily reducing risk. Removing people from consequential decisions creates the opposite problem. Good workflow design places review where authority, cost, or exposure changes.",
          "The right gate depends on the system and organization, but five decision boundaries are broadly useful: intent, architecture, accepted implementation, quality evidence, and release authorization.",
        ],
      },
      {
        heading: "Review the intent before the artifact",
        paragraphs: [
          "A polished technical plan can still solve the wrong problem. Before design begins, a responsible product or domain owner should confirm scope, constraints, acceptance criteria, and known exclusions. Ambiguity should be visible rather than silently resolved by a model.",
        ],
      },
      {
        heading: "Make technical review proportionate",
        paragraphs: [
          "Architecture and code review should focus attention according to consequence. A documentation correction and a change to authorization logic should not travel through identical gates. Repository policy, affected data, deployment reach, and reversibility can help determine the required reviewers.",
        ],
        points: [
          "Show the source context used to prepare a proposal.",
          "Highlight assumptions, changed interfaces, and unresolved risks.",
          "Preserve reviewer comments and resulting revisions.",
          "Require explicit authorization for release or destructive actions.",
        ],
      },
      {
        heading: "Approval needs evidence",
        paragraphs: [
          "A button labelled approve is not meaningful if the reviewer cannot see what was checked. Link the decision to the requirement, proposed change, test result, exception, rollback plan, and named owner. The goal is an understandable decision record, not a larger activity log.",
        ],
      },
    ],
    relatedSlugs: ["traceable-ai-engineering-workflows", "multi-agent-systems-for-the-sdlc"],
  },
  {
    slug: "traceable-ai-engineering-workflows",
    title: "Designing traceable AI software-engineering workflows",
    summary: "Traceability connects source intent, generated artifacts, human decisions, and delivered changes without pretending every event is equally important.",
    description: "A practical guide to designing useful trace links and decision records for AI-assisted engineering workflows.",
    author: "Athira Technology editorial team",
    publishedAt: "2026-07-24",
    updatedAt: "2026-07-24",
    readingTime: "8 min read",
    category: "Engineering operations",
    sections: [
      {
        heading: "Start with the questions you need to answer",
        paragraphs: [
          "Traceability is useful when it helps a team understand why a change exists, which inputs shaped it, who accepted it, and how it was verified. Capturing every intermediate token or tool event can create volume without clarity.",
          "Begin with operational and review questions, then preserve the smallest set of records that can answer them reliably.",
        ],
      },
      {
        heading: "Use stable identifiers across artifacts",
        paragraphs: [
          "A requirement, design decision, implementation change, test case, and release record should be linkable even when they live in different systems. Stable work-item and decision identifiers help maintain that thread without forcing all content into one platform.",
        ],
        points: [
          "Reference the approved source requirement and version.",
          "Identify generated artifacts and the context boundary used.",
          "Record review disposition and consequential revisions.",
          "Link verification and release evidence to the accepted change.",
        ],
      },
      {
        heading: "Separate facts, proposals, and decisions",
        paragraphs: [
          "Generated content should not look like an approved decision. Label observations, recommendations, unresolved questions, and accepted outcomes differently. This makes the interface easier to evaluate and reduces the risk that a draft is treated as policy.",
        ],
      },
      {
        heading: "Plan for exceptions and retention",
        paragraphs: [
          "Real workflows branch, fail, and require overrides. Trace design should explain who can override a gate and why. It should also define how long source context and generated records are kept, where they reside, and who can inspect them. Those choices are customer-specific governance decisions, not assumptions a product page can settle.",
        ],
      },
    ],
    relatedSlugs: ["human-approval-in-ai-assisted-development", "multi-agent-systems-for-the-sdlc"],
  },
];

export function getBlogArticleBySlug(slug: string): BlogArticle | undefined {
  return blogArticles.find((article) => article.slug === slug);
}
