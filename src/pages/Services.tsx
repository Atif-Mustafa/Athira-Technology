import { motion } from "motion/react";
import { Server, Code, Shield, GitBranch } from "lucide-react";

export function Services() {
  const services = [
    {
      icon: <Code className="w-8 h-8" />,
      title: "AI-Driven Development",
      desc: "End-to-end software engineering managed by specialized AI agents. From boilerplate to complex business logic."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Security Auditing",
      desc: "Continuous, automated security scanning and vulnerability patching using our Security Agent."
    },
    {
      icon: <Server className="w-8 h-8" />,
      title: "Cloud Infrastructure",
      desc: "Infrastructure as Code (IaC) generation and cloud deployment management handled autonomously."
    },
    {
      icon: <GitBranch className="w-8 h-8" />,
      title: "Legacy Modernization",
      desc: "Automated refactoring of legacy codebases into modern frameworks without breaking tests."
    }
  ];

  return (
    <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Enterprise AI Services</h1>
        <p className="text-slate-400 text-lg">
          Athira provides a comprehensive suite of AI-powered services to accelerate your software development lifecycle.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {services.map((svc, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-slate-950/40 border border-slate-800 rounded-2xl hover:border-white/30 transition-colors"
          >
            <div className="text-white mb-6 bg-slate-900/50 inline-block p-4 rounded-xl">
              {svc.icon}
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">{svc.title}</h3>
            <p className="text-slate-400 leading-relaxed">{svc.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
