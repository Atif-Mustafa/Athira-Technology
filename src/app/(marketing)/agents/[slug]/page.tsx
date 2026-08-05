import { notFound } from "next/navigation";
import { agentsData, getAgentBySlug } from "../../../../content/agents";
import { CheckCircle2 } from "lucide-react";
import { AgentIcon } from "../../../../components/agents/AgentIcon";
import { ButtonLink } from "../../../../components/ui/Button";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);
  
  if (!agent) {
    return { title: "Agent Not Found" };
  }
  
  return {
    title: agent.seoTitle,
    description: agent.seoDescription,
  };
}

export function generateStaticParams() {
  return agentsData.map((agent) => ({
    slug: agent.slug,
  }));
}

export default async function AgentDetailPage({ params }: Props) {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);

  if (!agent) {
    notFound();
  }

  return (
    <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="md:w-1/3">
          <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-blue-500 mb-8">
            <AgentIcon icon={agent.icon} className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{agent.name}</h1>
          <p className="text-xl text-blue-400 font-medium mb-6">Autonomous Component</p>
          {agent.capabilities.length > 0 ? (
            <section className="p-6 bg-slate-900/50 rounded-xl border border-slate-800" aria-labelledby="capabilities-heading">
              <h2 id="capabilities-heading" className="text-white font-semibold mb-4">Core Capabilities</h2>
              <ul className="space-y-4">
                {agent.capabilities.map((item) => (
                  <li key={item} className="flex items-start">
                    <CheckCircle2 aria-hidden="true" className="w-5 h-5 text-blue-500 mr-4 shrink-0 mt-0.5" />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section className="p-6 bg-slate-900/50 rounded-xl border border-slate-800" aria-labelledby="capabilities-heading">
              <h2 id="capabilities-heading" className="text-white font-semibold mb-2">Capabilities</h2>
              <p className="text-slate-400 text-sm">
                Detailed capability information is planned for a future product milestone.
              </p>
            </section>
          )}
        </div>

        <div className="md:w-2/3 space-y-8">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-white">Overview</h2>
            <p className="text-slate-300 leading-relaxed text-lg">{agent.fullDescription}</p>
          </div>
          
          <section className="p-8 border border-slate-800 bg-slate-950/40 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Integration Planning</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Integration details for the {agent.name} are being defined. Supported repositories, ticketing systems, and deployment environments will be documented after validation.
            </p>
            <ButtonLink href="/contact">Request Demo</ButtonLink>
          </section>
        </div>
      </div>
    </div>
  );
}
