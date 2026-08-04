import { motion } from "motion/react";
import { Terminal, Cpu, Braces, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function AiSoftwareEngineer() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center space-x-2 border border-blue-500/30 bg-blue-500/5 text-blue-400 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest mb-8"
          >
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>Meet your new Senior Dev</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1]"
          >
            The AI Software Engineer
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-slate-400 max-w-xl mx-auto"
          >
            Athira's core AI Engineer agent doesn't just autocomplete code—it architects, writes, tests, and refactors entire repositories autonomously while adhering to enterprise standards.
          </motion.p>
        </div>

        {/* Feature Blocks */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-blue-500 mb-6">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold text-white">Full Context Awareness</h3>
            <p className="text-slate-400 text-lg leading-relaxed">
              Unlike standard coding assistants, Athira builds a semantic graph of your entire codebase. It understands dependencies, architecture patterns, and custom conventions before writing a single line of code.
            </p>
            <ul className="space-y-3 pt-4">
              {["Deep repository indexing", "Automated convention learning", "Dependency graph resolution"].map((item, i) => (
                <li key={i} className="flex items-center text-slate-300">
                  <ArrowRight className="w-4 h-4 mr-3 text-slate-500" /> {item}
                </li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-950/40 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors p-6 font-mono text-sm overflow-hidden relative group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
              </div>
              <span className="text-slate-500">agent.ts</span>
            </div>
            <pre className="text-slate-300 overflow-x-auto">
              <code>{`// Athira Agent analyzing PR #42
async function resolveIssue(context: CodebaseContext) {
  const diff = await analyzeDiff(context.changes);
  
  if (diff.introducesSecurityRisk()) {
    await blockMerge({
      reason: "Potential SQL Injection in UserHandler",
      fix: generateSecureQuery(diff.target)
    });
  }
  
  return runTestSuite(context.scope);
}`}</code>
            </pre>
          </motion.div>
        </div>

        {/* Capabilities Grid */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Core Capabilities</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Automated Refactoring",
                desc: "Safely modernizes legacy codebases by incrementally upgrading frameworks and patterns while ensuring test coverage passes."
              },
              {
                title: "Bug Resolution",
                desc: "Ingests bug reports or Sentry logs, reproduces the issue in a sandbox, and submits a PR with the fix and regression tests."
              },
              {
                title: "Feature Implementation",
                desc: "Takes a product spec and generates the backend models, API routes, and frontend components in one cohesive PR."
              }
            ].map((cap, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-950/40 border border-slate-800 hover:border-blue-500/50 transition-colors group p-8 rounded-2xl"
              >
                <Braces className="w-8 h-8 text-blue-500 group-hover:text-blue-400 transition-colors mb-4" />
                <h4 className="text-xl font-bold text-white mb-3">{cap.title}</h4>
                <p className="text-slate-400">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
