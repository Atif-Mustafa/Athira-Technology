import { motion } from "motion/react";
import { Check } from "lucide-react";

export function Pricing() {
  return (
    <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Simple, transparent pricing</h1>
        <p className="text-slate-400 text-lg">
          Pay for the computing power you use. No hidden fees or complex seat licenses.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[
          {
            name: "Starter",
            price: "$49",
            desc: "Perfect for small teams and independent developers.",
            features: ["1 Active Agent", "Standard processing speed", "Community support", "100k lines/month"]
          },
          {
            name: "Pro",
            price: "$299",
            desc: "For growing companies needing more power.",
            popular: true,
            features: ["5 Active Agents", "Priority processing", "Dedicated Slack channel", "Unlimited code generation", "Custom knowledge base"]
          },
          {
            name: "Enterprise",
            price: "Custom",
            desc: "For large organizations with strict security needs.",
            features: ["Unlimited Agents", "Dedicated compute clusters", "24/7 Phone Support", "On-premise deployment options", "SOC2 compliance reporting"]
          }
        ].map((tier, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`p-8 rounded-3xl border ${tier.popular ? 'border-blue-500/50 bg-blue-500/5 relative' : 'border-slate-800 bg-slate-950/40 group hover:border-blue-500/50 transition-colors'}`}
          >
            {tier.popular && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                Most Popular
              </span>
            )}
            <h3 className="text-xl font-medium text-white mb-2">{tier.name}</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-white">{tier.price}</span>
              {tier.price !== "Custom" && <span className="text-slate-400">/mo</span>}
            </div>
            <p className="text-slate-400 text-sm mb-8 h-10">{tier.desc}</p>
            
            <button className={`w-full py-3 rounded-xl font-semibold transition-all mb-8 ${tier.popular ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20' : 'border border-slate-700 bg-slate-900/50 text-white hover:bg-slate-800'}`}>
              Get Started
            </button>
            
            <ul className="space-y-4">
              {tier.features.map((f, j) => (
                <li key={j} className="flex items-start text-sm text-slate-300">
                  <Check className="w-5 h-5 text-blue-500 mr-3 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
