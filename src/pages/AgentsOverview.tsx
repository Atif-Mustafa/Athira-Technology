import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ClipboardList, PenTool, Braces, Bug, Rocket, Activity, FileText } from "lucide-react";

export const agentsData = [
  { id: "planning", name: "Planning Agent", icon: <ClipboardList className="w-8 h-8" />, desc: "Analyzes requirements, creates technical specs, and breaks down epics into sub-tasks." },
  { id: "design", name: "Design Agent", icon: <PenTool className="w-8 h-8" />, desc: "Architects system design, database schemas, and API contracts based on the planning phase." },
  { id: "development", name: "Development Agent", icon: <Braces className="w-8 h-8" />, desc: "The core engineer. Writes clean, type-safe code using the agreed-upon architecture." },
  { id: "testing", name: "Testing Agent", icon: <Bug className="w-8 h-8" />, desc: "Generates unit, integration, and E2E tests. Ensures 90%+ code coverage before PR merges." },
  { id: "deployment", name: "Deployment Agent", icon: <Rocket className="w-8 h-8" />, desc: "Manages CI/CD pipelines, handles environment variables, and orchestrates rollouts." },
  { id: "monitoring", name: "Monitoring Agent", icon: <Activity className="w-8 h-8" />, desc: "Watches production logs, auto-reverts bad deployments, and alerts on anomalies." },
  { id: "documentation", name: "Documentation Agent", icon: <FileText className="w-8 h-8" />, desc: "Keeps READMEs, Swagger docs, and internal wikis up-to-date with code changes." },
];

export function AgentsOverview() {
  return (
    <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">The SDLC Agent Swarm</h1>
        <p className="text-slate-400 text-lg">
          Seven specialized agents working in harmony to deliver production-ready software faster than ever before.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agentsData.map((agent, i) => (
          <Link key={agent.id} to={`/agent/${agent.id}`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-slate-950/40 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-colors h-full flex flex-col group"
            >
              <div className="text-blue-500 mb-6 bg-slate-900 border border-slate-800 w-16 h-16 flex items-center justify-center rounded-xl group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                {agent.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{agent.name}</h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-1">{agent.desc}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
