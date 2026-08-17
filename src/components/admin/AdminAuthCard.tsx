import Link from "next/link";
import type { ReactNode } from "react";

type AdminAuthCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AdminAuthCard({ eyebrow, title, description, children }: AdminAuthCardProps) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="text-lg font-bold tracking-tight text-white">
          Athira<span className="text-blue-500">Tech</span>
        </Link>
        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-blue-950/20 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
