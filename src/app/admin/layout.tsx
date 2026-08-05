import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Athira Technology",
  description: "Manage agents, users, and content.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500 selection:text-white flex flex-col">
      {/* Migration Placeholder: A real admin layout would include sidebar/navigation here */}
      <header className="bg-slate-950/50 backdrop-blur-md border-b border-slate-800/60 h-16 flex items-center px-6">
        <span className="text-white font-bold text-xl tracking-tight">Athira<span className="text-blue-500">Tech</span> Admin</span>
      </header>
      <main className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full">
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl mb-6">
          <p className="font-medium text-sm">Migration Placeholder: Authentication and authorization will be handled server-side.</p>
        </div>
        {children}
      </main>
    </div>
  );
}
