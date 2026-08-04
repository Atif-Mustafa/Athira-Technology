import { motion } from "motion/react";

export function PagePlaceholder({ title }: { title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-24 min-h-[60vh] flex flex-col items-center justify-center text-center"
    >
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{title}</h1>
      <p className="text-slate-400 max-w-2xl">
        This section of Athira is currently under development. Check back soon for updates on our {title.toLowerCase()} capabilities.
      </p>
    </motion.div>
  );
}
