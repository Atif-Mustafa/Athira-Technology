import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { agentsData } from "./AgentsOverview";

export function AgentDetail() {
  const { id } = useParams();
  const agent = agentsData.find(a => a.id === id);

  if (!agent) {
    return (
      <div className="pt-32 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Agent Not Found</h1>
        <Link to="/agents" className="text-slate-400 hover:text-white underline">Back to Agents</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link to="/agents" className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-12 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Swarm Overview
      </Link>
      
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:w-1/3"
        >
          <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-blue-500 mb-8">
            {agent.icon}
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{agent.name}</h1>
          <p className="text-slate-400 text-lg leading-relaxed">{agent.desc}</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:w-2/3 bg-slate-950/40 border border-slate-800 p-8 rounded-2xl w-full"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Key Responsibilities</h3>
          <ul className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <li key={item} className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-blue-500 mr-4 shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  {id === "development" ? "Generates unit-testable components utilizing standard design patterns." 
                    : id === "testing" ? "Automates playwright regression tests based on PR context." 
                    : "Processes natural language requests into structured architectural tasks."}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-12 pt-8 border-t border-slate-800">
            <h3 className="text-xl font-semibold text-white mb-4">Integration Details</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The {agent.name} seamlessly connects with your existing stack. It can read directly from your GitHub repositories, Jira boards, or linear tickets depending on the required context.
            </p>
            <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-colors">
              Request Demo
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
