import Link from "next/link";
import { footerGroups } from "../../content/marketing";

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/40 py-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full opacity-90" />
              </div>
              <span className="text-white font-bold text-lg">Athira<span className="text-blue-500">Tech</span></span>
            </div>
            <p className="text-sm text-slate-400">
              A planned, human-reviewed AI Software Engineer for connected software-delivery workflows.
            </p>
          </div>
          {footerGroups.map((group) => (
            <nav key={group.title} aria-label={`${group.title} links`}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">{group.title}</h2>
              <ul className="space-y-3 text-sm">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="rounded-sm transition-colors hover:text-blue-400">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800/40 text-sm text-center flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Athira Technology. Product capabilities shown are planned unless stated otherwise.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
