import { motion } from "motion/react";
import { Code, Shield, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center relative"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none"></div>
      
      <div className="max-w-4xl space-y-8 mt-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center space-x-2 border border-blue-500/30 bg-blue-500/5 text-blue-400 px-3 py-1 text-xs font-semibold uppercase tracking-widest rounded-full"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span>Athira v2.0 is now live</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]"
        >
          Intelligence for the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            modern SDLC.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-slate-400 max-w-xl mx-auto"
        >
          Athira provides autonomous AI agents that handle planning, development, testing, and deployment. Build faster with the most advanced AI software engineer.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4"
        >
          <Link
            to="/contact"
            className="w-full sm:w-auto px-8 py-3 bg-white text-slate-950 font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center"
          >
            Get Started <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <Link
            to="/ai-engineer"
            className="w-full sm:w-auto px-8 py-3 border border-slate-700 bg-slate-900/50 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Meet the AI Engineer
          </Link>
        </motion.div>
      </div>

      {/* Feature Grid */}
      <div className="w-full max-w-7xl mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left pb-32 relative z-10">
        {[
          {
            icon: <Code className="w-6 h-6" />,
            title: "Autonomous Coding",
            desc: "From architecture to implementation, our AI writes clean, type-safe, and scalable code."
          },
          {
            icon: <Shield className="w-6 h-6" />,
            title: "Enterprise Security",
            desc: "SOC2 compliant, zero-retention memory models, and end-to-end encryption for your IP."
          },
          {
            icon: <Zap className="w-6 h-6" />,
            title: "Lightning Fast CI/CD",
            desc: "Agents integrate directly into your GitHub Actions pipeline for instant deployment."
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + (i * 0.1) }}
            className="bg-slate-950/40 border border-slate-800 p-8 rounded-xl hover:border-blue-500/50 transition-colors group"
          >
            <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-blue-500 mb-6 group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
            <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
