import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AgentIcon } from "../../../components/agents/AgentIcon";
import { CallToAction } from "../../../components/marketing/CallToAction";
import { PageHero } from "../../../components/marketing/PageHero";
import { Container, Section, SectionHeading } from "../../../components/marketing/Section";
import { StructuredData } from "../../../components/seo/StructuredData";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { agentsData } from "../../../content/agents";
import { breadcrumbStructuredData, createMetadata } from "../../../lib/seo";

export const metadata = createMetadata({
  title: "SDLC Agents",
  description: "Explore seven specialized, human-reviewed agent concepts spanning planning, design, development, testing, deployment, monitoring, and documentation.",
  path: "/agents",
});

export default function AgentsOverviewPage() {
  return (
    <>
      <StructuredData data={breadcrumbStructuredData([{ name: "Home", path: "/" }, { name: "SDLC Agents", path: "/agents" }])} />
      <PageHero
        eyebrow="Seven specialist roles"
        title="A coordinated agent model for the complete SDLC"
        description="Each planned Athira agent has a bounded responsibility, explicit artifacts, and human review points. Together they form the lifecycle model behind the AI Software Engineer."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "SDLC Agents" }]}
      />
      <Section aria-labelledby="agents-heading">
        <Container>
          <SectionHeading id="agents-heading" eyebrow="Lifecycle map" title="Explore every agent responsibility" description="The descriptions below present intended workflows. They do not claim that production agents or tool integrations are running in this repository." />
          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agentsData.map((agent, index) => (
              <li key={agent.id}>
                <Link href={`/agents/${agent.slug}`} className="group block h-full rounded-2xl">
                  <Card className="h-full transition-colors group-hover:border-blue-500/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-blue-400">
                          <AgentIcon icon={agent.icon} className="h-7 w-7" />
                        </span>
                        <span className="text-sm font-semibold text-slate-400">0{index + 1}</span>
                      </div>
                      <CardTitle as="h3" className="pt-5 group-hover:text-blue-300">{agent.name}</CardTitle>
                      <p className="text-sm font-medium text-blue-400">{agent.label}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="leading-7">{agent.shortDescription}</p>
                      <span className="mt-5 inline-flex items-center text-sm font-semibold text-slate-200">Explore responsibility <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></span>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
      <CallToAction title="Choose one handoff worth improving" description="A useful pilot starts with a bounded responsibility, named reviewers, and clear evidence—not an autonomous transformation claim." primaryLabel="Discuss an agent workflow" />
    </>
  );
}
