import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleAlert } from "lucide-react";
import { AgentIcon } from "../../../components/agents/AgentIcon";
import { CallToAction } from "../../../components/marketing/CallToAction";
import { FaqList } from "../../../components/marketing/FaqList";
import { PageHero } from "../../../components/marketing/PageHero";
import { Container, Section, SectionHeading } from "../../../components/marketing/Section";
import { WorkflowVisual } from "../../../components/marketing/WorkflowVisual";
import { StructuredData } from "../../../components/seo/StructuredData";
import { ButtonLink } from "../../../components/ui/Button";
import { agentsData } from "../../../content/agents";
import { integrationCategories } from "../../../content/marketing";
import { aiSoftwareEngineerContent as content } from "../../../content/product";
import { breadcrumbStructuredData, createMetadata, faqStructuredData, softwareApplicationStructuredData } from "../../../lib/seo";

export const metadata = createMetadata({
  title: "AI Software Engineer",
  description: "Explore Athira Technology's planned AI Software Engineer: a human-reviewed coordination model for seven specialized SDLC agents.",
  path: "/ai-software-engineer",
});

export default function AiSoftwareEngineerPage() {
  return (
    <>
      <StructuredData data={[
        softwareApplicationStructuredData(),
        faqStructuredData(content.faqs),
        breadcrumbStructuredData([{ name: "Home", path: "/" }, { name: "AI Software Engineer", path: "/ai-software-engineer" }]),
      ]} />
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.summary}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "AI Software Engineer" }]}
        actions={<><ButtonLink href="/contact" size="lg">Plan a discovery <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></ButtonLink><ButtonLink href="/agents" variant="outline" size="lg">Meet the agents</ButtonLink></>}
        aside={<WorkflowVisual />}
      />

      <Section aria-labelledby="users-heading">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading id="users-heading" eyebrow="Intended users" title="For teams improving delivery without surrendering ownership" description="The product direction is relevant where workflow coordination and review quality matter as much as generation speed." />
            <ul className="content-list mt-8">{content.intendedUsers.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="rounded-3xl border border-amber-400/20 bg-amber-400/5 p-7 sm:p-9">
            <CircleAlert aria-hidden="true" className="h-7 w-7 text-amber-300" />
            <h2 className="mt-5 text-2xl font-bold text-white">Responsible positioning</h2>
            <p className="mt-4 leading-7 text-slate-300">This repository contains the public website, not a production AI platform. The workflows explain intended product behavior and provide a foundation for technical discovery; they do not demonstrate live agent execution.</p>
          </div>
        </Container>
      </Section>

      <Section tone="subtle" aria-labelledby="io-heading">
        <Container>
          <SectionHeading id="io-heading" eyebrow="Context and artifacts" title="Make inputs and outputs explicit" description="A coordinated workflow needs defined context boundaries and inspectable artifacts, not hidden state passed between agents." />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-7">
              <h3 className="text-xl font-semibold text-white">Expected inputs</h3>
              <ul className="content-list mt-6">{content.inputs.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-7">
              <h3 className="text-xl font-semibold text-white">Expected outputs</h3>
              <ul className="content-list mt-6">{content.outputs.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="lifecycle-heading">
        <Container>
          <SectionHeading id="lifecycle-heading" eyebrow="Multi-agent lifecycle" title="Specialized work, connected by approved context" description="Each lifecycle role prepares a bounded artifact and exposes questions before downstream work continues." />
          <div className="mt-12 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <ol className="space-y-3">
              {agentsData.map((agent) => (
                <li key={agent.slug}>
                  <Link href={`/agents/${agent.slug}`} className="group flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4 hover:border-blue-500/50">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-blue-400"><AgentIcon icon={agent.icon} className="h-5 w-5" /></span>
                    <span className="flex-1"><span className="block font-semibold text-white">{agent.name}</span><span className="text-sm text-slate-400">{agent.label}</span></span>
                    <ArrowRight aria-hidden="true" className="h-4 w-4 text-slate-600 group-hover:text-blue-400" />
                  </Link>
                </li>
              ))}
            </ol>
            <div>
              <h3 className="text-xl font-semibold text-white">Coordination model</h3>
              <ul className="content-list mt-6">{content.coordination.map((item) => <li key={item}>{item}</li>)}</ul>
              <h3 className="mt-10 text-xl font-semibold text-white">Human approval checkpoints</h3>
              <ol className="mt-6 space-y-4">
                {content.checkpoints.map((item, index) => (
                  <li key={item} className="flex gap-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <span className="font-semibold text-blue-300">0{index + 1}</span><span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="subtle" aria-labelledby="example-heading">
        <Container>
          <SectionHeading id="example-heading" eyebrow="Example workflow" title={content.example.title} description={content.example.context} />
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <ol className="space-y-4">
              {content.example.steps.map((step, index) => <li key={step} className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5"><span className="font-semibold text-blue-400">0{index + 1}</span><p className="leading-7 text-slate-300">{step}</p></li>)}
            </ol>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6"><h3 className="font-semibold text-amber-200">Illustrative outcome</h3><p className="mt-4 leading-7 text-slate-300">{content.example.outcome}</p></div>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="governance-heading">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading id="governance-heading" eyebrow="Governance and traceability" title="Design evidence around the decisions that matter" />
            <ul className="content-list mt-8">{content.governance.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <SectionHeading eyebrow="Security-conscious principles" title="Constrain context, permissions, and execution" />
            <ul className="content-list mt-8">{content.securityPrinciples.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </Container>
      </Section>

      <Section tone="subtle" aria-labelledby="integration-heading">
        <Container>
          <SectionHeading id="integration-heading" eyebrow="Integration approach" title="Plan connections by category and risk" description="Named products are examples of the environments teams may need to evaluate. No active connectors are represented by this site." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {integrationCategories.map((item) => <div key={item.name} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"><h3 className="font-semibold text-white">{item.name}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p><p className="mt-3 text-xs text-slate-400">Examples: {item.examples.join(", ")}</p></div>)}
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="limitations-heading">
        <Container>
          <SectionHeading id="limitations-heading" eyebrow="Current limitations" title="What this website does not claim" description="Responsible evaluation begins with a precise boundary between the proposed product and implemented capability." />
          <ul className="mt-10 grid gap-4 md:grid-cols-2">{content.limitations.map((item) => <li key={item} className="flex gap-3 rounded-2xl border border-slate-800 p-5 text-slate-300"><CheckCircle2 aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-slate-500" /><span className="leading-7">{item}</span></li>)}</ul>
        </Container>
      </Section>

      <Section tone="subtle" aria-labelledby="faq-heading">
        <Container className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionHeading id="faq-heading" eyebrow="Product FAQ" title="Questions for a technical evaluation" />
          <FaqList faqs={content.faqs} />
        </Container>
      </Section>
      <CallToAction title="Frame a narrow, review-led pilot" description="Map the source context, desired artifact, integration boundary, evaluation criteria, and accountable reviewers before deciding what to build." />
    </>
  );
}
