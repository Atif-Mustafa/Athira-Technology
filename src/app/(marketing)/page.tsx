import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { AgentIcon } from "../../components/agents/AgentIcon";
import { CallToAction } from "../../components/marketing/CallToAction";
import { FaqList } from "../../components/marketing/FaqList";
import { MarketingIcon } from "../../components/marketing/MarketingIcon";
import { ProductPreview } from "../../components/marketing/ProductPreview";
import { Container, Section, SectionHeading } from "../../components/marketing/Section";
import { WorkflowVisual } from "../../components/marketing/WorkflowVisual";
import { StructuredData } from "../../components/seo/StructuredData";
import { Badge } from "../../components/ui/Badge";
import { ButtonLink } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { agentsData } from "../../content/agents";
import {
  engineeringChallenges,
  enterprisePrinciples,
  homepageFaqs,
  integrationCategories,
} from "../../content/marketing";
import { pricingPlans } from "../../content/pricing";
import { services } from "../../content/services";
import { faqStructuredData, softwareApplicationStructuredData } from "../../lib/seo";

const title = "Human-Reviewed AI for the Software Lifecycle";
const description = "Meet Athira Technology's planned AI Software Engineer: seven specialized SDLC agents designed around connected artifacts, human approvals, and traceable delivery.";

export const metadata: Metadata = {
  title: { absolute: `${title} | Athira Technology` },
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", title, description, url: "/" },
  twitter: { card: "summary_large_image", title, description },
};

