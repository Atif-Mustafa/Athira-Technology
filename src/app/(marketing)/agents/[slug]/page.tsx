import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { AgentIcon } from "../../../../components/agents/AgentIcon";
import { CallToAction } from "../../../../components/marketing/CallToAction";
import { FaqList } from "../../../../components/marketing/FaqList";
import { PageHero } from "../../../../components/marketing/PageHero";
import { Container, Section, SectionHeading } from "../../../../components/marketing/Section";
import { StructuredData } from "../../../../components/seo/StructuredData";
import { ButtonLink } from "../../../../components/ui/Button";
import { agentsData, getAdjacentAgents, getAgentBySlug } from "../../../../content/agents";
import { breadcrumbStructuredData, createMetadata, faqStructuredData } from "../../../../lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);

  if (!agent) {
    return { title: "Agent Not Found", robots: { index: false, follow: false } };
  }

  return createMetadata({
    title: agent.seoTitle,
    description: agent.seoDescription,
    path: `/agents/${agent.slug}`,
  });
}

export function generateStaticParams() {
  return agentsData.map((agent) => ({ slug: agent.slug }));
}

export default async function AgentDetailPage({ params }: Props) {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);

  if (!agent) notFound();

  const { previous, next } = getAdjacentAgents(agent.slug);
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "SDLC Agents", path: "/agents" },
    { name: agent.name, path: `/agents/${agent.slug}` },
  ];

  return (
    <>
      <StructuredData data={[breadcrumbStructuredData(breadcrumbs), faqStructuredData(agent.faqs)]} />
      <PageHero
        eyebrow={agent.label}
        title={agent.name}
        description={agent.purpose}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "SDLC Agents", href: "/agents" }, { label: agent.name }]}
        actions={<><ButtonLink href="/contact" size="lg">Discuss this workflow</ButtonLink><ButtonLink href="/ai-software-engineer" variant="outline" size="lg">See the coordination model</ButtonLink></>}
        aside={
          <div className="mx-auto flex h-52 w-full max-w-sm items-center justify-center rounded-3xl border border-slate-700 bg-slate-950/70 text-blue-400 shadow-2xl shadow-blue-950/20">
            <AgentIcon icon={agent.icon} className="h-24 w-24" />
          </div>
        }
      />

      <Section aria-labelledby="responsibility-heading">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading id="responsibility-heading" eyebrow="Responsibility" title="Problems this agent is designed to address" />
            <ul className="content-list mt-8">{agent.problems.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
              <h3 className="font-semibold text-white">Expected inputs</h3>
              <ul className="content-list mt-5 text-sm">{agent.inputs.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
              <h3 className="font-semibold text-white">Expected outputs</h3>
              <ul className="content-list mt-5 text-sm">{agent.outputs.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="subtle" aria-labelledby="workflow-heading">
        <Container>
          <SectionHeading id="workflow-heading" eyebrow="Proposed workflow" title={`How the ${agent.name} would structure its work`} description="Every stage produces an inspectable artifact or decision request before downstream work continues." />
          <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {agent.workflow.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
                <span className="text-sm font-semibold text-blue-400">0{index + 1}</span>
                <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{step.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section aria-labelledby="capabilities-heading">
        <Container className="grid gap-12 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <SectionHeading id="capabilities-heading" eyebrow="Capabilities" title="A bounded assistance model" />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {agent.capabilities.map((item) => (
                <li key={item} className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />{item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-white">Human review checkpoints</h3>
            <ol className="mt-6 space-y-5">
              {agent.humanCheckpoints.map((item, index) => (
                <li key={item} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-semibold text-blue-300">{index + 1}</span>
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <Section tone="subtle" aria-labelledby="scenario-heading">
        <Container>
          <SectionHeading id="scenario-heading" eyebrow="Illustrative scenario" title={agent.exampleScenario.title} description={agent.exampleScenario.context} />
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <ol className="space-y-4">
              {agent.exampleScenario.steps.map((step, index) => (
                <li key={step} className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                  <span className="font-semibold text-blue-400">0{index + 1}</span>
                  <p className="leading-7 text-slate-300">{step}</p>
                </li>
              ))}
            </ol>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
              <h3 className="font-semibold text-amber-200">Positioning note</h3>
              <p className="mt-4 leading-7 text-slate-300">{agent.exampleScenario.outcome}</p>
            </div>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="governance-heading">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading id="governance-heading" eyebrow="Integration approach" title="Tool categories, not claimed connectors" description="A future implementation could connect to these categories after access, data handling, failure modes, and customer controls are validated." />
            <ul className="content-list mt-8">{agent.integrations.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <SectionHeading eyebrow="Governance" title="Controls to resolve during implementation" />
            <ul className="content-list mt-8">{agent.governance.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </Container>
      </Section>

      <Section tone="subtle" aria-labelledby="faq-heading">
        <Container className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionHeading id="faq-heading" eyebrow={`${agent.name} FAQ`} title="Questions for responsible evaluation" />
          <FaqList faqs={agent.faqs} />
        </Container>
      </Section>

      <Section className="py-12" aria-label="Adjacent agents">
        <Container>
          <nav aria-label="Previous and next agent" className="grid gap-4 sm:grid-cols-2">
            {previous ? (
              <Link href={`/agents/${previous.slug}`} className="rounded-2xl border border-slate-800 p-5 hover:border-blue-500/50">
                <span className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400"><ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />Previous agent</span>
                <span className="mt-2 block font-semibold text-white">{previous.name}</span>
              </Link>
            ) : <span />}
            {next ? (
              <Link href={`/agents/${next.slug}`} className="rounded-2xl border border-slate-800 p-5 text-right hover:border-blue-500/50">
                <span className="flex items-center justify-end text-xs font-semibold uppercase tracking-wider text-slate-400">Next agent<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></span>
                <span className="mt-2 block font-semibold text-white">{next.name}</span>
              </Link>
            ) : <span />}
          </nav>
        </Container>
      </Section>

      <CallToAction title={`Evaluate a ${agent.name} workflow`} description="Define the source context, desired artifact, responsible reviewers, and safe integration boundary before discussing implementation." primaryLabel="Discuss this agent" />
    </>
  );
}
