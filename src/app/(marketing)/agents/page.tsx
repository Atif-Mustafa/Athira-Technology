import Link from "next/link";
import { agentsData } from "../../../content/agents";
import { AgentIcon } from "../../../components/agents/AgentIcon";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SDLC Agent Overview",
  description: "Explore seven planned AI-assisted components across the software development lifecycle.",
};

export default function AgentsOverview() {
  return (
    <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">The SDLC Agent Swarm</h1>
        <p className="text-slate-400 text-lg">
          Explore seven planned AI-assisted components across the software development lifecycle.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agentsData.map((agent) => (
          <Link key={agent.id} href={`/agents/${agent.slug}`} className="group">
            <Card className="h-full border-slate-800 hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <div className="text-blue-500 mb-2 bg-slate-900 border border-slate-800 w-16 h-16 flex items-center justify-center rounded-xl group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                  <AgentIcon icon={agent.icon} className="w-8 h-8" />
                </div>
                <CardTitle as="h2" className="mt-4">{agent.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm leading-relaxed">{agent.shortDescription}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