export default function HomePage() {
  return (
    <>
      <StructuredData data={[softwareApplicationStructuredData(), faqStructuredData(homepageFaqs)]} />

      <header className="relative overflow-hidden border-b border-slate-800/70 py-20 sm:py-28 lg:py-32">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_38%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.12),transparent_40%)]" />
        <Container className="relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Badge className="mb-6 uppercase tracking-[0.18em]">Planned product platform</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              An AI Software Engineer built around the whole SDLC.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Athira Technology is designing seven specialized agents to coordinate planning, design, development, testing, deployment, monitoring, and documentation—with people approving consequential decisions.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/contact" size="lg">
                Plan a discovery <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/ai-software-engineer" variant="outline" size="lg">
                Explore the product model
              </ButtonLink>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-400">
              Product workflows shown on this site are illustrative. Production AI execution and integrations are not implemented in this repository.
            </p>
          </div>
          <WorkflowVisual />
        </Container>
      </header>

      <Section aria-labelledby="lifecycle-heading">
        <Container>
          <SectionHeading
            id="lifecycle-heading"
            eyebrow="Connected lifecycle"
            title="Seven specialists, one review-led delivery thread"
            description="Each agent owns a bounded artifact and passes approved context forward. Explore what every stage is intended to contribute."
          />
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {agentsData.map((agent, index) => (
              <li key={agent.slug}>
                <Link href={`/agents/${agent.slug}`} className="group block h-full rounded-2xl border border-slate-800 bg-slate-950/50 p-5 transition-colors hover:border-blue-500/50 hover:bg-slate-900/60">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-blue-400">
                      <AgentIcon icon={agent.icon} className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-semibold text-slate-400">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 font-semibold text-white group-hover:text-blue-300">{agent.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{agent.label}</p>
                </Link>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="subtle" aria-labelledby="challenge-heading">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeading
              id="challenge-heading"
              eyebrow="The engineering problem"
              title="Delivery context breaks at the handoffs"
              description="The proposed solution is not more isolated generation. It is a connected set of artifacts, constraints, and review decisions that can move through the lifecycle."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {engineeringChallenges.map((challenge) => (
                <Card key={challenge.title} className="p-1">
                  <CardHeader>
                    <MarketingIcon icon={challenge.icon} className="h-6 w-6 text-blue-400" />
                    <CardTitle className="pt-4">{challenge.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-7">{challenge.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="engineer-heading">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading
                id="engineer-heading"
                eyebrow="AI Software Engineer"
                title="Coordinate agents through explicit artifacts and approvals"
                description="The planned platform begins with approved intent, gives each specialist only the context it needs, and makes generated work visible before the next consequential step."
              />
              <ul className="content-list mt-8">
                <li>Inputs include requirements, repository context, engineering standards, and approval policies.</li>
                <li>Outputs include plans, design records, code proposals, verification evidence, release packages, and synchronized documentation.</li>
                <li>People remain responsible for scope, architecture, accepted code, quality, and release authorization.</li>
                <li>Trace links are intended to connect source intent, generated artifacts, revisions, and named review outcomes.</li>
              </ul>
              <ButtonLink href="/ai-software-engineer" variant="outline" className="mt-8">
                See the coordination model <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
              </ButtonLink>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">Review checkpoints</p>
              <ol className="mt-6 space-y-5">
                {["Intent and scope", "Architecture and interfaces", "Code and verification", "Release and operations"].map((item, index) => (
                  <li key={item} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-400/10 text-sm font-semibold text-blue-300">{index + 1}</span>
                    <div>
                      <h3 className="font-semibold text-white">{item}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-400">A named owner reviews the evidence and resolves exceptions before work advances.</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="subtle" aria-labelledby="preview-heading">
        <Container>
          <SectionHeading
            id="preview-heading"
            eyebrow="Interface concept"
            title="Make state, evidence, and decisions understandable"
            description="This illustrative dashboard shows the intended information hierarchy. It contains sample labels only and is not connected to customer systems."
          />
          <div className="mt-12"><ProductPreview /></div>
        </Container>
      </Section>

      <Section aria-labelledby="integrations-heading">
        <Container>
          <SectionHeading
            id="integrations-heading"
            eyebrow="Integration approach"
            title="Designed to meet teams in their existing toolchain"
            description="These are planned integration categories and example products—not claims of active connectors. Specific access and data flows require technical validation."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {integrationCategories.map((category) => (
              <Card key={category.name}>
                <CardHeader>
                  <MarketingIcon icon={category.icon} className="h-6 w-6 text-blue-400" />
                  <CardTitle className="pt-4">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-7">{category.description}</p>
                  <p className="mt-4 text-sm text-slate-400">Examples: {category.examples.join(", ")}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="subtle" aria-labelledby="readiness-heading">
        <Container>
          <SectionHeading
            id="readiness-heading"
            eyebrow="Enterprise readiness principles"
            title="Controls are design inputs, not marketing badges"
            description="Athira's product direction considers governance needs without claiming certifications, guarantees, or controls that have not been implemented and validated."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {enterprisePrinciples.map((principle) => (
              <div key={principle.title} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
                <MarketingIcon icon={principle.icon} className="h-6 w-6 text-blue-400" />
                <h3 className="mt-5 font-semibold text-white">{principle.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{principle.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="services-heading">
        <Container>
          <SectionHeading id="services-heading" eyebrow="Services" title="Move from an idea to a responsible implementation path" description="Athira Technology offers strategy, architecture, engineering, quality, and delivery support around clearly bounded initiatives." />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {services.slice(0, 3).map((service) => (
              <Card key={service.slug} className="h-full">
                <CardHeader>
                  <MarketingIcon icon={service.icon} className="h-6 w-6 text-blue-400" />
                  <CardTitle className="pt-4">{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-7">{service.summary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <ButtonLink href="/services" variant="outline" className="mt-8">Explore all services <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></ButtonLink>
        </Container>
      </Section>

      <Section tone="subtle" aria-labelledby="pricing-heading">
        <Container>
          <SectionHeading id="pricing-heading" eyebrow="Engagement options" title="Start at the level your workflow is ready for" description="Final prices are not published. Each option is scoped around workflow complexity, integrations, and governance requirements." />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div key={plan.slug} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
                <p className="text-sm font-semibold text-blue-400">{plan.priceLabel}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{plan.name}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{plan.targetUser}</p>
                <ul className="mt-5 space-y-3">
                  {plan.features.slice(0, 3).map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm text-slate-300"><CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <ButtonLink href="/pricing" variant="outline" className="mt-8">Compare engagement options <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></ButtonLink>
        </Container>
      </Section>

      <Section aria-labelledby="faq-heading">
        <Container className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionHeading id="faq-heading" eyebrow="Evaluation questions" title="What teams ask before a first conversation" description="Clear limitations are part of credible product evaluation." />
          <FaqList faqs={homepageFaqs} />
        </Container>
      </Section>

      <CallToAction />
    </>
  );
}
