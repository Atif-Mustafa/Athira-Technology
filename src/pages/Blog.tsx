import { motion } from "motion/react";

export function Blog() {
  const posts = [
    { title: "The Future of AI in Software Engineering", date: "August 4, 2026", category: "Engineering" },
    { title: "Announcing Athira v2.0: Autonomous SDLC", date: "July 28, 2026", category: "Product" },
    { title: "How we fine-tuned our Planning Agent", date: "July 15, 2026", category: "Research" },
    { title: "Security at Scale with AI", date: "June 30, 2026", category: "Security" },
  ];

  return (
    <div className="pt-24 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Blog</h1>
        <p className="text-slate-400 text-lg">Insights, updates, and engineering deep dives from the Athira team.</p>
      </div>

      <div className="space-y-8">
        {posts.map((post, i) => (
          <motion.article 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer border-b border-slate-800 pb-8 hover:border-white/30 transition-colors"
          >
            <div className="flex items-center space-x-4 mb-3">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-white">
                {post.category}
              </span>
              <span className="text-sm text-slate-500">{post.date}</span>
            </div>
            <h2 className="text-2xl font-bold text-white group-hover:text-slate-300 transition-colors">
              {post.title}
            </h2>
            <p className="mt-3 text-slate-400 max-w-3xl">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
            </p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
